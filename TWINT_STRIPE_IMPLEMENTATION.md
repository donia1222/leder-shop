# TWINT via Stripe QR-Code — Guía de implementación completa

> Cómo añadir pago TWINT real (QR code / redirect app) con Stripe en una tienda Next.js + PHP.
> Mantener también el flujo TWINT manual como respaldo.

---

## Contexto

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Backend:** PHP + MySQL (API externa)
- **Stripe SDK:** `@stripe/stripe-js` + `@stripe/react-stripe-js`
- El checkout es una SPA — todo en `app/page.tsx` con estado `currentPage`

---

## PASO 1 — Base de datos

### 1.1 Tabla `payment_settings` — añadir columna PMC ID

```sql
ALTER TABLE payment_settings ADD COLUMN stripe_pmc_id VARCHAR(255) NOT NULL DEFAULT '';
```

> `stripe_pmc_id` almacena el ID de configuración de métodos de pago de Stripe (`pmc_...`).
> Se obtiene en Stripe Dashboard → Products → Payment method configurations.

---

## PASO 2 — PHP

### 2.1 `api/get_payment_settings.php` — dos cambios

**Añadir `stripe_pmc_id` a la lista de columnas de auto-migración:**

```php
$cols = ['paypal_email','stripe_secret_key','stripe_publishable_key','stripe_webhook_secret',
         'stripe_pmc_id','twint_phone','bank_iban','bank_holder','bank_name',
         'enable_paypal','enable_stripe','enable_twint','enable_invoice'];
```

**Devolver el campo en el JSON de respuesta:**

```php
'stripe_pmc_id' => $row['stripe_pmc_id'] ?? '',
```

---

### 2.2 `api/save_payment_settings.php` — tres cambios

**Añadir en INSERT:**
```sql
(id, paypal_email, stripe_publishable_key, stripe_secret_key, stripe_pmc_id, twint_phone, ...)
VALUES (1, :paypal_email, :stripe_publishable_key, :stripe_secret_key, :stripe_pmc_id, :twint_phone, ...)
```

**Añadir en ON DUPLICATE KEY UPDATE:**
```sql
stripe_pmc_id = VALUES(stripe_pmc_id),
```

**Añadir en el array de parámetros PHP:**
```php
':stripe_pmc_id' => trim($body['stripe_pmc_id'] ?? ''),
```

---

## PASO 3 — API Route Next.js

### `app/api/stripe/create-payment-intent/route.ts`

**Añadir `paymentMethodConfigId` al destructuring:**
```typescript
const { amount, currency, orderData, stripeSecretKey, paymentMethodTypes, paymentMethodConfigId } = await req.json()
```

**Cambiar la lógica de creación del PaymentIntent para soportar PMC:**
```typescript
const piBase: any = {
  amount,
  currency: currency || 'chf',
}

// Prioridad: PMC ID > payment_method_types > automatic
if (paymentMethodConfigId) {
  piBase.payment_method_configuration = paymentMethodConfigId
} else if (paymentMethodTypes && paymentMethodTypes.length > 0) {
  piBase.payment_method_types = paymentMethodTypes
} else {
  piBase.automatic_payment_methods = { enabled: true }
}

const paymentIntent = await stripe.paymentIntents.create({
  ...piBase,
  metadata: { ... },
  // resto de campos...
})
```

> **Importante:** `payment_method_configuration`, `payment_method_types` y `automatic_payment_methods`
> son **mutuamente exclusivos** — no se pueden usar juntos.

---

## PASO 4 — Componente StripeTwintPayment (nuevo archivo)

### `components/stripe-twint-payment.tsx`

Crear este componente desde cero:

