"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  ShoppingCart, ChevronLeft, ChevronRight,
  Search, X, Check, LayoutGrid,
  ArrowUp, ChevronDown, Heart, Menu, Newspaper, Download
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCartComponent } from "./shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"
import { LoginAuth } from "./login-auth"
import { ProductImage } from "./product-image"
import { UserProfile } from "./user-profile"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number; name: string; description: string; price: number
  image_url?: string; image_urls?: (string | null)[]; image_url_candidates?: string[]
  heat_level: number; rating: number; badge: string
  origin: string; supplier?: string; category?: string; stock?: number; weight_kg?: number
}
interface CartItem {
  id: number; name: string; price: number; image: string; image_url?: string
  image_url_candidates?: string[]
  description: string; heatLevel: number; rating: number
  badge?: string; origin?: string; quantity: number; weight_kg?: number
}
interface Category { id: number; slug: string; name: string }

// ─── Standalone helpers ────────────────────────────────────────────────────────

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

// ─── ProductCard (defined OUTSIDE ShopGrid so memo() actually works) ──────────

interface ProductCardProps {
  product: Product
  addedIds: Set<number>
  wishlist: Set<number>
  onSelect: (p: Product) => void
  onAddToCart: (p: Product) => void
  onToggleWishlist: (id: number) => void
}

