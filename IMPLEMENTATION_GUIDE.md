# Guía de implementación: Pagos + Costes de envío

Este documento explica paso a paso cómo implementar el sistema de métodos de pago y costes de envío por zona/peso en este proyecto Next.js + PHP.

---

## Stack técnico

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: PHP (PDO + MySQL) en servidor externo (`web.lweb.ch/shop`)
- **Variable de entorno**: `NEXT_PUBLIC_API_BASE_URL` → URL base del servidor PHP

---

## PARTE 1: Sistema de métodos de pago

### Archivos PHP

#### `api/get_payment_settings.php`
- Crea la tabla `payment_settings` si no existe (auto-migración)
- Inserta fila por defecto si está vacía
- Aplica migraciones de columnas con `ALTER TABLE ... ADD COLUMN` dentro de try/catch (ignora si ya existe)
- Retorna JSON: `{ success: true, settings: { paypal_email, stripe_publishable_key, twint_phone, bank_iban, bank_holder, bank_name, enable_paypal, enable_stripe, enable_twint, enable_invoice } }`
- Los campos `enable_*` se castean a boolean en PHP antes de serializar

#### `api/save_payment_settings.php`
- Recibe POST con JSON body con todos los campos de `payment_settings`
- Usa `INSERT ... ON DUPLICATE KEY UPDATE` con `id=1` (una sola fila)
- Los campos `enable_*` se castean con `(int)(bool)` antes de insertar

### Tabla BD