```typescript
"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface StripeTwintPaymentProps {
  amount: number
  orderData: any
  publishableKey?: string
  secretKey?: string
  pmcId?: string                          // pmc_... del Stripe Dashboard
  disabled?: boolean
  returnUrl: string                       // URL a la que Stripe redirige tras el pago
  onSaveOrder: () => Promise<string>      // guarda pedido en DB, devuelve orderNumber
  onError: (msg: string) => void
}

const TwintForm = ({ amount, orderData, secretKey, pmcId, disabled, returnUrl, onSaveOrder, onError }: StripeTwintPaymentProps) => {
  const stripe = useStripe()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handlePay = async () => {
    if (!stripe || disabled) return
    setIsProcessing(true)
    setError("")

    try {
      // 1. Guardar pedido en DB primero — necesitamos el orderNumber para la return_url
      const orderNumber = await onSaveOrder()

      // 2. Crear PaymentIntent en el backend con método TWINT
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),       // en céntimos (Rappen)
          currency: 'chf',                         // TWINT solo funciona en CHF
          orderData: { ...orderData, orderId: orderNumber },
          stripeSecretKey: secretKey,
          paymentMethodConfigId: pmcId || undefined,
          paymentMethodTypes: pmcId ? undefined : ['twint'],
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Fehler beim Erstellen der Zahlung')
      }

      const { clientSecret } = await res.json()

      // 3. Stripe muestra QR code (desktop) o redirige a app TWINT (mobile)
      //    Se añade orderNumber y total a la return_url para recuperarlos al volver
      const finalReturnUrl = `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}twint_order=${orderNumber}&twint_total=${amount}`

      const { error: stripeError } = await stripe.confirmTwintPayment(clientSecret, {
        payment_method: {
          billing_details: {
            name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
            email: orderData.customerInfo.email,
          },
        },
        return_url: finalReturnUrl,
      })

      if (stripeError) {
        setError(stripeError.message || 'TWINT Zahlung fehlgeschlagen')
        onError(stripeError.message || 'TWINT Zahlung fehlgeschlagen')
      }
      // Si no hay error: Stripe redirige al usuario automáticamente
    } catch (err: any) {
      const msg = err.message || 'Unbekannter Fehler'
      setError(msg)
      onError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-800">Wie funktioniert es?</p>
        <p>📱 <strong>Mobile:</strong> Weiterleitung direkt zur TWINT-App</p>
        <p>🖥️ <strong>Desktop:</strong> QR-Code erscheint zum Scannen</p>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <Button
        onClick={handlePay}
        disabled={!stripe || isProcessing || disabled}
        className="w-full min-h-14 h-auto py-3 text-base font-bold bg-black hover:bg-neutral-800 text-white"
      >
        {isProcessing ? (
          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Weiterleitung zu TWINT...</>
        ) : (
          <>Via TWINT bezahlen · {amount.toFixed(2)} CHF</>
        )}
      </Button>
    </div>
  )
}

export function StripeTwintPayment(props: StripeTwintPaymentProps) {
  const key = props.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
      Stripe-Schlüssel nicht konfiguriert
    </div>
  )
  const stripePromise = loadStripe(key)
  return (
    <Elements stripe={stripePromise}>
      <TwintForm {...props} />
    </Elements>
  )
}
```

---

## PASO 5 — Checkout Page

### `components/checkout-page.tsx` — 6 modificaciones

#### 5.1 Import del nuevo componente
```typescript
import { StripeTwintPayment } from "./stripe-twint-payment"
```

#### 5.2 Añadir `"twint_stripe"` al tipo de método de pago
```typescript
const [paymentMethod, setPaymentMethod] = useState<
  "paypal" | "invoice" | "stripe" | "twint" | "twint_stripe"
>("invoice")
```

#### 5.3 Añadir `stripe_pmc_id` al estado de paySettings
```typescript
const [paySettings, setPaySettings] = useState({
  enable_paypal: false, enable_stripe: false, enable_twint: false, enable_invoice: true,
  paypal_email: "", stripe_publishable_key: "", stripe_secret_key: "", stripe_pmc_id: "",
  twint_phone: "", bank_iban: "", bank_holder: "", bank_name: "",
})
```

#### 5.4 useEffect — detectar retorno de Stripe TWINT
Añadir **antes** del useEffect de recálculo de envío:

```typescript
useEffect(() => {
  if (typeof window === "undefined") return
  const params = new URLSearchParams(window.location.search)
  const redirectStatus = params.get("redirect_status")
  const twintOrder = params.get("twint_order")
  const twintTotal = params.get("twint_total")

  if (redirectStatus === "succeeded" && twintOrder) {
    setOrderStatus("completed")
    setOrderDetails({
      id: twintOrder,
      status: "PAID",
      customerInfo: customerInfo,
      cart: [],
      total: twintTotal ? parseFloat(twintTotal) : 0,
    })
    if (onClearCart) onClearCart()
    window.history.replaceState({}, "", window.location.pathname)  // limpiar URL
  } else if (redirectStatus === "failed" && twintOrder) {
    setOrderStatus("error")
    window.history.replaceState({}, "", window.location.pathname)
  }
}, [])
```

#### 5.5 Handler para guardar el pedido antes de redirigir a Stripe
Añadir junto a `handleTwintPayment`:

