"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryPreviewSection } from "@/components/category-preview-section"
import { RecommendedProducts } from "@/components/recommended-products"
import ProductsGridCombined from "@/components/products-grid"
import { ReviewsSection } from "@/components/reviews-section"
import { BlogBanner } from "@/components/blog-banner"
import { GalleryBanner } from "@/components/gallery-banner"
import { ShoppingCartComponent } from "@/components/shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"
import { Footer } from "@/components/footer"
import { Admin } from "@/components/admin"
import  Bot  from "@/components/bot"
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
}

interface ComboOffer {
  id: string
  name: string
  description: string
  originalPrice: number
  offerPrice: number
  discount: number
  products: string[]
  image: string
  heatLevel: number
  rating: number
  badge: string
  origin: string
}

interface CartItem extends Product {
  quantity: number
  isCombo?: boolean
  comboId?: string
  originalPrice?: number
  discount?: number
}

function PremiumHotSauceStoreInner() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<Set<number>>(new Set())
  const [purchasedCombos, setPurchasedCombos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState<"store" | "checkout" | "admin">("store")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const searchParams = useSearchParams()

  // 💾 Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('leder-cart')
      if (saved) {
        const data: CartItem[] = JSON.parse(saved)
        setCart(data)
      }
    } catch {}
    localStorage.removeItem('cart-should-be-cleared')
    setIsInitialLoad(false)
    if (searchParams.get("checkout") === "true") {
      setCurrentPage("checkout")
    }
  }, [])


  // 🔄 Guardar carrito en localStorage cada vez que cambie (pero no durante la carga inicial)
  useEffect(() => {
    if (!isInitialLoad && cart.length > 0) {
      localStorage.setItem("leder-cart", JSON.stringify(cart))
    }
  }, [cart, isInitialLoad])

  // 🧹 Verificar si el carrito debe ser limpiado (cuando se navega de vuelta desde success)
  useEffect(() => {
    const checkClearCart = () => {
      const shouldClearCart = localStorage.getItem('cart-should-be-cleared')
      if (shouldClearCart === 'true') {
        console.log('🧹 PERIODIC: Limpiando carrito por flag cart-should-be-cleared')
        localStorage.removeItem('cart-should-be-cleared')
        clearCart()
      }
    }

    // Verificar cuando se carga la página
    checkClearCart()
    
    // Verificar periódicamente cada segundo para detectar cambios
    const interval = setInterval(checkClearCart, 1000)
    
    // Escuchar eventos de storage para detectar cambios desde otras pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart-should-be-cleared' && e.newValue === 'true') {
        console.log('🧹 STORAGE EVENT: Recibido evento de storage para limpiar carrito')
        checkClearCart()
      }
    }
    
    // Escuchar evento personalizado de PayPal
    const handlePayPalClearCart = (e: CustomEvent) => {
      console.log('🎯 Evento PayPal cart clear recibido:', e.detail)
      checkClearCart()
    }
    
    // Escuchar mensajes de postMessage desde success page
    const handlePostMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CLEAR_CART' && e.data?.source === 'paypal-success') {
        console.log('📨 PostMessage de limpieza de carrito recibido')
        checkClearCart()
      }
    }
    
    // También verificar cuando se cambia el foco
    window.addEventListener('focus', checkClearCart)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('paypal-cart-clear', handlePayPalClearCart as EventListener)
    window.addEventListener('message', handlePostMessage)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkClearCart)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('paypal-cart-clear', handlePayPalClearCart as EventListener)
      window.removeEventListener('message', handlePostMessage)
    }
  }, [])

  // 👁️ Verificar limpieza del carrito cuando la página se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar múltiples fuentes de truth para la limpieza del carrito
        const shouldClearCart = localStorage.getItem('cart-should-be-cleared')
        const lastPayment = localStorage.getItem("last-payment")
        
        if (shouldClearCart === 'true') {
          console.log('🧹 Limpiando carrito por flag cart-should-be-cleared')
          localStorage.removeItem('cart-should-be-cleared')
          clearCart()
        }
        
        // Verificar si hay un pago reciente completado y carrito aún tiene items
        if (lastPayment && cart.length > 0) {
          try {
            const paymentInfo = JSON.parse(lastPayment)
            const paymentTime = new Date(paymentInfo.timestamp)
            const now = new Date()
            const diffMinutes = (now.getTime() - paymentTime.getTime()) / (1000 * 60)
            
            // Si el pago fue hace menos de 10 minutos y está marcado como completado
            if (diffMinutes < 10 && paymentInfo.status === "completed") {
              console.log('🧹 Limpiando carrito por pago reciente completado')
              clearCart()
            }
          } catch (error) {
            console.error("Error checking payment for cart cleanup:", error)
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [cart])

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && !item.isCombo)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && !item.isCombo ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prevCart, { ...product, quantity }]
    })
  }

  // Nueva función para añadir combos al carrito
  const addComboToCart = (offer: ComboOffer, quantity = 1) => {
    // Convertir combo a formato de producto para el carrito
    const comboAsProduct: CartItem = {
      id: Number.parseInt(offer.id.replace("combo", "")) + 1000, // ID único para combos
      name: offer.name,
      price: offer.offerPrice,
      image: offer.image,
      description: offer.description,
      heatLevel: offer.heatLevel,
      rating: offer.rating,
      badge: offer.badge,
      origin: offer.origin,
      quantity,
      isCombo: true,
      comboId: offer.id,
      originalPrice: offer.originalPrice,
      discount: offer.discount,
    }

    setCart((prevCart) => {
      const existingCombo = prevCart.find((item) => item.comboId === offer.id)
      if (existingCombo) {
        return prevCart.map((item) =>
          item.comboId === offer.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prevCart, comboAsProduct]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prevCart.filter((item) => item.id !== productId)
    })
  }

  // 🗑️ Nueva función para limpiar el carrito completamente
  const clearCart = () => {
    console.log('🧹 CLEARING CART: Limpiando carrito completamente, items actuales:', cart.length)
    setCart([])
    localStorage.removeItem("leder-cart")
    console.log('✅ CART CLEARED: Carrito limpiado exitosamente')
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const markAsPurchased = (productId: number) => {
    setPurchasedItems((prev) => new Set([...prev, productId]))
    setTimeout(() => {
      setPurchasedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }, 3000)
  }

  const markComboAsPurchased = (comboId: string) => {
    setPurchasedCombos((prev) => new Set([...prev, comboId]))
    setTimeout(() => {
      setPurchasedCombos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(comboId)
        return newSet
      })
    }, 3000)
  }

  const goToCheckout = () => {
    setCurrentPage("checkout")
    setIsCartOpen(false)
  }

  const backToStore = () => {
    setCurrentPage("store")
    // No limpiar carrito aquí automáticamente - se limpia cuando el pago se confirma
  }

  // 🔐 Funciones para el admin
  const goToAdmin = () => {
    console.log("Navigating to admin panel...")
    setCurrentPage("admin")
    setIsCartOpen(false)
  }

  const backFromAdmin = () => {
    console.log("Returning from admin panel...")
    setCurrentPage("store")
  }

  // 📊 Renderizar página de admin
  if (currentPage === "admin") {
    return <Admin onClose={backFromAdmin} />
  }

  // 🛒 Renderizar página de checkout
  if (currentPage === "checkout") {
    return (
      <CheckoutPage
        cart={cart}
        onBackToStore={backToStore}
        onClearCart={clearCart} // Pasar función para limpiar carrito
      />
    )
  }

  // 🏪 Renderizar página principal del store
  return (
    <div className="bg-white">

      <Header onAdminOpen={goToAdmin} onCartOpen={() => setIsCartOpen(true)} cartCount={getTotalItems()} />

      <HeroSection />

      <CategoryPreviewSection />

      <RecommendedProducts />

      <GalleryBanner />
      <BlogBanner />
      <ReviewsSection />



      <ShoppingCartComponent
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onGoToCheckout={goToCheckout}
        onClearCart={clearCart}
      />

      <Footer onAdminOpen={goToAdmin} />
    </div>
  )
}

export default function PremiumHotSauceStore() {
  return (
    <Suspense>
      <PremiumHotSauceStoreInner />
    </Suspense>
  )
}