```sql
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT NOT NULL DEFAULT 1,
    paypal_email VARCHAR(255) NOT NULL DEFAULT '',
    stripe_secret_key VARCHAR(255) NOT NULL DEFAULT '',
    stripe_publishable_key VARCHAR(255) NOT NULL DEFAULT '',
    stripe_webhook_secret VARCHAR(255) NOT NULL DEFAULT '',
    twint_phone VARCHAR(50) NOT NULL DEFAULT '',
    bank_iban VARCHAR(50) NOT NULL DEFAULT '',
    bank_holder VARCHAR(255) NOT NULL DEFAULT '',
    bank_name VARCHAR(255) NOT NULL DEFAULT '',
    enable_paypal TINYINT(1) NOT NULL DEFAULT 0,
    enable_stripe TINYINT(1) NOT NULL DEFAULT 0,
    enable_twint TINYINT(1) NOT NULL DEFAULT 0,
    enable_invoice TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Frontend — Admin (`components/admin.tsx`)

- Tab "Einstellungen" (5º tab)
- Estado: `paySettings` con todos los campos
- Al abrir el tab → `loadPaymentSettings()` llama `get_payment_settings.php`
- Cada método tiene un `<Switch>` para activar/desactivar
- Botón "Speichern" → `savePaymentSettings()` llama `save_payment_settings.php`
- Métodos soportados: **PayPal**, **Stripe (tarjeta)**, **TWINT**, **Rechnung (factura)**

### Frontend — Checkout (`components/checkout-page.tsx`)

- Al montar → carga `get_payment_settings.php`
- Auto-selecciona el primer método activo: `invoice > paypal > stripe > twint`
- Muestra solo los métodos con `enable_X = true`
- Al hacer pedido → incluye `paymentMethod` y `paymentStatus` en los datos del pedido

---

## PARTE 2: Sistema de costes de envío por zona y peso

### Modelo de datos

**3 tablas:**
1. `shipping_zones` — zonas de envío (Schweiz / Europa / Internacional)
2. `shipping_weight_ranges` — rangos de peso (0–0.5kg, 0.5–1kg, 1–3kg…)
3. `shipping_rates` — tarifa en CHF por combinación zona × rango

**1 columna nueva en `products`:**
- `weight_kg DECIMAL(5,3) NOT NULL DEFAULT 0.500`

### Archivos PHP — CREAR

#### `api/get_shipping_settings.php`
- Crea las 3 tablas si no existen
- Migración: `ALTER TABLE shipping_zones ADD COLUMN enabled TINYINT(1) NOT NULL DEFAULT 1` (dentro de try/catch)
- Migración: `ALTER TABLE products ADD COLUMN weight_kg DECIMAL(5,3) NOT NULL DEFAULT 0.500` (dentro de try/catch)
- Si `shipping_zones` está vacía → inserta defaults:
  - Schweiz → `CH`
  - Europa → `DE,FR,IT,AT,ES,NL,BE,PL,PT,CZ,DK,SE,FI,NO,HU,RO,HR,SK,SI,LU,LI`
  - International → `*`
- Si `shipping_weight_ranges` está vacía → inserta defaults:
  - `0–0.5 kg`, `0.5–1 kg`, `1–3 kg`, `3–5 kg`, `5–10 kg`, `10+ kg`
- Retorna: `{ success, zones: [...], ranges: [...], rates: [...] }`

#### `api/save_shipping_settings.php`
- POST con JSON: `{ zones: [...], ranges: [...], rates: [...] }`
- Dentro de una transacción: DELETE + INSERT para las 3 tablas
- Zonas incluyen campo `enabled` (0 o 1)
- Rates tienen `zone_id`, `range_id`, `price`

#### `api/calculate_shipping.php`
- POST con JSON: `{ country: "DE", weight_kg: 1.35 }`
- Carga solo zonas con `enabled = 1`
- Detecta zona por país (recorre la lista, `*` es fallback)
- Busca rango: `WHERE min_kg <= :w AND max_kg > :w`
- Si no hay rango → usa el último (más pesado)
- Busca tarifa en `shipping_rates`
- Retorna: `{ success, price: 18.00, zone: "Europa", range: "1–3 kg" }`

#### `api/toggle_shipping_zone.php`
- POST con JSON: `{ id: 2, enabled: false }`
- Hace solo `UPDATE shipping_zones SET enabled = :enabled WHERE id = :id`
- Retorna: `{ success, id, sent, rows_affected, db_now: { id, name, enabled } }`
- **IMPORTANTE**: usar este endpoint para el toggle — NO el save_shipping_settings (el DELETE+INSERT es más lento y propenso a errores para un toggle)

### Archivos PHP — MODIFICAR

#### `api/add_product.php`
- Añadir: `$weight_kg = $_POST['weight_kg'] ?? 0.500;`
- Añadir `weight_kg` en el INSERT:
  ```sql
  INSERT INTO products (..., weight_kg) VALUES (..., :weight_kg)
  ```

#### `api/edit_product.php`
- Añadir: `$weight_kg = $_POST['weight_kg'] ?? $existing_product['weight_kg'] ?? 0.500;`
- Añadir `weight_kg` en el UPDATE:
  ```sql
  UPDATE products SET ..., weight_kg = :weight_kg WHERE id = :id
  ```

### Frontend — Admin (`components/admin.tsx`)

#### Interface `Product`
```ts
interface Product {
  // ...campos existentes...
  weight_kg: number
}
```

#### Interface `ShippingZone`
```ts
interface ShippingZone { id: number; name: string; countries: string; enabled: boolean }
interface ShippingRange { id: number; min_kg: number; max_kg: number; label: string }
interface ShippingRate { zone_id: number; range_id: number; price: number }
```

#### Estados nuevos
```ts
const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
const [shippingRanges, setShippingRanges] = useState<ShippingRange[]>([])
const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
const [shippingLoading, setShippingLoading] = useState(false)
const [shippingSavedMsg, setShippingSavedMsg] = useState("")
const [isSavingShipping, setIsSavingShipping] = useState(false)
const [shippingDebugLog, setShippingDebugLog] = useState<string[]>([])
```

#### Helpers
```ts
const getRate = (zoneId: number, rangeId: number) =>
  shippingRates.find(r => r.zone_id === zoneId && r.range_id === rangeId)?.price ?? 0