```typescript
const handleStripeTwintSaveOrder = async (): Promise<string> => {
  if (!validateForm()) throw new Error("Bitte füllen Sie alle Pflichtfelder aus")
  if (!validateBillingAddress()) throw new Error("Rechnungsadresse ungültig")
  if (showCreateAccount && !validateAccountCreation()) throw new Error("Konto-Daten ungültig")

  const savedOrder = await saveOrderToDatabase({
    paymentMethod: "stripe_twint",
    paymentStatus: "pending",
  })
  return savedOrder.orderNumber
}
```

#### 5.6 Selector de método de pago — nueva tarjeta TWINT QR
Añadir **antes** del selector TWINT manual:

```tsx
{/* TWINT via Stripe QR — nuevo */}
{paySettings.enable_stripe && paySettings.stripe_publishable_key && (
  <div
    onClick={() => setPaymentMethod("twint_stripe")}
    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
      paymentMethod === "twint_stripe"
        ? "border-[#2C5F2E] bg-[#F0F9F0]"
        : "border-gray-200 hover:border-gray-300 bg-white"
    }`}
  >
    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
      paymentMethod === "twint_stripe" ? "border-[#2C5F2E] bg-[#2C5F2E]" : "border-gray-300"
    }`}>
      {paymentMethod === "twint_stripe" && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-gray-900">
        TWINT <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded ml-1">QR-Code</span>
      </p>
      <p className="text-xs text-gray-500">QR-Code scannen oder App-Weiterleitung – via Stripe</p>
    </div>
    <img src="/twint-logo.svg" alt="TWINT" className="h-7 w-auto object-contain flex-shrink-0" />
  </div>
)}

{/* TWINT manual — respaldo */}
{paySettings.enable_twint && (
  // ... selector existente (no cambiar)
)}
```

#### 5.7 Sección de acción para TWINT QR
Añadir junto a las otras secciones de pago (antes del párrafo de AGB):

```tsx
{paymentMethod === "twint_stripe" && (
  <div className="mb-4">
    <StripeTwintPayment
      amount={getFinalTotal()}
      orderData={{ customerInfo, cart }}
      publishableKey={paySettings.stripe_publishable_key || undefined}
      secretKey={paySettings.stripe_secret_key || undefined}
      pmcId={paySettings.stripe_pmc_id || undefined}
      disabled={!isFormValid || !isBillingValid || !isAccountValid}
      returnUrl={typeof window !== "undefined" ? window.location.origin : ""}
      onSaveOrder={handleStripeTwintSaveOrder}
      onError={(msg) => setStripeError(msg)}
    />
  </div>
)}
```

---

## PASO 6 — page.tsx (SPA root)

### Detectar parámetros de retorno y montar el checkout

En el `useEffect` inicial donde se lee `searchParams`, añadir:

```typescript
// Retorno desde Stripe TWINT
if (searchParams.get("twint_order") && searchParams.get("redirect_status")) {
  setCurrentPage("checkout")
}
```

> **¿Por qué?** La app es SPA — todo está en `/`. Cuando Stripe redirige de vuelta,
> la URL tiene `?twint_order=...&redirect_status=succeeded` pero la página renderiza
> la tienda, no el checkout. Con este cambio, se monta `CheckoutPage` y su `useEffect`
> detecta los parámetros y muestra la pantalla de confirmación.

---

## PASO 7 — Admin Panel

### `components/admin.tsx`

#### 7.1 Estado inicial de paySettings
```typescript
paypal_email: "", stripe_publishable_key: "", stripe_secret_key: "", stripe_pmc_id: "", twint_phone: "", ...
```

#### 7.2 Nuevo campo en el tab Zahlung → sección Stripe
```tsx
<div>
  <Label className="text-xs text-[#888]">Payment Method Config ID — TWINT QR (pmc_...)</Label>
  <Input
    value={paySettings.stripe_pmc_id}
    onChange={e => setPaySettings(p => ({ ...p, stripe_pmc_id: e.target.value }))}
    placeholder="pmc_..."
    className="bg-white mt-1 font-mono text-xs"
  />
  <p className="text-[10px] text-[#AAA] mt-1">
    Stripe Dashboard → Products → Payment method configurations
  </p>
</div>
```

---

## PASO 8 — Stripe Dashboard (configuración manual)

1. Ir a **Stripe Dashboard** → modo **Test**
2. Products → **Payment method configurations** → crear nueva configuración
3. Activar **TWINT** en la configuración
4. Copiar el ID generado (`pmc_...`)
5. En el Admin Panel → tab **Zahlung** → sección Stripe → pegar el `pmc_...` → Guardar

