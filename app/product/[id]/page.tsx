"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, ShoppingCart, Check, MapPin, X, ZoomIn } from "lucide-react"
import { ProductImage } from "@/components/product-image"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  badge?: string
  origin?: string
  supplier?: string
  category?: string
  stock?: number
}

interface CartItem {
  id: number; name: string; price: number; image: string; image_url?: string
  description: string; heatLevel: number; rating: number
  badge?: string; origin?: string; quantity: number
}

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const backTo = searchParams.get("back")

  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [failedSimilar, setFailedSimilar] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false })
  const lightboxImgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cantina-cart")
      if (saved) {
        const items: CartItem[] = JSON.parse(saved)
        setCartCount(items.reduce((s, i) => s + i.quantity, 0))
      }
    } catch {}
  }, [added])

  const markSimilarFailed = (id: number) =>
    setFailedSimilar(prev => new Set([...prev, id]))

  useEffect(() => {
    setImgIdx(0)
    setProduct(null)
    setSimilar([])
    setFailedSimilar(new Set())
    setLoading(true)
    setError("")

    fetch(`/api/products?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product)
          // Fetch similar from cache (no extra PHP call)
          fetch("/api/products")
            .then(r => r.json())
            .then(all => {
              if (!all.success) return
              const cat = data.product.category
              const hasImage = (p: Product) =>
                getImages(p).length > 0 || !!(p.image_url) || !!(p.image_url_candidates?.length)
              const others: Product[] = all.products.filter(
                (p: Product) => p.id !== data.product.id && p.category === cat && (p.stock ?? 0) > 0 && hasImage(p)
              )
              setSimilar(others.slice(0, 10))
            })
            .catch(() => {})
        } else {
          setError("Produkt nicht gefunden")
        }
      })
      .catch(() => setError("Verbindungsfehler"))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = () => {
    if (!product) return
    try {
      const saved = localStorage.getItem("cantina-cart")
      const cart: CartItem[] = saved ? JSON.parse(saved) : []
      const images = getImages(product)
      const exists = cart.find(i => i.id === product.id)
      const next = exists
        ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...cart, {
            id: product.id, name: product.name, price: product.price,
            image: images[0] ?? "/placeholder.svg",
            image_url: images[0],
            image_url_candidates: product.image_url_candidates,
            description: product.description,
            heatLevel: 0, rating: 0,
            badge: product.badge, origin: product.origin, quantity: 1,
          }]
      localStorage.setItem("cantina-cart", JSON.stringify(next))
      localStorage.setItem("cantina-cart-count", next.reduce((s, i) => s + i.quantity, 0).toString())
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
  }

  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect || !touch) return
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  const handleLightboxTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect || !touch) return
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <div className="bg-white border-b border-[#E0E0E0] h-14 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-[#EBEBEB] overflow-hidden animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-100 aspect-square" />
            <div className="p-8 flex flex-col gap-4">
              <div className="h-3 w-24 bg-gray-100 rounded-full" />
              <div className="h-8 w-4/5 bg-gray-200 rounded-full" />
              <div className="h-6 w-32 bg-gray-100 rounded-full" />
              <div className="h-28 bg-gray-100 rounded-2xl" />
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                <div className="h-8 w-32 bg-gray-200 rounded-full" />
                <div className="h-14 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-[#666] font-semibold">{error || "Produkt nicht gefunden"}</p>
      <button onClick={() => backTo ? router.push(`/${backTo}`) : router.back()} className="text-sm text-[#2C5F2E] font-bold underline">
        Zurück
      </button>
    </div>
  )

  const images = getImages(product)
  const inStock = (product.stock ?? 0) > 0

  return (
    <div className="min-h-screen bg-[#F7F7F8]">

      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => backTo ? router.push(`/${backTo}`) : router.back()}
            className="flex items-center gap-2 text-[#555] hover:text-[#2C5F2E] transition-colors group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full border border-[#E5E5E5] group-hover:border-[#2C5F2E]/60 group-hover:bg-[#2C5F2E]/5 flex items-center justify-center transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold hidden sm:block">Zurück</span>
          </button>
          <div className="w-px h-6 bg-[#E5E5E5] flex-shrink-0" />
          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{product.name}</p>
          <button
            onClick={() => router.push("/?checkout=true")}
            className="ml-auto relative flex items-center justify-center w-10 h-10 hover:bg-[#F5F5F5] rounded-xl transition-colors flex-shrink-0"
          >
            <ShoppingCart className="w-5 h-5 text-[#555]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-[#EBEBEB] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Image side */}
            <div className="bg-[#F8F8F8] p-6 flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-[#F0F0F0]">
              <div
                className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-white shadow-sm cursor-zoom-in"
                onClick={() => setLightbox(true)}
                title="Klicken zum Vergrößern"
              >
                {images.length > 0 ? (
                  <img
                    src={images[imgIdx]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400" }}
                  />
                ) : (
                  <ProductImage
                    src={product.image_url}
                    candidates={product.image_url_candidates}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                )}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#2C5F2E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-[#1A1A1A]/80 text-white text-sm font-bold px-4 py-2 rounded-full">
                      Ausverkauft
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIdx
                          ? "border-[#2C5F2E] shadow-md scale-105"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info side */}
            <div className="p-6 md:p-8 flex flex-col gap-4">

              {(product.supplier || product.origin) && (() => {
                const BRANDS: Record<string, { color: string; domain: string }> = {
                  "AIRSOFT":      { color: "text-[#1A1A1A]", domain: "airsoft.ch" },
                  "BLACK FLASH":  { color: "text-[#333]",    domain: "black-flash-archery.com" },
                  "BLACKFLASH":   { color: "text-[#1A1A1A]", domain: "black-flash-archery.com" },
                  "BÖKER":        { color: "text-[#8B0000]", domain: "boker.de" },
                  "FISHERMAN'S":  { color: "text-[#1A5276]", domain: "fishermans-partner.eu" },
                  "HALLER":       { color: "text-[#2C5F2E]", domain: "haller-stahlwaren.de" },
                  "JENZI":        { color: "text-[#FF6600]", domain: "jenzi.com" },
                  "LINDER":       { color: "text-[#333]",    domain: "linder.de" },
                  "NATURZONE":    { color: "text-[#2C5F2E]", domain: "naturzone.ch" },
                  "POHLFORCE":    { color: "text-[#CC0000]", domain: "pohlforce.de" },
                  "SMOKI":        { color: "text-[#8B6914]", domain: "smoki-raeuchertechnik.de" },
                  "STEAMBOW":     { color: "text-[#1A1A8C]", domain: "steambow.at" },
                  "SYTONG":       { color: "text-[#003087]", domain: "sytong.global" },
                  "WILTEC":       { color: "text-[#555]",    domain: "wiltec.de" },
                }
                const label = (product.supplier || product.origin || "").toUpperCase()
                const brand = BRANDS[label]
                return (
                  <div className="flex items-center gap-2">
                    {brand && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                        alt={label}
                        className="h-5 w-auto object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                      />
                    )}
                    <p className={`text-sm font-black uppercase tracking-widest ${brand?.color ?? "text-[#888]"}`}>
                      {label}
                    </p>
                  </div>
                )
              })()}

              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${
                inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                {inStock ? `Auf Lager · ${product.stock} Stück` : "Nicht verfügbar"}
              </div>

              {product.description && (
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#F0F0F0]">
                  <p className="text-[11px] font-bold text-[#BBBBBB] uppercase tracking-widest mb-2">
                    Beschreibung
                  </p>
                  <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {product.origin && (
                <div className="flex items-center gap-1.5 text-xs text-[#999]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{product.origin}</span>
                </div>
              )}

              {/* Price + CTA */}
              <div className="mt-auto pt-5 border-t border-[#F0F0F0]">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-base text-[#999] font-medium">CHF</span>
                </div>
                <p className="text-xs text-[#999] mb-4">* Preise inkl. MwSt., zzgl. Versandkosten</p>
                <button
                  onClick={addToCart}
                  disabled={!inStock}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                    added
                      ? "bg-emerald-500 text-white"
                      : inStock
                        ? "bg-[#2C5F2E] hover:bg-[#1A4520] text-white shadow-lg shadow-[#2C5F2E]/20 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {added ? "Hinzugefügt!" : inStock ? "In den Warenkorb" : "Ausverkauft"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Similar products */}
      {(() => {
        const visible = similar.filter(p => !failedSimilar.has(p.id)).slice(0, 4)
        if (visible.length === 0) return null
        return (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="border-t border-[#E8E8E8] pt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-[#2C5F2E] rounded-full" />
                <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">Ähnliche Produkte</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {visible.map(p => {
                  const imgs = getImages(p)
                  return (
                    <div
                      key={p.id}
                      onClick={() => router.replace(`/product/${p.id}?back=shop`)}
                      className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="aspect-square bg-[#F8F8F8] overflow-hidden">
                        {imgs.length > 0 ? (
                          <img
                            src={imgs[0]}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => markSimilarFailed(p.id)}
                          />
                        ) : (
                          <ProductImage
                            src={p.image_url}
                            candidates={p.image_url_candidates}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onAllFailed={() => markSimilarFailed(p.id)}
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight mb-1">
                          {p.name}
                        </p>
                        <p className="text-sm font-black text-[#2C5F2E]">
                          CHF {p.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Trust badges */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "100% Schweizer Shop",
            "Schnelle Lieferung",
            "14 Tage Rückgaberecht",
            "500+ Artikel im Sortiment",
          ].map((feat) => (
            <div
              key={feat}
              className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-2 shadow-sm"
            >
              <span className="w-5 h-5 rounded-full bg-[#2C5F2E] flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </span>
              <span className="text-xs font-semibold text-[#333]">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => { setLightbox(false); setZoom({ x: 50, y: 50, active: false }) }}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => { setLightbox(false); setZoom({ x: 50, y: 50, active: false }) }}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            ref={lightboxImgRef}
            className="relative overflow-hidden rounded-xl cursor-crosshair select-none bg-[#111]"
            style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto" }}
            onClick={e => e.stopPropagation()}
            onMouseMove={handleLightboxMouseMove}
            onMouseLeave={() => setZoom(z => ({ ...z, active: false }))}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={() => setZoom(z => ({ ...z, active: false }))}
          >
            <div
              className="w-full h-full transition-transform duration-75"
              style={zoom.active ? {
                transform: `scale(2.5)`,
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              } : { transform: "scale(1)", transformOrigin: "center" }}
            >
              {images.length > 0 ? (
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  className="block max-w-[90vw] max-h-[90vh] w-auto h-auto bg-white"
                  draggable={false}
                  onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg?height=800&width=800" }}
                />
              ) : (
                <ProductImage
                  src={product.image_url}
                  candidates={product.image_url_candidates}
                  alt={product.name}
                  className="w-full h-full object-contain bg-white"
                />
              )}
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); setZoom({ x: 50, y: 50, active: false }) }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); setZoom({ x: 50, y: 50, active: false }) }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment methods */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 pr-4 border-r border-[#E0E0E0]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#2C5F2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
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
  )
}