const setRate = (zoneId: number, rangeId: number, price: number) => {
  setShippingRates(prev => {
    const idx = prev.findIndex(r => r.zone_id === zoneId && r.range_id === rangeId)
    if (idx >= 0) { const next = [...prev]; next[idx] = { zone_id: zoneId, range_id: rangeId, price }; return next }
    return [...prev, { zone_id: zoneId, range_id: rangeId, price }]
  })
}
```

#### Tab "Versand" (6º tab)
- `TabsList` → cambiar `grid-cols-5` a `grid-cols-6`
- Añadir `<TabsTrigger value="versand">` con icono Package
- `useEffect` → añadir `else if (activeTab === "versand") { loadShippingSettings() }`
- `<TabsContent value="versand">`:
  - Una Card por zona con botón `<button>` (NO usar Radix Switch — causa bugs de eventos)
  - El botón toggle llama directamente a `toggle_shipping_zone.php` vía fetch
  - Si zona activa → muestra grid de inputs CHF por rango de peso
  - Botón "Speichern" → llama `save_shipping_settings.php` para guardar precios

#### Toggle de zona — patrón correcto
```tsx
<button
  type="button"
  onClick={async () => {
    const newEnabled = !zone.enabled
    setShippingZones(prev => prev.map((z, j) => j === i ? { ...z, enabled: newEnabled } : z))
    await fetch(`${API_BASE}/toggle_shipping_zone.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: zone.id, enabled: newEnabled }),
    })
  }}
>
  {zone.enabled ? "✓ Aktiv" : "✗ Deaktiviert"}
</button>
```

> ⚠️ No usar `<Switch onCheckedChange={async ...}>` de Radix UI para operaciones fetch — genera violations de rendimiento y el evento puede no propagarse correctamente.

#### Campo peso en formulario de producto
```tsx
<Input
  id="weight_kg"
  name="weight_kg"
  type="number"
  step="0.001"
  min="0"
  defaultValue={currentEditingProduct?.weight_kg ?? "0.500"}
  placeholder="z.B. 0.350"
/>
```

### Frontend — Checkout (`components/checkout-page.tsx`)

#### Interface `CustomerInfo`
```ts
interface CustomerInfo {
  // ...campos existentes...
  country: string  // ← nuevo
}
```

#### Interface `Product` / `CartItem`
```ts
interface Product {
  // ...campos existentes...
  weight_kg?: number  // ← nuevo
}
```

#### Estados nuevos
```ts
const [shippingCost, setShippingCost] = useState(0)
const [shippingInfo, setShippingInfo] = useState({ zone: "", range: "" })
const [enabledCountries, setEnabledCountries] = useState<string[]>(["CH"])
```

#### Estado inicial `customerInfo`
```ts
const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
  // ...campos existentes...
  country: "CH",  // ← nuevo
})
```

#### `getShippingCost()` — ya no es hardcoded
```ts
const getShippingCost = () => shippingCost  // retorna el estado
const getFinalTotal = () => getTotalPrice() + shippingCost
```

#### useEffect para recalcular envío
```ts
useEffect(() => {
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight_kg ?? 0.5) * item.quantity, 0)
  if (cart.length === 0) { setShippingCost(0); setShippingInfo({ zone: "", range: "" }); return }
  fetch(`${API}/calculate_shipping.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country: customerInfo.country, weight_kg: totalWeight }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        setShippingCost(data.price ?? 0)
        setShippingInfo({ zone: data.zone ?? "", range: data.range ?? "" })
      }
    })
    .catch(() => {})
}, [cart, customerInfo.country])
```

#### useEffect inicial — cargar países habilitados
Al montar, junto con `get_payment_settings.php`, también llamar `get_shipping_settings.php`:
```ts
fetch(`${API}/get_shipping_settings.php`)
  .then(r => r.json())
  .then(data => {
    if (data.success && data.zones) {
      const countries: string[] = []
      let hasWildcard = false
      for (const z of data.zones) {
        if (!z.enabled) continue
        if (z.countries === "*") { hasWildcard = true; continue }
        z.countries.split(",").map((c: string) => c.trim()).forEach((c: string) => {
          if (c && !countries.includes(c)) countries.push(c)
        })
      }
      if (hasWildcard) countries.push("OTHER")
      if (countries.length > 0) setEnabledCountries(countries)
      setCustomerInfo(prev => ({
        ...prev,
        country: countries.includes(prev.country) ? prev.country : (countries[0] || "CH")
      }))
    }
  })
```

#### Dropdown de país (nativo `<select>`, no Radix)
```tsx
<select
  value={customerInfo.country}
  onChange={(e) => handleInputChange("country", e.target.value)}
  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm..."