---

## Flujo completo del pago TWINT QR

```
Usuario selecciona "TWINT QR-Code"
        ↓
Hace clic en "Via TWINT bezahlen"
        ↓
[handleStripeTwintSaveOrder] → guarda pedido en DB con status "pending"
        ↓
POST /api/stripe/create-payment-intent
  body: { paymentMethodConfigId: "pmc_...", currency: "chf", ... }
        ↓
Stripe crea PaymentIntent con payment_method_configuration
        ↓
[stripe.confirmTwintPayment(clientSecret, { return_url: "/?twint_order=12345&twint_total=99" })]
        ↓
Desktop: Stripe muestra página con QR code para escanear
Mobile:  Stripe redirige a la app TWINT
        ↓
Usuario escanea/confirma en TWINT
        ↓
Stripe redirige a: /?twint_order=12345&twint_total=99&redirect_status=succeeded
        ↓
[page.tsx useEffect] detecta "twint_order" + "redirect_status" → setCurrentPage("checkout")
        ↓
[checkout-page.tsx useEffect] detecta params → setOrderStatus("completed")
        ↓
Pantalla de confirmación ✓
```

---

## Archivos modificados / creados

| Archivo | Acción |
|---------|--------|
| `api/get_payment_settings.php` | Modificar — añadir `stripe_pmc_id` |
| `api/save_payment_settings.php` | Modificar — añadir `stripe_pmc_id` |
| `app/api/stripe/create-payment-intent/route.ts` | Modificar — soporte `paymentMethodConfigId` |
| `components/stripe-twint-payment.tsx` | **Crear nuevo** |
| `components/checkout-page.tsx` | Modificar — 6 cambios (ver pasos 5.1–5.7) |
| `app/page.tsx` | Modificar — detectar retorno Stripe en SPA |
| `components/admin.tsx` | Modificar — campo PMC ID en tab Zahlung |
| **Base de datos** | `ALTER TABLE payment_settings ADD COLUMN stripe_pmc_id ...` |

---

## Notas importantes

- **Solo CHF** — TWINT vía Stripe solo funciona en francos suizos
- **Máximo 5.000 CHF** por transacción
- **Requiere cuenta Stripe verificada** en Suiza o Europa
- El flujo TWINT manual (`enable_twint`) se mantiene como **respaldo independiente**
- En **modo test**: usar el botón "AUTHORIZE TEST PAYMENT" que aparece en la página de Stripe
- Para **producción**: cambiar claves `pk_test_` / `sk_test_` por `pk_live_` / `sk_live_` en el admin

---

## FIXES — Bugs encontrados en producción

### FIX 1 — `returnUrl` incorrecto (carrito no se borraba, confirmación no aparecía)

**Problema:** Al usar `window.location.href.split("?")[0]` como `returnUrl`, si el usuario estaba en `/shop` o cualquier otra sub-ruta, Stripe redirigía de vuelta a esa página. Pero solo `page.tsx` (ruta raíz `/`) tiene el `useEffect` que detecta los parámetros `twint_order` y monta el checkout.

**Fix en `components/stripe-twint-payment.tsx`** — dentro de `handlePay`:

```typescript
// ❌ INCORRECTO — depende de la página actual
const finalReturnUrl = `${returnUrl}?twint_order=${orderNumber}&twint_total=${amount}`
// donde returnUrl = window.location.href.split("?")[0]  → podría ser /shop, /checkout, etc.

// ✅ CORRECTO — siempre la raíz del dominio
const finalReturnUrl = `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}twint_order=${orderNumber}&twint_total=${amount}`
// donde returnUrl = window.location.origin  → siempre https://tudominio.com
```

**Fix en `components/checkout-page.tsx`** — prop del componente:

```tsx
// ❌ INCORRECTO
returnUrl={typeof window !== "undefined" ? window.location.href.split("?")[0] : ""}

// ✅ CORRECTO
returnUrl={typeof window !== "undefined" ? window.location.origin : ""}
```

---

### FIX 2 — Carrito no se borraba tras redirección de Stripe

**Problema:** Después de completar el pago TWINT, Stripe redirigía al usuario de vuelta a la app. El `useEffect` en `checkout-page.tsx` llamaba `onClearCart()`, pero si la página se recargaba completamente (comportamiento normal en SPA tras redirect), el estado de React se perdía antes de ejecutarse el `useEffect`.

**Fix en `components/stripe-twint-payment.tsx`** — añadir ANTES de `stripe.confirmTwintPayment(...)`:

