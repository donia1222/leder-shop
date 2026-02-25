"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  Minus,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserProfile } from "./user-profile"
import { StripePayment } from "./stripe-payment"
import { ProductImage } from "./product-image"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
  weight_kg?: number
}

interface CartItem extends Product {
  quantity: number
  image_url?: string
  image_url_candidates?: string[]
}

interface CheckoutPageProps {
  cart: CartItem[]
  onBackToStore: () => void
  onClearCart?: () => void
  onAddToCart?: (product: CartItem) => void
  onRemoveFromCart?: (productId: number) => void
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  canton: string
  country: string
  notes: string
}

interface BillingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  canton: string
}

interface UserData {
  id?: number
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  postalCode: string
  canton: string
  notes: string
}

export function CheckoutPage({ cart, onBackToStore, onClearCart, onAddToCart, onRemoveFromCart }: CheckoutPageProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    canton: "",
    country: "CH",
    notes: "",
  })

  const [shippingCost, setShippingCost] = useState(0)
  const [shippingInfo, setShippingInfo] = useState({ zone: "", range: "" })
  const [enabledCountries, setEnabledCountries] = useState<string[]>(["CH"])

  const [orderStatus, setOrderStatus] = useState<"pending" | "processing" | "completed" | "error">("pending")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "invoice" | "stripe" | "twint">("invoice")
  const [paymentSettings, setPaymentSettings] = useState<{
    paypal_email: string; twint_phone: string
    bank_iban: string; bank_holder: string; bank_name: string
    enable_paypal: boolean; enable_stripe: boolean; enable_twint: boolean; enable_invoice: boolean
  }>({ paypal_email: "", twint_phone: "", bank_iban: "", bank_holder: "", bank_name: "",
       enable_paypal: false, enable_stripe: false, enable_twint: false, enable_invoice: true })

  // Billing address states
  const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false)
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    canton: "",
  })
  const [billingErrors, setBillingErrors] = useState<Partial<BillingAddress>>({})

  // User account states
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [createAccountData, setCreateAccountData] = useState({
    password: "",
    confirmPassword: "",
    saveData: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountErrors, setAccountErrors] = useState<any>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const router = useRouter()
  const [showUserProfile, setShowUserProfile] = useState(false)

  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [accountCreationStatus, setAccountCreationStatus] = useState<"idle" | "success" | "error">("idle")
  const [accountCreationMessage, setAccountCreationMessage] = useState("")

  // Login states
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState<any>({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle")
  const [loginMessage, setLoginMessage] = useState("")

  // Stripe payment states
  const [stripePaymentStatus, setStripePaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [stripeError, setStripeError] = useState("")

  // Password Reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">("idle")
  const [resetMessage, setResetMessage] = useState("")
  const [resetErrors, setResetErrors] = useState<any>({})

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Check if user is logged in on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔍 CheckoutPage: Inicializando autenticación...")
      const sessionToken = localStorage.getItem("user-session-token")

      if (sessionToken) {
        console.log("🎫 Token encontrado:", sessionToken.substring(0, 20) + "...")

        const isValid = await verifyAndLoadUser(sessionToken)
        if (!isValid) {
          console.log("❌ Token inválido, limpiando...")
          localStorage.removeItem("user-session-token")
          loadSavedCustomerInfo()
        }
      } else {
        console.log("❌ No hay token, cargando info guardada...")
        loadSavedCustomerInfo()
      }
    }

    initializeAuth()

    // Load payment settings
    const API = process.env.NEXT_PUBLIC_API_BASE_URL
    fetch(`${API}/get_payment_settings.php`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          const s = data.settings
          setPaymentSettings(s)
          if (s.enable_invoice) setPaymentMethod("invoice")
          else if (s.enable_paypal) setPaymentMethod("paypal")
          else if (s.enable_stripe) setPaymentMethod("stripe")
          else if (s.enable_twint) setPaymentMethod("twint")
        }
      })
      .catch(() => {})

    // Load enabled shipping zones to build country dropdown
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
          // If current country not in list, reset to first available
          setCustomerInfo(prev => ({
            ...prev,
            country: countries.includes(prev.country) ? prev.country : (countries[0] || "CH")
          }))
        }
      })
      .catch(() => {})
  }, [])

  const verifyAndLoadUser = async (sessionToken: string): Promise<boolean> => {
    try {
      console.log("🔄 Verificando token con el servidor...")

      const response = await fetch(`${API_BASE_URL}/get_user.php`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        return false
      }

      const data = await response.json()
      console.log("✅ Datos del usuario recibidos:", data)

      if (data.success && data.user) {
        setIsLoggedIn(true)
        setCurrentUser({
          id: data.user.user_id || data.user.id,
          email: data.user.email,
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postal_code || "",
          canton: data.user.canton || "",
          notes: data.user.notes || "",
        })

        // Auto-fill form with user data
        setCustomerInfo({
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postal_code || "",
          canton: data.user.canton || "",
          notes: data.user.notes || "",
        })

        setShowCreateAccount(false)
        setAccountCreationStatus("idle")

        console.log("✅ Usuario logueado exitosamente")
        return true
      } else {
        console.error("❌ Respuesta inválida del servidor:", data)
        return false
      }
    } catch (error) {
      console.error("❌ Error verificando token:", error)
      return false
    }
  }

  const reloadUserData = async () => {
    console.log("🔄 Recargando datos del usuario...")
    const sessionToken = localStorage.getItem("user-session-token")

    if (sessionToken && isLoggedIn) {
      const isValid = await verifyAndLoadUser(sessionToken)
      if (isValid) {
        console.log("✅ Datos del usuario recargados exitosamente")
      }
    }
  }

  const loadSavedCustomerInfo = () => {
    const savedCustomerInfo = localStorage.getItem("cantina-customer-info")
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo)
        setCustomerInfo(parsedInfo)
        console.log("✅ Info del cliente cargada desde localStorage")
      } catch (error) {
        console.error("❌ Error cargando info del cliente:", error)
      }
    }
  }

  // Save user data to localStorage whenever it changes (only if not logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      const hasData = Object.values(customerInfo).some((value) => value.trim() !== "")
      if (hasData) {
        localStorage.setItem("cantina-customer-info", JSON.stringify(customerInfo))
      }
    }
  }, [customerInfo, isLoggedIn])

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getShippingCost = () => shippingCost

  const getFinalTotal = () => getTotalPrice() + shippingCost

  // Recalculate shipping when cart or country changes
  useEffect(() => {
    const totalWeight = cart.reduce((sum, item) => sum + (item.weight_kg ?? 0.5) * item.quantity, 0)
    if (cart.length === 0) {
      setShippingCost(0)
      setShippingInfo({ zone: "", range: "" })
      return
    }
    const API = process.env.NEXT_PUBLIC_API_BASE_URL
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

  const createUserAccount = async () => {
    try {
      setIsCreatingAccount(true)
      setAccountCreationStatus("idle")

      console.log("🔄 Creando cuenta de usuario...")

      const requestData = {
        email: customerInfo.email,
        password: createAccountData.password,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode,
        canton: customerInfo.canton,
        notes: customerInfo.notes,
      }

      console.log("📤 Enviando datos:", requestData)

      const response = await fetch(`${API_BASE_URL}/create_user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("📡 Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de creación de cuenta:", result)

      if (result.success && result.sessionToken) {
        const sessionToken = result.sessionToken
        console.log("💾 Guardando token:", sessionToken.substring(0, 20) + "...")
        localStorage.setItem("user-session-token", sessionToken)

        // Configurar directamente el estado del usuario
        setIsLoggedIn(true)
        setCurrentUser({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          city: result.user.city || "",
          postalCode: result.user.postalCode || "",
          canton: result.user.canton || "",
          notes: result.user.notes || "",
        })

        setAccountCreationStatus("success")
        setAccountCreationMessage("¡Cuenta creada exitosamente! Ahora estás conectado.")
        setShowCreateAccount(false)

        setCreateAccountData({
          password: "",
          confirmPassword: "",
          saveData: false,
        })

        return result.user.id
      } else {
        throw new Error(result.error || "Error creating account")
      }
    } catch (error: unknown) {
      console.error("❌ Error creando cuenta:", error)
      setAccountCreationStatus("error")

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Mensajes más específicos para errores comunes
      if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Error de conexión. Verifique su conexión a internet y que el servidor esté disponible."
      } else if (errorMessage.includes("CORS")) {
        errorMessage = "Error de configuración del servidor (CORS). Contacte al administrador."
      }

      setAccountCreationMessage(`Error al crear la cuenta: ${errorMessage}`)
      throw error
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const saveOrderToDatabase = async (orderDataOverrides = {}) => {
    try {
      let userId = null

      // Create user account if requested
      if (showCreateAccount && createAccountData.saveData && !isLoggedIn) {
        userId = await createUserAccount()
      }

      const orderData = getOrderData({
        userId: currentUser?.id || null,
        ...orderDataOverrides
      })

      const response = await fetch(`${API_BASE_URL}/add_order.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Error saving order")
      }

      return result.data
    } catch (error) {
      console.error("Error saving order to database:", error)
      throw error
    }
  }

  const handlePayPalPayment = () => {
    if (!validateForm()) {
      return
    }

    if (!validateBillingAddress()) {
      return
    }

    if (showCreateAccount && !validateAccountCreation()) {
      return
    }

    // CRÍTICO: Asegurar que los datos estén guardados antes de ir a PayPal
    const customerData = {
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      postalCode: customerInfo.postalCode,
      canton: customerInfo.canton,
      notes: customerInfo.notes,
      accountPassword: showCreateAccount ? createAccountData.password : "",
      billingAddress: useDifferentBillingAddress ? {
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        address: billingAddress.address,
        city: billingAddress.city,
        postalCode: billingAddress.postalCode,
        canton: billingAddress.canton,
      } : null,
    }

    // Guardar en localStorage Y sessionStorage para máxima seguridad
    localStorage.setItem("cantina-customer-info", JSON.stringify(customerData))
    sessionStorage.setItem("cantina-customer-info", JSON.stringify(customerData))
    
    // Asegurar que el carrito esté guardado también
    localStorage.setItem("cantina-cart", JSON.stringify(cart))
    sessionStorage.setItem("cantina-cart", JSON.stringify(cart))

    // Crear un ID único para este pedido
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Guardar datos del pedido con ID único para recuperación garantizada
    const orderData = {
      orderId,
      customerInfo: customerData,
      cart: cart,
      total: getFinalTotal(),
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(`cantina-order-${orderId}`, JSON.stringify(orderData))
    sessionStorage.setItem(`cantina-order-${orderId}`, JSON.stringify(orderData))
    localStorage.setItem("cantina-current-order-id", orderId)
    sessionStorage.setItem("cantina-current-order-id", orderId)


    const total = getFinalTotal()
    const paypalEmail = paymentSettings.paypal_email || "info@usfh.ch"
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${paypalEmail}&amount=${total.toFixed(2)}&currency_code=CHF&item_name=Leder-Shop Order&custom=${orderId}&return=${window.location.origin}/success&cancel_return=${window.location.origin}/cancel`

    setOrderStatus("processing")
    // USAR LA MISMA PESTAÑA para que localStorage esté disponible
    window.location.href = paypalUrl
  }

  const handleInvoicePayment = async () => {
    if (!validateForm()) {
      return
    }

    if (!validateBillingAddress()) {
      return
    }

    if (showCreateAccount && !validateAccountCreation()) {
      return
    }

    setIsSubmitting(true)

    try {
      const savedOrder = await saveOrderToDatabase()

      setOrderStatus("completed")
      setOrderDetails({
        id: savedOrder.orderNumber,
        status: "INVOICE_SENT",
        customerInfo: customerInfo,
        cart: cart,
        total: getFinalTotal(),
        createdAt: savedOrder.createdAt,
      })

      if (onClearCart) {
        onClearCart()
      }

      localStorage.removeItem("cantina-cart")
    } catch (error: any) {
      console.error("Error saving order:", error)
      alert(`Error al guardar el pedido: ${error.message}`)
      setOrderStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTwintPayment = async () => {
    if (!validateForm()) return
    if (!validateBillingAddress()) return
    if (showCreateAccount && !validateAccountCreation()) return

    setIsSubmitting(true)
    try {
      const savedOrder = await saveOrderToDatabase()
      setOrderStatus("completed")
      setOrderDetails({
        id: savedOrder.orderNumber,
        status: "TWINT_PENDING",
        customerInfo: customerInfo,
        cart: cart,
        total: getFinalTotal(),
        createdAt: savedOrder.createdAt,
      })
      if (onClearCart) onClearCart()
      localStorage.removeItem("cantina-cart")
    } catch (error: any) {
      console.error("Error saving order:", error)
      alert(`Error al guardar el pedido: ${error.message}`)
      setOrderStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentConfirmation = async (success: boolean) => {
    if (success) {
      setIsSubmitting(true)

      try {
        const savedOrder = await saveOrderToDatabase()

        setOrderStatus("completed")
        setOrderDetails({
          id: savedOrder.orderNumber,
          status: "COMPLETED",
          customerInfo: customerInfo,
          cart: cart,
          total: getFinalTotal(),
          createdAt: savedOrder.createdAt,
        })

        if (onClearCart) {
          onClearCart()
        }

        localStorage.removeItem("cantina-cart")
      } catch (error: any) {
        console.error("Error saving order:", error)
        alert(`Error al guardar el pedido: ${error.message}`)
        setOrderStatus("error")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setOrderStatus("error")
    }
  }

  const getOrderData = (overrides = {}) => {
    return {
      customerInfo: customerInfo,
      billingAddress: useDifferentBillingAddress ? billingAddress : null,
      cart: cart,
      totalAmount: getFinalTotal(),
      shippingCost: getShippingCost(),
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "invoice" ? "pending" : "completed",
      userId: currentUser?.id || null,
      ...overrides
    }
  }

  const handleStripeSuccess = async (paymentIntent: any) => {
    try {
      setStripePaymentStatus("success")
      setIsSubmitting(true)

      let userId = null

      // Create user account if requested
      if (showCreateAccount && createAccountData.saveData && !isLoggedIn) {
        userId = await createUserAccount()
      }

      // Actualizar orderData para incluir información de Stripe
      const stripeOrderData = {
        ...getOrderData(),
        paymentMethod: "stripe",
        paymentStatus: "completed",
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.charges?.data?.[0]?.id || null,
        userId: userId || currentUser?.id || null
      }

      const savedOrder = await saveOrderToDatabase(stripeOrderData)
      setOrderStatus("completed")
      setOrderDetails({
        id: savedOrder.orderNumber,
        status: "COMPLETED",
        customerInfo: customerInfo,
        cart: cart,
        total: getFinalTotal(),        createdAt: savedOrder.createdAt,
        paymentMethod: "stripe",
        paymentId: paymentIntent.id
      })

      if (onClearCart) {
        onClearCart()
      }

      localStorage.removeItem("cantina-cart")
      console.log("✅ Stripe payment completed successfully:", paymentIntent.id)
    } catch (error: any) {
      console.error("❌ Error saving Stripe order:", error)
      setStripePaymentStatus("error")
      setStripeError(`Error al guardar el pedido: ${error.message}`)
      setOrderStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStripeError = (error: string) => {
    setStripePaymentStatus("error")
    setStripeError(error)
    console.error("❌ Stripe payment error:", error)
  }

  const validateForm = () => {
    const errors: Partial<CustomerInfo> = {}

    if (!customerInfo.firstName.trim()) errors.firstName = "Vorname ist erforderlich"
    if (!customerInfo.lastName.trim()) errors.lastName = "Nachname ist erforderlich"
    if (!customerInfo.email.trim()) errors.email = "E-Mail ist erforderlich"
    if (!customerInfo.phone.trim()) errors.phone = "Telefon ist erforderlich"
    if (!customerInfo.address.trim()) errors.address = "Adresse ist erforderlich"
    if (!customerInfo.city.trim()) errors.city = "Stadt ist erforderlich"
    if (!customerInfo.canton.trim()) errors.canton = "Kanton ist erforderlich"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.email = "Ungültige E-Mail-Adresse"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAccountCreation = () => {
    const errors: any = {}

    if (createAccountData.password.length < 6) {
      errors.password = "Passwort muss mindestens 6 Zeichen haben"
    }

    if (createAccountData.password !== createAccountData.confirmPassword) {
      errors.confirmPassword = "Passwörter stimmen nicht überein"
    }

    if (!createAccountData.saveData) {
      errors.saveData = "Bitte bestätigen Sie, dass Sie ein Konto erstellen möchten"
    }

    setAccountErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBillingInputChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }))
    if (billingErrors[field]) {
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Cart management functions
  const handleIncreaseQuantity = (item: CartItem) => {
    if (onAddToCart) {
      onAddToCart(item)
    }
  }

  const handleDecreaseQuantity = (item: CartItem) => {
    if (onRemoveFromCart) {
      onRemoveFromCart(item.id)
    }
  }

  const handleRemoveItem = (item: CartItem) => {
    if (onRemoveFromCart) {
      // Remove all quantity of this item
      for (let i = 0; i < item.quantity; i++) {
        onRemoveFromCart(item.id)
      }
    }
  }

  const validateBillingAddress = () => {
    if (!useDifferentBillingAddress) return true

    const errors: Partial<BillingAddress> = {}

    if (!billingAddress.firstName.trim()) errors.firstName = "Vorname ist erforderlich"
    if (!billingAddress.lastName.trim()) errors.lastName = "Nachname ist erforderlich"
    if (!billingAddress.address.trim()) errors.address = "Adresse ist erforderlich"
    if (!billingAddress.city.trim()) errors.city = "Stadt ist erforderlich"
    if (!billingAddress.canton.trim()) errors.canton = "Kanton ist erforderlich"

    setBillingErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Memoized validations to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    return validateForm()
  }, [customerInfo])

  const isBillingValid = useMemo(() => {
    return useDifferentBillingAddress ? validateBillingAddress() : true
  }, [useDifferentBillingAddress, billingAddress])

  const isAccountValid = useMemo(() => {
    return showCreateAccount ? validateAccountCreation() : true
  }, [showCreateAccount, createAccountData])

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    localStorage.removeItem("user-session-token")
    setIsLoggedIn(false)
    setCurrentUser(null)
    setShowCreateAccount(false)
    setAccountCreationStatus("idle")
  }

  const handleCreateAccountOnly = async () => {
    if (!validateForm()) {
      return
    }

    if (!validateAccountCreation()) {
      return
    }

    try {
      await createUserAccount()
    } catch (error) {
      // Error already handled in createUserAccount
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginStatus("idle")
      setLoginErrors({})

      console.log("🔄 Iniciando sesión...")

      // Validación básica
      const errors: any = {}
      if (!loginData.email.trim()) errors.email = "E-Mail ist erforderlich"
      if (!loginData.password.trim()) errors.password = "Passwort ist erforderlich"

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (loginData.email && !emailRegex.test(loginData.email)) {
        errors.email = "Ungültige E-Mail-Adresse"
      }

      if (Object.keys(errors).length > 0) {
        setLoginErrors(errors)
        return
      }

      const response = await fetch(`${API_BASE_URL}/login_user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      })

      console.log("📡 Respuesta de login:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de login:", result)

      if (result.success && result.sessionToken) {
        const sessionToken = result.sessionToken
        console.log("💾 Guardando token de login:", sessionToken.substring(0, 20) + "...")
        localStorage.setItem("user-session-token", sessionToken)

        // Configurar estado del usuario
        setIsLoggedIn(true)
        setCurrentUser({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          city: result.user.city || "",
          postalCode: result.user.postal_code || "",
          canton: result.user.canton || "",
          notes: result.user.notes || "",
        })

        // Auto-llenar formulario con datos del usuario
        setCustomerInfo({
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          email: result.user.email || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          city: result.user.city || "",
          postalCode: result.user.postal_code || "",
          canton: result.user.canton || "",
          notes: result.user.notes || "",
        })

        setLoginStatus("success")
        setLoginMessage("¡Anmeldung erfolgreich!")
        setShowLogin(false)

        // Limpiar datos de login
        setLoginData({
          email: "",
          password: "",
        })

        console.log("✅ Login exitoso")
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (error: unknown) {
      console.error("❌ Error en login:", error)
      setLoginStatus("error")

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Mensajes más específicos
      if (errorMessage.includes("Invalid email or password")) {
        errorMessage = "E-Mail oder Passwort ist falsch"
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Verbindungsfehler. Bitte versuchen Sie es erneut."
      }

      setLoginMessage(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Password Reset Functions
  const handlePasswordReset = async () => {
    try {
      setIsResettingPassword(true)
      setResetStatus("idle")
      setResetErrors({})

      console.log("🔄 Iniciando reset de contraseña...")

      // Validación básica
      const errors: any = {}
      if (!resetEmail.trim()) {
        errors.email = "E-Mail-Adresse ist erforderlich"
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (resetEmail && !emailRegex.test(resetEmail)) {
        errors.email = "Ungültige E-Mail-Adresse"
      }

      if (Object.keys(errors).length > 0) {
        setResetErrors(errors)
        return
      }

      const response = await fetch(`${API_BASE_URL}/reset_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
        }),
      })

      console.log("📡 Respuesta de reset:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de reset:", result)

      if (result.success) {
        setResetStatus("success")
        setResetMessage(result.message || "Ein neues Passwort wurde an Ihre E-Mail-Adresse gesendet.")

        // Limpiar el formulario
        setResetEmail("")

        console.log("✅ Reset de contraseña exitoso")
      } else {
        throw new Error(result.error || "Password reset failed")
      }
    } catch (error: unknown) {
      console.error("❌ Error en reset de contraseña:", error)
      setResetStatus("error")

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Mensajes más específicos
      if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Verbindungsfehler. Bitte versuchen Sie es erneut."
      } else if (errorMessage.includes("CORS")) {
        errorMessage = "Serverfehler. Bitte kontaktieren Sie den Support."
      }

      setResetMessage(errorMessage)
    } finally {
      setIsResettingPassword(false)
    }
  }

  const openPasswordReset = () => {
    setShowPasswordReset(true)
    setResetEmail(loginData.email) // Pre-fill with login email if available
    setResetStatus("idle")
    setResetMessage("")
    setResetErrors({})
  }

  const closePasswordReset = () => {
    setShowPasswordReset(false)
    setResetEmail("")
    setResetStatus("idle")
    setResetMessage("")
    setResetErrors({})
  }

  if (orderStatus === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full rounded-2xl shadow-lg border-0">
          <CardContent className="text-center p-12">
            <CheckCircle className="w-24 h-24 text-[#2C5F2E] mx-auto mb-6" />
            <h1 className="text-4xl font-black text-[#2C5F2E] mb-4">Bestellung erfolgreich!</h1>
            <p className="text-xl text-gray-600 mb-6">
              {orderDetails?.status === "TWINT_PENDING"
                ? "Bitte führen Sie jetzt die TWINT-Zahlung durch."
                : orderDetails?.status === "INVOICE_SENT"
                  ? "Vielen Dank! Bitte überweisen Sie den Betrag mit Ihrer Bestellnummer als Referenz."
                  : "Vielen Dank für Ihre Bestellung! Sie erhalten in Kürze eine Bestätigungs-E-Mail."
              }
            </p>

            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Bestelldetails</h3>
              <p className="text-green-600 font-bold text-lg">Bestellnummer: <span className="font-mono">{orderDetails?.id}</span></p>
              <p className="text-green-600">Betrag: <strong>{orderDetails?.total?.toFixed(2) || "0.00"} CHF</strong></p>
              {isLoggedIn && <p className="text-green-600">Konto: Gespeichert ✅</p>}
            </div>

            {/* TWINT payment instructions */}
            {orderDetails?.status === "TWINT_PENDING" && paymentSettings.twint_phone && (
              <div className="bg-gray-900 text-white rounded-xl p-5 mb-4 text-left">
                <p className="font-bold text-lg mb-3">📱 TWINT-Zahlung</p>
                <div className="space-y-2 text-sm">
                  <p>Empfänger-Nummer: <span className="font-black text-xl block mt-0.5">{paymentSettings.twint_phone}</span></p>
                  <p>Betrag: <strong>{orderDetails?.total?.toFixed(2)} CHF</strong></p>
                  <p>Verwendungszweck / Referenz: <strong className="font-mono">{orderDetails?.id}</strong></p>
                </div>
                <p className="text-gray-400 text-xs mt-3">Bitte geben Sie die Bestellnummer als Verwendungszweck an, damit wir Ihre Zahlung zuordnen können.</p>
              </div>
            )}

            {/* Bank transfer instructions */}
            {orderDetails?.status === "INVOICE_SENT" && (
              <div className="bg-white border-2 border-green-300 rounded-xl p-5 mb-4 text-left">
                <p className="font-bold text-green-800 text-lg mb-3">🏦 Banküberweisung</p>
                {paymentSettings.bank_iban ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-600">Kontoinhaber: <strong className="text-gray-900">{paymentSettings.bank_holder}</strong></p>
                    {paymentSettings.bank_name && <p className="text-gray-600">Bank: <strong className="text-gray-900">{paymentSettings.bank_name}</strong></p>}
                    <p className="text-gray-600">IBAN: <strong className="font-mono text-gray-900 tracking-wider">{paymentSettings.bank_iban}</strong></p>
                    <p className="text-gray-600">Betrag: <strong className="text-gray-900">{orderDetails?.total?.toFixed(2)} CHF</strong></p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">Die Bankdaten wurden Ihnen per E-Mail zugesandt.</p>
                )}
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-bold text-xs uppercase tracking-wide mb-1">⚠️ Verwendungszweck (Pflichtfeld)</p>
                  <p className="font-mono font-black text-gray-900 text-base">{orderDetails?.id}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-600">Ihre Bestellung wird innerhalb von 2-3 Werktagen versendet.</p>
              <Button onClick={onBackToStore} className="bg-[#2C5F2E] hover:bg-[#1A4520] rounded-full px-8">
                Zurück zum Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full rounded-2xl shadow-lg border-0">
          <CardContent className="text-center p-12">
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-700 mb-4">Fehler bei der Bestellung</h1>
            <p className="text-xl text-gray-600 mb-6">
              Es gab ein Problem beim Verarbeiten Ihrer Zahlung. Bitte versuchen Sie es erneut.
            </p>
            <div className="space-y-4">
              <Button onClick={() => setOrderStatus("pending")} className="bg-[#2C5F2E] hover:bg-[#1A4520] rounded-full px-8">
                Erneut versuchen
              </Button>
              <Button onClick={onBackToStore} variant="outline">
                Zurück zum Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStore}
              className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#2C5F2E]/30 text-[#2C5F2E] hover:bg-[#2C5F2E] hover:text-white hover:border-[#2C5F2E] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Kasse</h1>
              <p className="text-xs text-[#888] mt-0.5">Sicher & verschlüsselt</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <Shield className="w-4 h-4 text-[#2C5F2E]" />
            <span>SSL gesichert</span>
          </div>
        </div>

          {isLoggedIn && currentUser && (
            <div className="flex items-center space-x-4 bg-white rounded-2xl p-4 shadow-sm border border-[#2C5F2E]/20 mb-8">
              <div className="text-right">
                <p className="text-sm text-gray-600">Angemeldet als</p>
                <p className="font-semibold text-lg text-green-700">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => router.push("/profile")}
                  variant="outline"
                  size="sm"
                  className="bg-[#F0F9F0] hover:bg-[#E8F5E9] border-[#2C5F2E]/30 text-[#2C5F2E]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mein Profil
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Abmelden
                </Button>
              </div>
            </div>
          )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer form */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#2C5F2E]" />
                    Persönliche Daten
                  </div>
                  {!isLoggedIn && (
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Automatisch gespeichert
                    </div>
                  )}
                  {isLoggedIn && (
                    <div className="flex items-center text-xs text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aus Ihrem Konto geladen
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`bg-white ${formErrors.firstName ? "border-red-500" : ""}`}
                    />
                    {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`bg-white ${formErrors.lastName ? "border-red-500" : ""}`}
                    />
                    {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-white ${formErrors.email ? "border-red-500" : ""}`}
                    disabled={isLoggedIn}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`bg-white ${formErrors.phone ? "border-red-500" : ""}`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                {/* Show success message when logged in */}
                {isLoggedIn && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-green-700 font-medium">Sie sind angemeldet!</p>
                        <p className="text-green-600 text-sm">
                          Ihre Daten werden automatisch für zukünftige Bestellungen gespeichert.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Section - ONLY show if NOT logged in */}
                {!isLoggedIn && (
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="showLogin"
                        checked={showLogin}
                        onCheckedChange={(checked) => {
                          setShowLogin(checked as boolean)
                          if (checked) {
                            setShowCreateAccount(false) // Close create account if login is opened
                          }
                        }}
                      />
                      <Label htmlFor="showLogin" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2 text-[#2C5F2E]" />
                        Ich habe bereits ein Konto - Anmelden
                      </Label>
                    </div>

                    {showLogin && (
                      <div className="space-y-4 bg-[#F0F9F0] p-4 rounded-xl border border-[#2C5F2E]/15">
                        <div>
                          <Label htmlFor="loginEmail">E-Mail *</Label>
                          <Input
                            id="loginEmail"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                            className={`bg-white ${loginErrors.email ? "border-red-500" : ""}`}
                            placeholder="ihre@email.com"
                          />
                          {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="loginPassword">Passwort *</Label>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={openPasswordReset}
                              className="text-xs text-[#2C5F2E] hover:text-[#1A4520] p-0 h-auto"
                            >
                              Passwort vergessen?
                            </Button>
                          </div>
                          <div className="relative">
                            <Input
                              id="loginPassword"
                              type={showLoginPassword ? "text" : "password"}
                              value={loginData.password}
                              onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                              className={`bg-white pr-10 ${loginErrors.password ? "border-red-500" : ""}`}
                              placeholder="Ihr Passwort"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
                        </div>

                        {/* Login Button */}
                        <div className="pt-4 border-t">
                          <Button
                            onClick={handleLogin}
                            disabled={isLoggingIn || !loginData.email || !loginData.password}
                            className="w-full bg-[#2C5F2E] hover:bg-[#1A4520] text-white"
                          >
                            {isLoggingIn ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Anmeldung läuft...
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4 mr-2" />
                                Anmelden
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Login Status Messages */}
                        {loginStatus === "error" && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                              <div>
                                <p className="text-red-700 font-medium">Anmeldung fehlgeschlagen</p>
                                <p className="text-red-600 text-sm mt-1">{loginMessage}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-[#F0F9F0] p-3 rounded-xl border border-[#2C5F2E]/15">
                          <p className="text-sm text-[#2C5F2E] font-semibold">
                            Nach der Anmeldung:
                          </p>
                          <ul className="text-sm text-[#2C5F2E]/80 mt-1 space-y-1">
                            <li>• Ihre Daten werden automatisch ausgefüllt</li>
                            <li>• Schnellerer Checkout-Prozess</li>
                            <li>• Zugriff auf Ihr Profil und Bestellhistorie</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="w-5 h-5 mr-2 text-[#2C5F2E]" />
                  Lieferadresse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Straße und Hausnummer *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`bg-white ${formErrors.address ? "border-red-500" : ""}`}
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">PLZ</Label>
                    <Input
                      id="postalCode"
                      value={customerInfo.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className={`bg-white ${formErrors.postalCode ? "border-red-500" : ""}`}
                      placeholder="1234"
                    />
                    {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`bg-white ${formErrors.city ? "border-red-500" : ""}`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="canton">Kanton *</Label>
                  <Input
                    id="canton"
                    value={customerInfo.canton}
                    onChange={(e) => handleInputChange("canton", e.target.value)}
                    className={`bg-white ${formErrors.canton ? "border-red-500" : ""}`}
                    placeholder="z.B. Zürich, Bern, Basel..."
                  />
                  {formErrors.canton && <p className="text-red-500 text-sm mt-1">{formErrors.canton}</p>}
                </div>

                <div>
                  <Label htmlFor="country">Land *</Label>
                  <select
                    id="country"
                    value={customerInfo.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {(["CH","DE","AT","FR","IT","NL","BE","ES","PL","PT","CZ","DK","SE","FI","NO","HU","RO","HR","SK","SI","LU","LI","OTHER"] as const)
                      .filter(c => enabledCountries.includes(c))
                      .map(c => {
                        const labels: Record<string, string> = {
                          CH:"🇨🇭 Schweiz", DE:"🇩🇪 Deutschland", AT:"🇦🇹 Österreich",
                          FR:"🇫🇷 Frankreich", IT:"🇮🇹 Italien", NL:"🇳🇱 Niederlande",
                          BE:"🇧🇪 Belgien", ES:"🇪🇸 Spanien", PL:"🇵🇱 Polen",
                          PT:"🇵🇹 Portugal", CZ:"🇨🇿 Tschechien", DK:"🇩🇰 Dänemark",
                          SE:"🇸🇪 Schweden", FI:"🇫🇮 Finnland", NO:"🇳🇴 Norwegen",
                          HU:"🇭🇺 Ungarn", RO:"🇷🇴 Rumänien", HR:"🇭🇷 Kroatien",
                          SK:"🇸🇰 Slowakei", SI:"🇸🇮 Slowenien", LU:"🇱🇺 Luxemburg",
                          LI:"🇱🇮 Liechtenstein", OTHER:"🌍 Andere",
                        }
                        return <option key={c} value={c}>{labels[c] ?? c}</option>
                      })
                    }
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Anmerkungen (optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Besondere Lieferhinweise..."
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address Section */}
            <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="differentBillingAddress"
                    checked={useDifferentBillingAddress}
                    onCheckedChange={(checked) => {
                      setUseDifferentBillingAddress(checked as boolean)
                      if (!checked) {
                        // Reset billing address when unchecked
                        setBillingAddress({
                          firstName: "",
                          lastName: "",
                          address: "",
                          city: "",
                          postalCode: "",
                          canton: "",
                        })
                        setBillingErrors({})
                      }
                    }}
                  />
                  <Label htmlFor="differentBillingAddress" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2 text-[#2C5F2E]" />
                    Rechnungsadresse anders als Lieferadresse
                  </Label>
                </div>

                {useDifferentBillingAddress && (
                  <div className="space-y-4 bg-[#F0F9F0] p-4 rounded-xl border border-[#2C5F2E]/20">
                    <h4 className="font-semibold text-[#2C5F2E] mb-3">Rechnungsadresse</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingFirstName">Vorname *</Label>
                        <Input
                          id="billingFirstName"
                          value={billingAddress.firstName}
                          onChange={(e) => handleBillingInputChange("firstName", e.target.value)}
                          className={`bg-white ${billingErrors.firstName ? "border-red-500" : ""}`}
                        />
                        {billingErrors.firstName && <p className="text-red-500 text-sm mt-1">{billingErrors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billingLastName">Nachname *</Label>
                        <Input
                          id="billingLastName"
                          value={billingAddress.lastName}
                          onChange={(e) => handleBillingInputChange("lastName", e.target.value)}
                          className={`bg-white ${billingErrors.lastName ? "border-red-500" : ""}`}
                        />
                        {billingErrors.lastName && <p className="text-red-500 text-sm mt-1">{billingErrors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billingAddress">Straße und Hausnummer *</Label>
                      <Input
                        id="billingAddress"
                        value={billingAddress.address}
                        onChange={(e) => handleBillingInputChange("address", e.target.value)}
                        className={`bg-white ${billingErrors.address ? "border-red-500" : ""}`}
                      />
                      {billingErrors.address && <p className="text-red-500 text-sm mt-1">{billingErrors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingPostalCode">PLZ *</Label>
                        <Input
                          id="billingPostalCode"
                          value={billingAddress.postalCode}
                          onChange={(e) => handleBillingInputChange("postalCode", e.target.value)}
                          className={`bg-white ${billingErrors.postalCode ? "border-red-500" : ""}`}
                          placeholder="1234"
                        />
                        {billingErrors.postalCode && <p className="text-red-500 text-sm mt-1">{billingErrors.postalCode}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billingCity">Stadt *</Label>
                        <Input
                          id="billingCity"
                          value={billingAddress.city}
                          onChange={(e) => handleBillingInputChange("city", e.target.value)}
                          className={`bg-white ${billingErrors.city ? "border-red-500" : ""}`}
                        />
                        {billingErrors.city && <p className="text-red-500 text-sm mt-1">{billingErrors.city}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billingCanton">Kanton *</Label>
                      <Input
                        id="billingCanton"
                        value={billingAddress.canton}
                        onChange={(e) => handleBillingInputChange("canton", e.target.value)}
                        className={`bg-white ${billingErrors.canton ? "border-red-500" : ""}`}
                        placeholder="z.B. Zürich, Bern, Basel..."
                      />
                      {billingErrors.canton && <p className="text-red-500 text-sm mt-1">{billingErrors.canton}</p>}
                    </div>

                    <div className="bg-[#E8F5E9] p-3 rounded-xl border border-[#2C5F2E]/15">
                      <p className="text-sm text-[#2C5F2E]">
                        <strong>Hinweis:</strong> Die Rechnungsadresse wird nur für die Rechnungsstellung verwendet und nicht in der Datenbank gespeichert.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Account Section - ONLY show if NOT logged in */}
            {!isLoggedIn && (
              <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="createAccount"
                      checked={showCreateAccount}
                      onCheckedChange={(checked) => {
                        setShowCreateAccount(checked as boolean)
                        if (checked) {
                          setShowLogin(false) // Close login if create account is opened
                        }
                      }}
                    />
                    <Label htmlFor="createAccount" className="flex items-center cursor-pointer">
                      <UserPlus className="w-4 h-4 mr-2 text-[#2C5F2E]" />
                      Konto erstellen und Daten für zukünftige Bestellungen speichern
                    </Label>
                  </div>

                  {showCreateAccount && (
                    <div className="space-y-4 bg-[#F0F9F0] p-4 rounded-xl border border-[#2C5F2E]/15">
                      <div>
                        <Label htmlFor="password">Passwort *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={createAccountData.password}
                            onChange={(e) => setCreateAccountData((prev) => ({ ...prev, password: e.target.value }))}
                            className={`bg-white pr-10 ${accountErrors.password ? "border-red-500" : ""}`}
                            placeholder="Mindestens 6 Zeichen"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        {accountErrors.password && (
                          <p className="text-red-500 text-sm mt-1">{accountErrors.password}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={createAccountData.confirmPassword}
                            onChange={(e) =>
                              setCreateAccountData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                            }
                            className={`bg-white pr-10 ${accountErrors.confirmPassword ? "border-red-500" : ""}`}
                            placeholder="Passwort wiederholen"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        {accountErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{accountErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveData"
                          checked={createAccountData.saveData}
                          onCheckedChange={(checked) =>
                            setCreateAccountData((prev) => ({ ...prev, saveData: checked as boolean }))
                          }
                        />
                        <Label htmlFor="saveData" className="text-sm cursor-pointer">
                          Ich möchte ein Konto erstellen und meine Daten für zukünftige Bestellungen speichern
                        </Label>
                      </div>
                      {accountErrors.saveData && <p className="text-red-500 text-sm mt-1">{accountErrors.saveData}</p>}

                      {/* Create Account Button */}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleCreateAccountOnly}
                          disabled={
                            isCreatingAccount || !createAccountData.password || !createAccountData.confirmPassword
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isCreatingAccount ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Konto wird erstellt...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Konto jetzt erstellen
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Sie können Ihr Konto jetzt erstellen oder später beim Bezahlen
                        </p>
                      </div>

                      {/* Account Creation Status Messages */}
                      {accountCreationStatus === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <div>
                              <p className="text-red-700 font-medium">Error al crear la cuenta</p>
                              <p className="text-red-600 text-sm mt-1">{accountCreationMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#F0F9F0] p-3 rounded-xl border border-[#2C5F2E]/15">
                        <p className="text-sm text-[#2C5F2E] font-semibold">
                          Vorteile eines Kontos:
                        </p>
                        <ul className="text-sm text-[#2C5F2E]/80 mt-1 space-y-1">
                          <li>• Automatisches Ausfüllen bei zukünftigen Bestellungen</li>
                          <li>• Bestellhistorie einsehen</li>
                          <li>• Adressdaten verwalten</li>
                          <li>• Schnellerer Checkout</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order summary */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="w-5 h-5 mr-2 text-[#2C5F2E]" />
                  Ihre Bestellung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                        <ProductImage
                          src={item.image_url || item.image}
                          candidates={item.image_url_candidates}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecreaseQuantity(item)}
                              className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
                              disabled={!onRemoveFromCart}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-medium text-sm min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIncreaseQuantity(item)}
                              className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
                              disabled={!onAddToCart}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 "
                            disabled={!onRemoveFromCart}
                          >
                           🗑
                          </Button>
                        </div>
                      </div>
          
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span>{getTotalPrice().toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Versand
                      {shippingInfo.zone && shippingInfo.range && (
                        <span className="text-xs text-gray-500 ml-1">({shippingInfo.zone} · {shippingInfo.range})</span>
                      )}:
                    </span>
                    <span>
                      {shippingCost === 0
                        ? <Badge className="bg-green-100 text-green-700">Kostenlos</Badge>
                        : <span className="font-semibold">{shippingCost.toFixed(2)} CHF</span>
                      }
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-black">
                    <span>Gesamt:</span>
                    <span className="text-[#2C5F2E]">{getFinalTotal().toFixed(2)} CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping information */}
            <Card className="bg-[#F0F9F0] border-[#2C5F2E]/25 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#2C5F2E] mb-2">📦 Versandinformationen</h3>
                <ul className="text-sm text-[#2C5F2E]/80 space-y-1">
                  {shippingInfo.zone && <li>• Zone: {shippingInfo.zone}{shippingInfo.range ? ` · ${shippingInfo.range}` : ""}</li>}
                  <li>• Lieferzeit: 2-3 Werktage</li>
                  <li>• Versand aus 9745 Sevelen</li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="rounded-2xl shadow-sm border-[#EBEBEB]">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 mr-2 text-[#2C5F2E]" />
                  Zahlungsart wählen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {/* PayPal Option */}
                  {paymentSettings.enable_paypal && <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        paymentMethod === "paypal" ? "border-blue-500 bg-blue-500" : "border-gray-400"
                      }`}>
                        {paymentMethod === "paypal" && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">PayPal</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Sofortige Zahlung mit PayPal – Sie werden weitergeleitet
                        </p>
                      </div>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6 w-auto" />
                    </div>
                  </div>}

                  {/* Stripe Option */}
                  {paymentSettings.enable_stripe && <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "stripe"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        paymentMethod === "stripe" ? "border-purple-500 bg-purple-500" : "border-gray-400"
                      }`}>
                        {paymentMethod === "stripe" && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Kreditkarte</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Visa, Mastercard, AMEX – sichere SSL-Zahlung
                        </p>
                      </div>
                      <div className="text-xl">💳</div>
                    </div>
                  </div>}

                  {/* TWINT Option */}
                  {paymentSettings.enable_twint && <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "twint"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("twint")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        paymentMethod === "twint" ? "border-black bg-black" : "border-gray-400"
                      }`}>
                        {paymentMethod === "twint" && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-black text-sm bg-black text-white px-1.5 py-0.5 rounded">TWINT</span>
                          <span className="font-semibold text-gray-900">TWINT</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Bezahlen per TWINT – Schweizer Mobile-Payment
                        </p>
                      </div>
                      <img src="/twint-logo.svg" alt="TWINT" className="h-6 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                  </div>}

                  {/* Invoice Option */}
                  {paymentSettings.enable_invoice && <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === "invoice"
                        ? "border-[#2C5F2E] bg-[#F0F9F0]"
                        : "border-gray-200 hover:border-[#2C5F2E]/40"
                    }`}
                    onClick={() => setPaymentMethod("invoice")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentMethod === "invoice" ? "border-[#2C5F2E] bg-[#2C5F2E]" : "border-gray-400"
                      }`}>
                        {paymentMethod === "invoice" && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Kauf auf Rechnung & Vorkasse</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Nach Abschluss der Bestellung wird der Verkäufer Sie so bald wie möglich per E-Mail oder Telefon kontaktieren, um die Bestellung abzuschließen.
                        </p>
                      </div>
                      <div className="text-xl">📄</div>
                    </div>
                  </div>}
                </div>

                {/* Payment Method Specific Content */}
                {paymentMethod === "paypal" && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Zahlung mit PayPal</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Sie werden nach der Bestellung zu PayPal weitergeleitet, um die Zahlung abzuschließen.
                    </p>
                  </div>
                )}

                {paymentMethod === "invoice" && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-green-800">📄 Kauf auf Rechnung & Vorkasse</h4>
                    {paymentSettings.bank_iban ? (
                      <>
                        <p className="text-sm text-green-700">Bitte überweisen Sie den Betrag auf folgendes Konto:</p>
                        <div className="bg-white border border-green-200 rounded-lg p-3 text-sm space-y-1">
                          <p><span className="text-gray-500">Kontoinhaber:</span> <strong>{paymentSettings.bank_holder}</strong></p>
                          {paymentSettings.bank_name && <p><span className="text-gray-500">Bank:</span> <strong>{paymentSettings.bank_name}</strong></p>}
                          <p><span className="text-gray-500">IBAN:</span> <strong className="font-mono tracking-wider">{paymentSettings.bank_iban}</strong></p>
                          <p className="text-xs text-gray-500 mt-1">Verwendungszweck: Ihre Bestellnummer erhalten Sie nach der Bestellung</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-green-700">
                        Nach Abschluss der Bestellung wird der Verkäufer Sie so bald wie möglich per E-Mail oder Telefon kontaktieren, um die Bestellung abzuschließen.
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === "twint" && (
                  <div className="mb-4 bg-gray-900 text-white rounded-xl p-4">
                    <h4 className="font-bold text-white mb-3">📱 Zahlung per TWINT</h4>
                    {paymentSettings.twint_phone ? (
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">1. Betrag eingeben</span>
                          <strong className="text-white text-base">{getFinalTotal().toFixed(2)} CHF</strong>
                        </div>
                        <div>
                          <span className="text-gray-400">2. TWINT-Nummer</span>
                          <p className="text-white font-black text-2xl tracking-wider mt-0.5">{paymentSettings.twint_phone}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                          <p className="text-gray-300 text-xs mb-1">3. Verwendungszweck / Referenz</p>
                          <p className="text-gray-200 text-xs">Nach der Bestellung erhalten Sie Ihre <strong className="text-white">Bestellnummer</strong> — diese bitte als Verwendungszweck angeben, damit wir Ihre Zahlung zuordnen können.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300">
                        Nach Bestellabschluss erhalten Sie die TWINT-Zahlungsdaten per E-Mail.
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === "stripe" && (
                  <div className="mb-4">
                    <StripePayment
                      amount={getFinalTotal()}
                      currency="CHF"
                      orderData={{
                        orderId: `ORDER-${Date.now()}`,
                        customerInfo: customerInfo,
                        cart: cart
                      }}
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                      disabled={!isFormValid || !isBillingValid || !isAccountValid}
                    />
                    {stripeError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Stripe Fehler</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{stripeError}</p>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod !== "stripe" && (
                  <div className="space-y-4">
                    {paymentMethod === "paypal" && (
                      <Button
                        onClick={handlePayPalPayment}
                        disabled={isSubmitting}
                        className="w-full min-h-14 h-auto py-3 text-base font-bold bg-[#0070BA] hover:bg-[#005ea6] text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Weiterleitung zu PayPal…</>
                        ) : (
                          <span>💳 Mit PayPal bezahlen – {getFinalTotal().toFixed(2)} CHF</span>
                        )}
                      </Button>
                    )}
                    {paymentMethod === "twint" && (
                      <Button
                        onClick={handleTwintPayment}
                        disabled={isSubmitting}
                        className="w-full min-h-14 h-auto py-3 text-base font-bold bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Bestellung wird verarbeitet…</>
                        ) : (
                          <span>📱 Bestellung aufgeben – {getFinalTotal().toFixed(2)} CHF</span>
                        )}
                      </Button>
                    )}
                    {paymentMethod === "invoice" && (
                      <Button
                        onClick={handleInvoicePayment}
                        disabled={isSubmitting}
                        className="w-full min-h-14 h-auto py-3 text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-normal leading-snug"
                      >
                        {isSubmitting ? (
                          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Bestellung wird verarbeitet...</>
                        ) : (
                          <span className="text-center">📄 Kauf auf Rechnung & Vorkasse<br/>{getFinalTotal().toFixed(2)} CHF</span>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Mit dem Klick auf den Bestellbutton akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Password Reset Modal */}
        <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <KeyRound className="w-5 h-5 mr-2 text-[#2C5F2E]" />
                Passwort zurücksetzen
              </DialogTitle>
              <DialogDescription>
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen ein neues temporäres Passwort.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="resetEmail">E-Mail-Adresse *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={`pl-10 ${resetErrors.email ? "border-red-500" : ""}`}
                    placeholder="ihre@email.com"
                    disabled={isResettingPassword}
                  />
                </div>
                {resetErrors.email && <p className="text-red-500 text-sm mt-1">{resetErrors.email}</p>}
              </div>

              {/* Status Messages */}
              {resetStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-green-700 font-medium">E-Mail gesendet!</p>
                      <p className="text-green-600 text-sm mt-1">{resetMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {resetStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-red-700 font-medium">Fehler</p>
                      <p className="text-red-600 text-sm mt-1">{resetMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-[#F0F9F0] border border-[#2C5F2E]/20 rounded-xl p-4">
                <h4 className="text-[#2C5F2E] font-medium mb-2">ℹ️ Wichtige Hinweise:</h4>
                <ul className="text-[#2C5F2E]/80 text-sm space-y-1">
                  <li>• Sie erhalten ein neues 8-stelliges Passwort per E-Mail</li>
                  <li>• Melden Sie sich sofort mit dem neuen Passwort an</li>
                  <li>• Ändern Sie das Passwort nach der Anmeldung in Ihrem Profil</li>
                  <li>• Alle bestehenden Sitzungen werden aus Sicherheitsgründen beendet</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword || !resetEmail.trim() || resetStatus === "success"}
                  className="flex-1 bg-[#2C5F2E] hover:bg-[#1A4520] text-white rounded-xl"
                >
                  {isResettingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Neues Passwort anfordern
                    </>
                  )}
                </Button>
                <Button
                  onClick={closePasswordReset}
                  variant="outline"
                  disabled={isResettingPassword}
                  className="flex-1"
                >
                  {resetStatus === "success" ? "Schließen" : "Abbrechen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Profile Modal */}
        {showUserProfile && (
          <UserProfile
            onClose={() => {
              setShowUserProfile(false)
              // Recargar datos del usuario después de cerrar el perfil
              setTimeout(() => {
                reloadUserData()
              }, 100)
            }}
          />
        )}
        
      </div>
    </div>
  )
}