>
  {(["CH","DE","AT","FR","IT","NL","BE","ES","PL","PT","CZ","DK","SE","FI","NO","HU","RO","HR","SK","SI","LU","LI","OTHER"] as const)
    .filter(c => enabledCountries.includes(c))
    .map(c => {
      const labels: Record<string, string> = { CH:"🇨🇭 Schweiz", DE:"🇩🇪 Deutschland", /* ... */ }
      return <option key={c} value={c}>{labels[c] ?? c}</option>
    })
  }
</select>
```

#### Resumen del pedido — mostrar coste de envío
```tsx
<div className="flex justify-between">
  <span>
    Versand
    {shippingInfo.zone && <span className="text-xs text-gray-500 ml-1">({shippingInfo.zone} · {shippingInfo.range})</span>}:
  </span>
  <span>
    {shippingCost === 0
      ? <Badge className="bg-green-100 text-green-700">Kostenlos</Badge>
      : <span className="font-semibold">{shippingCost.toFixed(2)} CHF</span>
    }
  </span>
</div>
```

---

## Orden de implementación recomendado

1. Crear los 4 archivos PHP nuevos (`get_shipping_settings`, `save_shipping_settings`, `calculate_shipping`, `toggle_shipping_zone`)
2. Modificar `add_product.php` y `edit_product.php` para añadir `weight_kg`
3. Subir todos los PHP al servidor
4. Modificar `components/admin.tsx`:
   - Interfaces, estados y funciones de shipping
   - Tab Versand (6º tab, `grid-cols-6`)
   - Campo peso en formulario de producto
5. Modificar `components/checkout-page.tsx`:
   - Interfaces, estados nuevos
   - `useEffect` de cálculo de envío
   - Carga de países habilitados en mount
   - Dropdown de país
   - Resumen con precio de envío
6. Abrir el admin → tab Versand → se crean las tablas automáticamente
7. Activar zonas, configurar precios, guardar
8. Asignar peso a los productos desde el formulario de edición

---

## Gotchas importantes

- **No usar `<Switch>` de Radix UI para operaciones async fetch** — usar `<button>` nativo
- **Las tablas se crean solas** al primer acceso al tab Versand — no hace falta SQL manual
- **El toggle de zona** usa un endpoint dedicado (`toggle_shipping_zone.php`) con simple UPDATE, no el save completo
- **El país "OTHER"** mapea a la zona Internacional (`*`)
- **Peso por defecto**: 0.500 kg si el producto no tiene `weight_kg` asignado

---

## Bug conocido — weight_kg no se propaga al CartItem

### Síntoma
El envío se calcula sobre el peso total del carrito, pero si los items no tienen `weight_kg`, el checkout usa `0.5 kg` por item como fallback. Con 2 productos de 200 g cada uno → `2 × 0.5 = 1.0 kg` en vez de `0.4 kg`, aplicando una tarifa incorrectamente superior.

### Causa
`weight_kg` no estaba incluido en las interfaces `Product` / `CartItem` de los componentes del frontend, ni se copiaba al objeto CartItem al hacer "Añadir al carrito".

### Fix aplicado

**`api/get_products.php`** — en ambos bloques (producto individual y lista):
```php
$product['weight_kg'] = floatval($product['weight_kg'] ?? 0);
```

**`components/shop-grid.tsx`** — añadir a ambas interfaces y al crear el CartItem:
```ts
// Interface Product
weight_kg?: number

// Interface CartItem
weight_kg?: number

// En addToCart()
weight_kg: product.weight_kg,
```

**`app/product/[id]/page.tsx`** — mismo patrón:
```ts
// Interface Product
weight_kg?: number

// Interface CartItem
weight_kg?: number

// En addToCart()
weight_kg: product.weight_kg,
```

### Regla para futuros proyectos
> Siempre que añadas un campo nuevo a la tabla `products`, verificar que se propaga por toda la cadena: **PHP `get_products.php`** → **interfaz `Product`** → **interfaz `CartItem`** → **función `addToCart`**. Si se rompe en cualquier punto, el checkout recibe `undefined` y usa el fallback.