```typescript
// Marcar carrito para limpiar cuando la página recargue tras el redirect
localStorage.setItem("cart-should-be-cleared", "true")

const { error: stripeError } = await stripe.confirmTwintPayment(clientSecret, {
  // ...
})
```

> **¿Por qué funciona?** `page.tsx` ya tiene un mecanismo existente que al montar comprueba `localStorage.getItem("cart-should-be-cleared")` y limpia el carrito. Al setear el flag antes del redirect, cuando Stripe vuelve a la app y `page.tsx` monta, el carrito se borra automáticamente.

---

### FIX 3 — Email incorrecto para pagos Stripe/TWINT

**Problema:** En `api/add_order.php`, el código solo tenía un `if ($paymentMethod === 'invoice')` y un `else` que llamaba siempre a `sendPayPalConfirmationEmail()` — incluso para pagos con Stripe o TWINT.

**Fix en `api/add_order.php`**:

```php
// ❌ INCORRECTO
if ($paymentMethod === 'invoice') {
    $emailResponse = sendInvoiceConfirmationEmail($emailData);
} else {
    $emailResponse = sendPayPalConfirmationEmail($emailData);  // ← malo para stripe/twint
}

// ✅ CORRECTO
if ($paymentMethod === 'invoice') {
    $emailResponse = sendInvoiceConfirmationEmail($emailData);
} elseif ($paymentMethod === 'paypal') {
    $emailResponse = sendPayPalConfirmationEmail($emailData);
} else {
    // stripe, stripe_twint, twint — email genérico de confirmación
    $emailResponse = sendOrderConfirmationEmail($emailData);
}
```

---

### FIX 4 — Nueva función `sendOrderConfirmationEmail` en PHP

**Añadir al final de `api/email_functions.php`**:

```php
function sendOrderConfirmationEmail($data) {
    $customerInfo = $data['customerInfo'];
    $cart = $data['cart'];
    $total = $data['total'];
    $orderNumber = $data['orderNumber'];
    $paymentMethod = $data['paymentMethod'] ?? 'stripe';

    $methodLabel = match($paymentMethod) {
        'stripe'       => 'Kreditkarte (Stripe)',
        'stripe_twint' => 'TWINT (Stripe QR)',
        'twint'        => 'TWINT (Manuell)',
        default        => ucfirst($paymentMethod)
    };

    $customerName = $customerInfo['firstName'] . ' ' . $customerInfo['lastName'];
    $customerEmail = $customerInfo['email'];

    // Construir tabla de productos
    $itemsHtml = '';
    foreach ($cart as $item) {
        $subtotal = number_format(($item['price'] ?? 0) * ($item['quantity'] ?? 1), 2);
        $itemsHtml .= "<tr>
            <td style='padding:8px;border-bottom:1px solid #eee'>{$item['name']}</td>
            <td style='padding:8px;border-bottom:1px solid #eee;text-align:center'>{$item['quantity']}</td>
            <td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>CHF $subtotal</td>
        </tr>";
    }

    $totalFormatted = number_format($total, 2);

    // --- Email a la tienda ---
    $storeSubject = "Neue Bestellung #$orderNumber - $methodLabel";
    $storeBody = "<div style='font-family:sans-serif;max-width:600px'>
        <div style='background:#1A1A1A;padding:20px;text-align:center'>
            <h1 style='color:#DAA520;margin:0'>FEUER KÖNIGREICH</h1>
            <p style='color:#fff;margin:5px 0'>Neue Bestellung eingegangen</p>
        </div>
        <div style='padding:20px'>
            <p><strong>Bestellnummer:</strong> #$orderNumber</p>
            <p><strong>Zahlungsmethode:</strong> $methodLabel</p>
            <p><strong>Kunde:</strong> $customerName ($customerEmail)</p>
            <table width='100%' style='border-collapse:collapse'>
                <tr style='background:#f5f5f5'>
                    <th style='padding:8px;text-align:left'>Produkt</th>
                    <th style='padding:8px;text-align:center'>Menge</th>
                    <th style='padding:8px;text-align:right'>Preis</th>
                </tr>
                $itemsHtml
            </table>
            <p style='text-align:right;font-weight:bold;font-size:1.1em'>Total: CHF $totalFormatted</p>
        </div>
    </div>";

    sendEmail(STORE_EMAIL, $storeSubject, $storeBody);

    // --- Email al cliente ---
    $customerSubject = "Ihre Bestellung #$orderNumber - FEUER KÖNIGREICH";
    $customerBody = "<div style='font-family:sans-serif;max-width:600px'>
        <div style='background:#2C5F2E;padding:20px;text-align:center'>
            <h1 style='color:#fff;margin:0'>FEUER KÖNIGREICH</h1>
            <p style='color:#90EE90;margin:5px 0'>Bestellung bestätigt ✓</p>
        </div>
        <div style='padding:20px'>
            <p>Hallo $customerName,</p>
            <p>Vielen Dank für Ihre Bestellung! Wir haben Ihre Zahlung via <strong>$methodLabel</strong> erhalten.</p>
            <p><strong>Bestellnummer:</strong> #$orderNumber</p>
            <table width='100%' style='border-collapse:collapse'>
                <tr style='background:#f5f5f5'>
                    <th style='padding:8px;text-align:left'>Produkt</th>
                    <th style='padding:8px;text-align:center'>Menge</th>
                    <th style='padding:8px;text-align:right'>Preis</th>
                </tr>
                $itemsHtml
            </table>
            <p style='text-align:right;font-weight:bold;font-size:1.1em'>Total: CHF $totalFormatted</p>
            <p style='color:#666;font-size:0.9em'>Ihre Bestellung wird so schnell wie möglich versandt.</p>
        </div>
    </div>";

    sendEmail($customerEmail, $customerSubject, $customerBody);

    return ['success' => true, 'method' => $methodLabel];
}
```