const ProductCard = memo(function ProductCard({ product, addedIds, wishlist, onSelect, onAddToCart, onToggleWishlist }: ProductCardProps) {
  const [idx, setIdx] = useState(0)
  const images  = getImages(product)
  const inStock = (product.stock ?? 0) > 0
  const isAdded = addedIds.has(product.id)
  const isWished = wishlist.has(product.id)

  return (
    <div className="group bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-[#EBEBEB] hover:border-[#D5D5D5]">
      {/* Image */}
      <div
        className="relative aspect-square bg-[#F8F5F2] overflow-hidden cursor-pointer"
        onClick={() => onSelect(product)}
      >
        {images.length > 0 ? (
          <img
            src={images[idx]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={() => {
              if (idx < images.length - 1) setIdx(i => i + 1)
              else {
                const el = document.querySelector(`[data-pid="${product.id}"] img`) as HTMLImageElement
                if (el) el.src = "/placeholder.svg?height=300&width=300"
              }
            }}
          />
        ) : (
          <ProductImage
            src={product.image_url}
            candidates={product.image_url_candidates}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#333]" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#333]" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[#1A1A1A]/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">Ausverkauft</span>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 bg-[#8B5E3C] text-[#FAF3EB] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Wishlist heart */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(product.id) }}
          className={`absolute top-2 right-2 rounded-full flex items-center justify-center transition-all duration-200
            w-6 h-6 sm:w-8 sm:h-8
            ${isWished
              ? "bg-red-500 text-white shadow-md"
              : "bg-white/80 text-[#DDD] shadow-sm hover:text-red-400 hover:scale-110"
            }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col flex-1 gap-1.5">
        <p className="text-[10px] font-bold text-[#BBBBBB] uppercase tracking-widest truncate">
          {product.supplier || product.origin || "—"}
        </p>
        <h3
          className="text-sm font-bold text-[#1A1A1A] line-clamp-2 leading-snug cursor-pointer hover:text-[#8B5E3C] transition-colors"
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h3>
        <div className="mt-auto pt-2.5 flex items-center justify-between gap-2 border-t border-[#F5F5F5]">
          <span className="text-base font-black text-[#1A1A1A] tracking-tight">CHF {product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 ${
              isAdded
                ? "bg-emerald-500 text-white"
                : inStock
                  ? "bg-[#8B5E3C] hover:bg-[#6B4226] text-white hover:shadow-md active:scale-95"
                  : "bg-[#F0F0F0] text-[#CCC] cursor-not-allowed"
            }`}
          >
            {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            {isAdded ? "✓" : "Kaufen"}
          </button>
        </div>
      </div>
    </div>
  )
})

// ─── MobileCatCard: smaller version for mobile scroll ─────────────────────────

function MobileCatCard({ srcs, displayName, isActive, onClick }: {
  srcs: string[]
  displayName: string
  isActive: boolean
  onClick: () => void
}) {
  const [idx, setIdx] = useState(0)
  const img = srcs[idx] ?? null
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-xl flex-shrink-0 text-left transition-all duration-200"
      style={{
        width: "110px", height: "120px",
        backgroundColor: "#111",
        border: isActive ? "2px solid #8B5E3C" : "2px solid transparent",
        boxShadow: isActive ? "0 4px 16px rgba(139,94,60,0.3)" : "none",
      }}
    >
      {img && (
        <img
          src={img}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: isActive ? "scale(1.05)" : undefined, transition: "transform 0.4s ease" }}
          onError={() => setIdx(i => i + 1)}
        />
      )}
      <div className="absolute inset-0" style={{
        background: isActive
          ? "linear-gradient(to top, rgba(139,94,60,0.8) 0%, transparent 55%)"
          : "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)"
      }} />
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#8B5E3C] rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
        <span className="text-white font-black text-[11px] leading-tight block truncate drop-shadow-md">
          {displayName}
        </span>
      </div>
    </button>
  )
}

// ─── CatCard: category card with image fallback chain ─────────────────────────

function CatCard({ srcs, displayName, isActive, onClick }: {
  srcs: string[]
  displayName: string
  isActive: boolean
  onClick: () => void
}) {
  const [idx, setIdx] = useState(0)
  const img = srcs[idx] ?? null

  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl group text-left transition-all duration-300"
      style={{
        height: "180px", minWidth: "210px", width: "210px", flexShrink: 0,
        backgroundColor: "#f5f5f5",
        border: isActive ? "2px solid #8B5E3C" : "2px solid #E0E0E0",
        boxShadow: isActive ? "0 8px 32px rgba(139,94,60,0.3)" : "none",
      }}
    >
      {img && (
        <img
          src={img}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setIdx(i => i + 1)}
        />
      )}
      <div className="absolute inset-0" style={{
        background: isActive
          ? "linear-gradient(to top, rgba(139,94,60,0.75) 0%, transparent 50%)"
          : "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 50%)"
      }} />
      {isActive && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-[#8B5E3C] rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5">
        <span className="text-white font-black text-sm leading-tight block tracking-wide drop-shadow-lg">
          {displayName}
        </span>
      </div>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopGrid() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")

  const [search, setSearch]                 = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSupplier, setActiveSupplier] = useState("all")
  const [stockFilter, setStockFilter]       = useState<"all" | "out_of_stock">("all")
  const [sortBy, setSortBy]                 = useState<"default"|"name_asc"|"name_desc"|"price_asc"|"price_desc">("default")
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [showBackTop, setShowBackTop]       = useState(false)
  const [navMenuOpen, setNavMenuOpen]       = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const handleDownloadVCard = () => {
    const imageUrl = "https://online-shop-seven-delta.vercel.app/logo.png"
    fetch(imageUrl)
      .then((res) => { if (!res.ok) throw new Error(res.statusText); return res.blob() })
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          const base64data = (reader.result as string).split(",")[1]
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:LEDER · HANDWERK · QUALITÄT\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nPHOTO;ENCODING=b;TYPE=PNG:${base64data}\nEND:VCARD`
          const link = document.createElement("a")
          link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
          link.download = "Leder-Shop.vcf"
          document.body.appendChild(link); link.click(); document.body.removeChild(link)
        }
        reader.readAsDataURL(blob)
      })
      .catch(() => {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:LEDER · HANDWERK · QUALITÄT\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nEND:VCARD`
        const link = document.createElement("a")
        link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
        link.download = "Leder-Shop.vcf"
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
      })
  }

  const PAGE_SIZE = 20
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [cart, setCart]           = useState<CartItem[]>([])
  const [cartOpen, setCartOpen]   = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [addedIds, setAddedIds]   = useState<Set<number>>(new Set())
  const [currentView, setCurrentView] = useState<"products"|"checkout">("products")
  const [wishlist, setWishlist]   = useState<Set<number>>(new Set())
  const [showWishlist, setShowWishlist] = useState(false)

  useEffect(() => { loadProducts(); loadCategories(); loadCart(); loadWishlist() }, [])
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, activeCategory, activeSupplier, stockFilter, sortBy])

  // Apply category filter from URL param once categories are loaded
  useEffect(() => {
    const catParam = searchParams.get("cat")
    if (!catParam || categories.length === 0) return
    // Match against category name (API names like "Messer 2026" contain the display name)
    const matched = categories.find((c) =>
      c.name.toLowerCase().includes(catParam.toLowerCase())
    )
    if (matched) setActiveCategory(matched.slug)
  }, [categories, searchParams])

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 500)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products`)
      const data = await res.json()
      if (data.success) setProducts(data.products)
      else throw new Error(data.error)
    } catch (e: any) { setError(e.message || "Fehler") }
    finally { setLoading(false) }
  }
  const loadCategories = async () => {
    try {
      const res = await fetch(`/api/categories`)
      const data = await res.json()
      if (data.success) setCategories(data.categories)
    } catch {}
  }
  const loadCart = () => {
    try {
      const saved = localStorage.getItem("leder-cart")
      if (saved) {
        const data: CartItem[] = JSON.parse(saved)
        setCart(data); setCartCount(data.reduce((s, i) => s + i.quantity, 0))
        setAddedIds(new Set(data.map(i => i.id)))
      }
    } catch {}
  }
  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem("shop-wishlist")
      if (saved) setWishlist(new Set(JSON.parse(saved)))
    } catch {}
  }
  const toggleWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem("shop-wishlist", JSON.stringify([...next]))
      return next
    })
  }, [])

  const saveCart = (c: CartItem[]) => {
    localStorage.setItem("leder-cart", JSON.stringify(c))
    localStorage.setItem("leder-cart-count", c.reduce((s, i) => s + i.quantity, 0).toString())
  }
  const addToCart = (product: Product) => {
    if ((product.stock ?? 0) === 0) return
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      const next = exists
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, {
            id: product.id, name: product.name, price: product.price,
            image: getImages(product)[0] ?? "/placeholder.svg",
            image_url: getImages(product)[0],
            image_url_candidates: product.image_url_candidates,
            description: product.description,
            heatLevel: product.heat_level, rating: product.rating,
            badge: product.badge, origin: product.origin, quantity: 1,
            weight_kg: product.weight_kg,
          }]
      saveCart(next); setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
    setAddedIds(prev => new Set([...prev, product.id]))
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(product.id); return s }), 2000)
  }
  const removeFromCart = (id: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      const next = item && item.quantity > 1
        ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        : prev.filter(i => i.id !== id)
      saveCart(next); setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
  }
  const clearCart = () => {
    setCart([]); setCartCount(0)
    localStorage.removeItem("leder-cart"); localStorage.removeItem("leder-cart-count")
  }
  const suppliers = Array.from(
    new Set(
      products
        .filter(p => activeCategory === "all" || p.category === activeCategory)
        .map(p => p.supplier)
        .filter((s): s is string => !!s && s.trim() !== "")
    )
  ).sort()

  // Reset supplier when it's not available in the current category
  useEffect(() => {
    if (activeSupplier !== "all" && !suppliers.includes(activeSupplier)) {
      setActiveSupplier("all")
    }
  }, [activeCategory])

  const filtered = products
    .filter(p => {
      if (showWishlist) return wishlist.has(p.id)
      const matchSearch   = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === "all" || p.category === activeCategory
      const matchSupplier = activeSupplier === "all" || p.supplier === activeSupplier
      const matchStock    = stockFilter === "out_of_stock" ? (p.stock ?? 0) === 0 : (p.stock ?? 0) > 0
      return matchSearch && matchCategory && matchSupplier && matchStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name_asc":   return a.name.localeCompare(b.name)
        case "name_desc":  return b.name.localeCompare(a.name)
        case "price_asc":  return a.price - b.price
        case "price_desc": return b.price - a.price
        default: return 0
      }
    })

  const visibleProducts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleSelect    = useCallback((p: Product) => router.push(`/product/${p.id}`), [])
  const handleAddToCart = useCallback((p: Product) => addToCart(p), [addedIds, cart]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Views ────────────────────────────────────────────────────────────────
  if (currentView === "checkout") {
    return <CheckoutPage cart={cart} onBackToStore={() => setCurrentView("products")} onClearCart={clearCart} onAddToCart={(p: any) => addToCart(p)} onRemoveFromCart={removeFromCart} />
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-4 bg-gray-100 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-3">{error}</p>
          <button onClick={loadProducts} className="text-sm font-medium text-gray-600 underline">Erneut versuchen</button>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {showUserProfile && (
        <UserProfile
          onClose={() => setShowUserProfile(false)}
          onAccountDeleted={() => setShowUserProfile(false)}
        />
      )}

      <ShoppingCartComponent
        isOpen={cartOpen} onOpenChange={setCartOpen} cart={cart}
        onAddToCart={(p: any) => addToCart(p)} onRemoveFromCart={removeFromCart}
        onGoToCheckout={() => { setCartOpen(false); setCurrentView("checkout") }}
        onClearCart={clearCart}
      />


      {/* Back to top */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-5 z-40 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3 shadow-xl border border-gray-200 transition-all hover:scale-110 active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}


<div className="min-h-screen bg-[#f7f7f8]">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

            {/* Mobile: Hamburger side menu */}
            <Sheet open={navMenuOpen} onOpenChange={setNavMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] flex-shrink-0">
                  <Menu className="w-5 h-5 text-[#333]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white p-0 flex flex-col">
                <div className="flex items-center p-4 pr-12 border-b border-[#E0E0E0] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="font-black text-[#1A1A1A] text-sm">Leder-Shop</span>
                  </div>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                  <button
                    onClick={() => { router.push("/"); setNavMenuOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] font-medium ${pathname === "/" ? "bg-[#8B5E3C] text-white" : "text-[#333333]"}`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { setActiveCategory("all"); setNavMenuOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] font-medium ${activeCategory === "all" ? "bg-[#8B5E3C] text-white" : "text-[#333333]"}`}
                  >
                    Alle Produkte
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { setActiveCategory(cat.slug); setNavMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] font-medium ${activeCategory === cat.slug ? "bg-[#8B5E3C] text-white" : "text-[#333333]"}`}
                    >
                      {cat.name.replace(/\s*\d{4}$/, "")}
                    </button>
                  ))}
                  <div className="pt-2 mt-1 border-t border-[#E0E0E0] space-y-0.5">
                    <button
                      onClick={() => { router.push("/blog"); setNavMenuOpen(false) }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] font-semibold ${pathname === "/blog" ? "bg-[#8B5E3C] text-white" : "text-[#8B5E3C]"}`}
                    >
                      <Newspaper className="w-4 h-4" />
                      Blog
                    </button>
                    <button
                      onClick={() => { handleDownloadVCard(); setNavMenuOpen(false) }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] font-semibold text-[#8B5E3C]"
                    >
                      <Download className="w-4 h-4" />
                      Digitale Visitenkarte
                    </button>
                    <div className="flex items-center gap-1 pt-1 px-1 justify-end">
                      <div className="[&_span]:hidden flex items-center">
                        <LoginAuth
                          onLoginSuccess={() => {}}
                          onLogout={() => {}}
                          onShowProfile={() => { setShowUserProfile(true); setNavMenuOpen(false) }}
                          isLightSection={true}
                          variant="button"
                        />
                      </div>
                      <button
                        onClick={() => { setCartOpen(true); setNavMenuOpen(false) }}
                        className="p-2 rounded-xl hover:bg-[#F5F5F5] text-[#555]"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Mobile: divider + page title (like blog header) */}
            <div className="lg:hidden w-px h-6 bg-[#E5E5E5] flex-shrink-0" />
            <span className="lg:hidden text-sm font-bold text-[#555] flex-shrink-0">Unsere Produkte</span>

            {/* Desktop: ← Home button */}
            <button
              onClick={() => router.push("/")}
              className="hidden lg:flex items-center gap-2 text-[#555] hover:text-[#8B5E3C] transition-colors group flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full border border-[#E5E5E5] group-hover:border-[#8B5E3C]/60 group-hover:bg-[#8B5E3C]/5 flex items-center justify-center transition-all">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Home</span>
            </button>

            {/* Divider (desktop only) */}
            <div className="hidden lg:block w-px h-6 bg-[#E5E5E5] flex-shrink-0" />

            {/* Logo */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
            </div>

            <div className="hidden md:block w-px h-6 bg-[#E5E5E5] flex-shrink-0" />

            {/* Search — desktop only */}
            <div className="hidden sm:flex flex-1 max-w-lg relative mr-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                placeholder="Produkte suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F3F4F6] rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition-all placeholder-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-[#999] font-semibold hidden lg:block whitespace-nowrap">
              <span className="text-[#1A1A1A] font-black">{filtered.length}</span> Produkte
            </span>

            {/* Right group: wishlist + login + cart */}
            <div className="ml-auto flex items-center gap-1 flex-shrink-0">

            {/* Wishlist icon — mobile only */}
            <button
              onClick={() => setShowWishlist(p => !p)}
              className={`relative flex flex-col items-center p-2 rounded-xl transition-colors ${showWishlist ? "text-red-500 bg-red-50" : "text-[#555] hover:bg-[#F5F5F5]"}`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-[10px] mt-0.5 leading-none hidden sm:block">Wunsch</span>
              {wishlist.size > 0 && (
                <span style={{ backgroundColor: "#ef4444" }} className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.size > 9 ? "9+" : wishlist.size}
                </span>
              )}
            </button>

            {/* Login — hide text label on mobile */}
            <div className="[&_span]:hidden sm:[&_span]:inline-block flex items-center justify-center">
              <LoginAuth
                onLoginSuccess={() => {}}
                onLogout={() => {}}
                onShowProfile={() => setShowUserProfile(true)}
                isLightSection={true}
                variant="button"
              />
            </div>

            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex flex-col items-center p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-[#555]" />
              <span className="text-[10px] text-[#555] mt-0.5 leading-none hidden sm:block">Warenkorb</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B5E3C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            </div>{/* end right group */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* ── Sidebar ── */}
          <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-52 xl:w-60 flex-shrink-0 lg:sticky lg:top-20 lg:self-start`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBEBEB] space-y-5">

              <div>
                <p className="text-[10px] font-black text-[#AAAAAA] uppercase tracking-[0.15em] mb-3">Kategorien</p>
                <ul className="space-y-0.5">
                  {[{ slug: "all", name: "Alle" }, ...categories].map(cat => {
                    const count = cat.slug === "all" ? products.filter(p => (p.stock ?? 0) > 0).length : products.filter(p => p.category === cat.slug).length
                    const isActive = activeCategory === cat.slug
                    return (
                      <li key={cat.slug}>
                        <button
                          onClick={() => { setShowWishlist(false); setActiveCategory(prev => prev === cat.slug ? "all" : cat.slug); setSidebarOpen(false) }}
                          className={`w-full text-left flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                            isActive
                              ? "bg-[#8B5E3C] text-white shadow-sm"
                              : "text-[#555] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]"
                          }`}
                        >
                          <span className="truncate">{cat.name.replace(/\s*\d{4}$/, "")}</span>
                          <span className={`text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? "bg-white/25 text-white" : "bg-[#F0F0F0] text-[#888]"}`}>{count}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="border-t border-[#F3F3F3] pt-4">
                <p className="text-[10px] font-black text-[#AAAAAA] uppercase tracking-[0.15em] mb-3">Verfügbarkeit</p>
                <ul className="space-y-0.5">
                  {([["all", "Auf Lager"], ["out_of_stock", "Ausverkauft"]] as const).map(([val, label]) => (
                    <li key={val}>
                      <button
                        onClick={() => { setShowWishlist(false); setStockFilter(val); setSidebarOpen(false) }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                          stockFilter === val ? "bg-[#8B5E3C] text-white shadow-sm" : "text-[#555] hover:bg-[#F5F5F5]"
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#F3F3F3] pt-4">
                <button
                  onClick={() => { setShowWishlist(p => !p); setActiveCategory("all"); setStockFilter("all"); setSearch(""); setSidebarOpen(false) }}
                  className={`w-full text-left flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                    showWishlist ? "bg-rose-100 text-rose-600 shadow-sm" : "text-[#555] hover:bg-rose-50 hover:text-rose-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart className={`w-3.5 h-3.5 ${showWishlist ? "fill-current" : ""}`} />
                    Wunschliste
                  </span>
                  {wishlist.size > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${showWishlist ? "bg-rose-200 text-rose-600" : "bg-rose-100 text-rose-400"}`}>
                      {wishlist.size}
                    </span>
                  )}
                </button>
              </div>

              {(!showWishlist && (activeCategory !== "all" || stockFilter !== "all" || search)) && (
                <button
                  onClick={() => { setActiveCategory("all"); setActiveSupplier("all"); setStockFilter("all"); setSearch("") }}
                  className="w-full text-xs font-semibold text-[#CC0000]/70 hover:text-[#CC0000] transition-colors text-left flex items-center gap-1.5 pt-1"
                >
                  <X className="w-3 h-3" /> Filter zurücksetzen
                </button>
              )}
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">

            {/* ── Category section title ── */}
            <div className="hidden lg:flex items-start gap-3 mb-3">
              <div className="w-1 self-stretch bg-[#8B5E3C] rounded-full flex-shrink-0" />
              <div>
                <p className="font-black text-[#8B5E3C] text-2xl leading-tight">Unsere Kategorien</p>
                <p className="text-sm text-[#888] mt-1">Lederartikel & Accessoires</p>
              </div>
            </div>

            {/* ── Category image banners — desktop only ── */}
            <div className="hidden lg:block mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3" style={{ flexWrap: "nowrap" }}>
                {/* Alle — default card */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className="relative overflow-hidden rounded-2xl group text-left transition-all duration-300 flex flex-col justify-between p-4"
                  style={{
                    height: "180px", minWidth: "210px", width: "210px", flexShrink: 0,
                    backgroundColor: "#ffffff",
                    border: activeCategory === "all" ? "2px solid #8B5E3C" : "2px solid #E0E0E0",
                    boxShadow: activeCategory === "all" ? "0 8px 32px rgba(139,94,60,0.2)" : "none",
                  }}
                >
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(139,94,60,0.08)" }} />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ backgroundColor: "rgba(139,94,60,0.06)" }} />
                  <div className="absolute top-1/2 right-6 -translate-y-1/2 w-14 h-14 rounded-full" style={{ backgroundColor: "rgba(139,94,60,0.05)" }} />
                  <div className="relative w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(139,94,60,0.12)" }}>
                    <LayoutGrid className="w-6 h-6" style={{ color: "#8B5E3C" }} />
                  </div>
                  <div className="relative">
                    {activeCategory === "all" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#8B5E3C" }}>
                        <Check className="w-3 h-3" /> Aktiv
                      </span>
                    )}
                    <p className="font-black text-base leading-tight tracking-tight" style={{ color: "#8B5E3C" }}>Alle Kategorien</p>
                    <p className="text-[11px] mt-0.5 font-medium text-[#999]">Alles anzeigen →</p>
                  </div>
                </button>
                {categories.map(cat => {
                  const catProds = products.filter(p => p.category === cat.slug || p.category === cat.name)
                  const srcs: string[] = []
                  for (const p of catProds) {
                    const fromUrls = (p.image_urls ?? []).filter((u): u is string => !!u)
                    srcs.push(...fromUrls)
                    if (p.image_url) srcs.push(p.image_url)
                    if (p.image_url_candidates?.length) srcs.push(...p.image_url_candidates)
                  }
                  const uniqueSrcs = [...new Set(srcs)]
                  const isActive = activeCategory === cat.slug
                  const displayName = cat.name.replace(/\s*\d{4}$/, "")
                  return (
                    <CatCard
                      key={cat.slug}
                      srcs={uniqueSrcs}
                      displayName={displayName}
                      isActive={isActive}
                      onClick={() => setActiveCategory(prev => prev === cat.slug ? "all" : cat.slug)}
                    />
                  )
                })}
              </div>
            </div>

            {/* ── Category cards — mobile only ── */}
            <div className="lg:hidden overflow-x-auto mb-3 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-2.5 pb-1" style={{ flexWrap: "nowrap" }}>
                {/* Alle card — mobile */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className="relative overflow-hidden rounded-xl flex-shrink-0 flex flex-col justify-between p-3 transition-all duration-200"
                  style={{
                    width: "110px", height: "120px",
                    backgroundColor: "#fff",
                    border: activeCategory === "all" ? "2px solid #8B5E3C" : "2px solid #E0E0E0",
                    boxShadow: activeCategory === "all" ? "0 4px 16px rgba(139,94,60,0.2)" : "none",
                  }}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ backgroundColor: "rgba(139,94,60,0.07)" }} />
                  <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full" style={{ backgroundColor: "rgba(139,94,60,0.05)" }} />
                  <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(139,94,60,0.12)" }}>
                    <LayoutGrid className="w-4 h-4" style={{ color: "#8B5E3C" }} />
                  </div>
                  <div className="relative">
                    <p className="font-black text-[11px] leading-tight" style={{ color: "#8B5E3C" }}>Alle</p>
                    <p className="text-[10px] text-[#999] mt-0.5">Anzeigen</p>
                  </div>
                </button>
                {categories.map(cat => {
                  const catProds = products.filter(p => p.category === cat.slug || p.category === cat.name)
                  const srcs: string[] = []
                  for (const p of catProds) {
                    const fromUrls = (p.image_urls ?? []).filter((u): u is string => !!u)
                    srcs.push(...fromUrls)
                    if (p.image_url) srcs.push(p.image_url)
                    if (p.image_url_candidates?.length) srcs.push(...p.image_url_candidates)
                  }
                  const uniqueSrcs = [...new Set(srcs)]
                  const isActive = activeCategory === cat.slug
                  const displayName = cat.name.replace(/\s*\d{4}$/, "")
                  return (
                    <MobileCatCard
                      key={cat.slug}
                      srcs={uniqueSrcs}
                      displayName={displayName}
                      isActive={isActive}
                      onClick={() => setActiveCategory(prev => prev === cat.slug ? "all" : cat.slug)}
                    />
                  )
                })}
              </div>
            </div>

            {/* ── Supplier section title ── */}
            {suppliers.length > 0 && (
              <div className="hidden lg:flex items-start gap-3 mb-3">
                <div className="w-1 self-stretch bg-[#8B5E3C] rounded-full flex-shrink-0" />
                <div>
                  <p className="font-black text-[#1A1A1A] text-base leading-tight">Unsere Lieferanten</p>
                  <p className="text-xs text-[#999] mt-0.5">Qualitätsmarken aus aller Welt</p>
                </div>
              </div>
            )}

            {/* ── Supplier badges — scroll horizontal ── */}
            {suppliers.length > 0 && (
              <div className="overflow-x-auto mb-3 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-1.5 min-w-max pb-1">
                  <button
                    onClick={() => setActiveSupplier("all")}
                    className={`px-2 py-0.5 transition-all whitespace-nowrap ${
                      activeSupplier === "all"
                        ? "underline underline-offset-2"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <span className="text-[10px] sm:text-sm uppercase text-[#555] font-black tracking-wider">ALLE</span>
                  </button>
                  {suppliers.map(supplier => {
                    const isActive = activeSupplier === supplier
                    const STYLES: Record<string, string> = {
                      "AIRSOFT":      "text-[#1A1A1A] font-black tracking-widest",
                      "BLACK FLASH":  "text-[#333] font-black tracking-wide",
                      "BLACKFLASH":   "text-[#1A1A1A] font-black tracking-widest",
                      "BÖKER":        "text-[#8B0000] font-black tracking-wide",
                      "FISHERMAN'S":  "text-[#1A5276] font-black",
                      "HALLER":       "text-[#8B5E3C] font-black tracking-wide",
                      "JENZI":        "text-[#FF6600] font-black",
                      "LINDER":       "text-[#333] font-black tracking-wide",
                      "NATURZONE":    "text-[#8B5E3C] font-bold tracking-wide",
                      "POHLFORCE":    "text-[#CC0000] font-black",
                      "SMOKI":        "text-[#8B6914] font-black",
                      "STEAMBOW":     "text-[#1A1A8C] font-black tracking-wider",
                      "SYTONG":       "text-[#003087] font-black tracking-wider",
                      "WILTEC":       "text-[#555] font-black tracking-wide",
                    }
                    const textStyle = STYLES[supplier.toUpperCase()] ?? STYLES[supplier] ?? "text-[#333] font-bold"
                    return (
                      <button
                        key={supplier}
                        onClick={() => setActiveSupplier(prev => prev === supplier ? "all" : supplier)}
                        className={`px-2 py-0.5 transition-all whitespace-nowrap ${
                          isActive ? "underline underline-offset-2" : "opacity-50 hover:opacity-100"
                        }`}
                      >
                        <span className={`text-[10px] sm:text-sm uppercase ${textStyle}`}>
                          {supplier}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Search — mobile only, below brand badges ── */}
            <div className="sm:hidden relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                placeholder="Produkte suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F3F4F6] rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition-all placeholder-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort + count */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-[#888] font-medium">
                <span className="font-black text-[#1A1A1A]">{filtered.length}</span> Produkte
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none text-sm font-semibold text-[#555] bg-white border border-[#E5E5E5] rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 cursor-pointer"
                >
                  <option value="default">Empfehlung</option>
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                  <option value="price_asc">Preis ↑</option>
                  <option value="price_desc">Preis ↓</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAA] pointer-events-none" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                {showWishlist ? (
                  <>
                    <Heart className="w-14 h-14 text-red-200 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-300 mb-2">Wunschliste ist leer</p>
                    <p className="text-sm text-gray-400 mb-4">Klicke auf das Herz bei einem Produkt, um es hinzuzufügen.</p>
                    <button onClick={() => setShowWishlist(false)} className="text-sm font-semibold text-[#8B5E3C] hover:underline">Alle Produkte anzeigen</button>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-300 mb-3">Keine Produkte gefunden</p>
                    <button onClick={() => { setSearch(""); setActiveCategory("all"); setActiveSupplier("all"); setStockFilter("all") }} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                      Filter zurücksetzen
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {visibleProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addedIds={addedIds}
                      wishlist={wishlist}
                      onSelect={handleSelect}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white hover:bg-[#8B5E3C] hover:text-white text-[#1A1A1A] border-2 border-[#8B5E3C]/25 hover:border-[#8B5E3C] rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#8B5E3C]/15 active:scale-[0.98]"
                    >
                      Mehr laden
                      <span className="bg-[#8B5E3C]/10 text-[#8B5E3C] text-xs font-black px-2.5 py-0.5 rounded-full">
                        +{filtered.length - visibleCount}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-[#E0E0E0] py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 pr-4 border-r border-[#E0E0E0]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#8B5E3C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[11px] font-semibold text-[#555] tracking-widest uppercase">Sichere Zahlung</span>
            </div>
            <div className="h-8 px-3 rounded-lg bg-black flex items-center shadow-sm">
              <img src="/twint-logo.svg" alt="TWINT" className="h-5 w-auto" />
            </div>
            <div className="h-8 px-3 rounded-lg bg-[#FFCC00] flex items-center shadow-sm">
              <span className="font-black text-black text-xs tracking-tight">Post<span className="font-normal">Finance</span></span>
            </div>
            <div className="h-8 px-4 rounded-lg bg-[#1A1F71] flex items-center shadow-sm">
              <span className="font-black text-white text-base italic tracking-tight">VISA</span>
            </div>
            <div className="h-8 px-3 rounded-lg bg-white border border-[#E0E0E0] flex items-center gap-1 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
              <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-2" />
              <span className="text-[11px] font-bold text-[#333] ml-1.5">Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