---

### FIX 5 — Logo y nombre de la tienda faltaban en los emails

**Problema:** Varios emails de confirmación no mostraban el logo ni el nombre de la tienda en el header:
- Email de tienda (PayPal) → sin logo, sin nombre
- Email de tienda (Stripe/TWINT) → sin logo, sin nombre
- Email de cliente (Stripe/TWINT) → sin logo, sin nombre
- Emails de factura/PayPal cliente → tenían logo pero sin tagline

**Fix en `api/email_functions.php`** — patrón de header correcto para **todos** los emails:

```html
<!-- Header oscuro (emails a la tienda) -->
<div style='background:#1A1A1A;color:white;padding:24px 20px;text-align:center'>
    <img src='https://online-shop-seven-delta.vercel.app/Security_n.png'
         alt='US - Fishing &amp; Huntingshop'
         style='height:60px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;' />
    <h1 style='margin:0;color:#DAA520;font-size:20px'>US - Fishing &amp; Huntingshop</h1>
    <p style='margin:4px 0;font-size:12px;letter-spacing:1px;color:#aaa'>JAGD &middot; ANGELN &middot; OUTDOOR</p>
    <p style='margin:10px 0 0'>NEUE BESTELLUNG <strong>#{$orderNumber}</strong></p>
</div>

<!-- Header verde (emails al cliente) -->
<div style='background:#2C5F2E;color:white;padding:24px 20px;text-align:center'>
    <img src='https://online-shop-seven-delta.vercel.app/Security_n.png'
         alt='US - Fishing &amp; Huntingshop'
         style='height:60px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;' />
    <h1 style='margin:0;font-size:20px'>US - Fishing &amp; Huntingshop</h1>
    <p style='margin:4px 0;font-size:12px;letter-spacing:1px;color:#90EE90'>JAGD &middot; ANGELN &middot; OUTDOOR</p>
    <p style='margin:10px 0 0'>Vielen Dank für Ihre Bestellung!</p>
</div>
```

> **Nota:** El logo usa la URL de producción de Vercel (`https://online-shop-seven-delta.vercel.app/Security_n.png`) — siempre estará actualizado. No usar rutas relativas `/Security_n.png` en emails porque los clientes de email no tienen acceso al servidor local.

**Resumen de qué emails se corrigieron:**

| Función | Email | Antes | Después |
|---------|-------|-------|---------|
| `generateStoreInvoiceEmail` | Tienda | logo+nombre sin tagline | + tagline |
| `generateCustomerInvoiceEmail` | Cliente | logo+nombre sin tagline | + tagline |
| `generateStorePayPalEmail` | Tienda | ❌ sin logo, sin nombre | ✅ logo+nombre+tagline |
| `generateCustomerPayPalEmail` | Cliente | logo+nombre sin tagline | + tagline |
| `sendOrderConfirmationEmail` (store) | Tienda | ❌ sin logo, sin nombre | ✅ logo+nombre+tagline |
| `sendOrderConfirmationEmail` (customer) | Cliente | ❌ sin logo, sin nombre | ✅ logo+nombre+tagline |
