"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductImage } from "./product-image"

interface Product {
  id: number
  name: string
  price: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  category?: string
  stock?: number
}

interface Category {
  id: number
  slug: string
  name: string
}

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

const CATEGORY_CONFIG = [
  {
    keyword:     "Handtaschen",
    label:       "Unsere Handtaschen",
    cat:         "Handtaschen",
    image:       "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=400&fit=crop&auto=format",
    emoji:       "👜",
    headline:    ["Echtleder.", "Zeitlos."],
    accent:      "Einzigartig.",
    description: "Handgefertigte Ledertaschen für jeden Anlass — Qualität, die man spürt.",
    accentColor: "#C49A6C",
    overlayFrom: "#2D1206",
    stats:       [["20+", "Modelle"], ["100%", "Echtleder"], ["Swiss", "Service"]],
    ctaLabel:    "Alle Handtaschen entdecken",
    catParam:    "Handtaschen",
  },
  {
    keyword:     "Portemonnaies",
    label:       "Unsere Portemonnaies",
    cat:         "Portemonnaies",
    image:       "https://images.unsplash.com/photo-1627123424574-724758594913?w=1200&h=400&fit=crop&auto=format",
    emoji:       "👛",
    headline:    ["Schlicht.", "Edel."],
    accent:      "Perfekt.",
    description: "Echtleder Portemonnaies & Geldbörsen — handgemacht mit Liebe zum Detail.",
    accentColor: "#C49A6C",
    overlayFrom: "#2D1206",
    stats:       [["15+", "Modelle"], ["Top", "Qualität"], ["Gratis", "Beratung"]],
    ctaLabel:    "Alle Portemonnaies entdecken",
    catParam:    "Portemonnaies",
  },
]

export function CategoryPreviewSection() {
  const router = useRouter()
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [failedIds, setFailedIds]   = useState<Set<number>>(new Set())

  const markFailed = (id: number) =>
    setFailedIds(prev => new Set([...prev, id]))

  useEffect(() => {
    let cancelled = false
    const load = async (retries = 2): Promise<void> => {
      try {
        const [r1, r2] = await Promise.all([fetch("/api/products"), fetch("/api/categories")])
        if (!r1.ok || !r2.ok) throw new Error("not ok")
        const [prodData, catData] = await Promise.all([r1.json(), r2.json()])
        if (cancelled) return
        if (prodData.success) setProducts(prodData.products)
        if (catData.success) setCategories(catData.categories)
      } catch {
        if (!cancelled && retries > 0) {
          await new Promise(r => setTimeout(r, 1500))
          return load(retries - 1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <div className="bg-[#F5EDE0] dark:bg-[#120804] border-t border-[#E0E0E0] dark:border-[#3a2010] py-12">
      <div className="container mx-auto px-4 space-y-6">
        {[0, 1].map(i => (
          <div key={i} className="rounded-3xl overflow-hidden bg-white dark:bg-[#2D1206] border border-[#EBEBEB] dark:border-[#3a2010] shadow-sm animate-pulse">
            <div className="h-[280px] bg-gray-200 dark:bg-[#3a1a08]" />
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-[#3a2010]">
                  <div className="aspect-square bg-gray-100 dark:bg-[#3a1a08]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 dark:bg-[#3a1a08] rounded-full w-5/6" />
                    <div className="h-3 bg-gray-100 dark:bg-[#3a1a08] rounded-full w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-[#3a2010] rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <div className="h-12 bg-gray-100 dark:bg-[#3a1a08] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const sections = CATEGORY_CONFIG.flatMap(({ keyword, label, cat, image, emoji, headline, accent, description, accentColor, overlayFrom, stats, ctaLabel, catParam }) => {
    const apiCat = categories.find(c => c.name.toLowerCase().includes(keyword.toLowerCase()))
    if (!apiCat) return []
    const catProducts = products.filter(p => p.category === apiCat.slug && (p.stock ?? 1) > 0).slice(0, 12)
    if (catProducts.length === 0) return []
    return [{ label, cat, image, emoji, headline, accent, description, accentColor, overlayFrom, stats, ctaLabel, catParam, products: catProducts }]
  })

  if (sections.length === 0) return null

  return (
    <div className="bg-[#F5EDE0] border-t border-[#E0E0E0] py-12">
      <div className="container mx-auto px-4 space-y-6">

        {sections.map(({ label, cat, image, emoji, headline, accent, description, accentColor, overlayFrom, stats, ctaLabel, catParam, products: catProducts }) => {
          const visible = catProducts.filter(p => !failedIds.has(p.id)).slice(0, 6)
          if (visible.length === 0) return null
          return (
            <div key={cat} className="rounded-3xl overflow-hidden bg-white border border-[#EBEBEB] shadow-md">

              {/* ── Banner ── */}
              <div className="relative h-[260px] sm:h-[380px] group overflow-hidden cursor-pointer"
                onClick={() => router.push(`/shop?cat=${encodeURIComponent(catParam)}`)}>

                <img
                  src={image}
                  alt={label}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${overlayFrom} 0%, ${overlayFrom}e6 35%, ${overlayFrom}88 65%, ${overlayFrom}11 100%)` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                <div className="relative h-full flex flex-col justify-center px-6 sm:px-14 max-w-xl gap-3 sm:gap-5 py-6 sm:py-10">
                  <span
                    className="inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border"
                    style={{ backgroundColor: `${accentColor}22`, color: accentColor, borderColor: `${accentColor}55` }}
                  >
                    {emoji} {label}
                  </span>

                  <h2 className="text-white font-black text-2xl sm:text-4xl leading-[1.1]" style={{ letterSpacing: "-0.02em" }}>
                    {headline[0]}<br />
                    {headline[1]} <span style={{ color: accentColor }}>{accent}</span>
                  </h2>

                  <p className="text-white/65 text-xs sm:text-sm leading-relaxed max-w-xs hidden sm:block">
                    {description}
                  </p>

                  <div className="flex gap-5 sm:gap-7">
                    {stats.map(([val, lbl]) => (
                      <div key={lbl}>
                        <p className="text-white font-black text-base sm:text-lg leading-none">{val}</p>
                        <p className="text-white/45 text-[10px] sm:text-[11px] mt-1">{lbl}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    className="self-start font-bold px-6 py-3 text-sm rounded-xl inline-flex items-center gap-2 shadow-xl transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: accentColor, color: overlayFrom }}
                  >
                    {ctaLabel} →
                  </button>
                </div>
              </div>

              {/* ── 4 Product cards ── */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {visible.map((product, i) => {
                  const imgs = getImages(product)
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/product/${product.id}`)}
                      className={`group bg-white rounded-2xl overflow-hidden border border-[#EBEBEB] hover:border-[#D5D5D5] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${i >= 4 ? "hidden sm:block" : ""}`}
                    >
                      <div className="aspect-square bg-[#F8F8F8] overflow-hidden">
                        {imgs.length > 0 ? (
                          <img
                            src={imgs[0]}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => markFailed(product.id)}
                          />
                        ) : (
                          <ProductImage
                            src={product.image_url}
                            candidates={product.image_url_candidates}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onAllFailed={() => markFailed(product.id)}
                          />
                        )}
                      </div>
                      <div className="p-3 flex flex-col h-[72px]">
                        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight group-hover:text-[#8B5E3C] transition-colors flex-1">
                          {product.name}
                        </p>
                        {product.price > 0 && (
                          <p className="text-sm font-black text-[#1A1A1A] mt-1">
                            CHF {product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Footer CTA ── */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => router.push(`/shop?cat=${encodeURIComponent(catParam)}`)}
                  className="w-full py-3.5 rounded-2xl border-2 border-[#8B5E3C]/20 hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 text-sm font-bold text-[#8B5E3C] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Mehr aus {label} entdecken <span className="text-base">→</span>
                </button>
              </div>

            </div>
          )
        })}

        {/* ── Lederwerkstatt Banner ── */}
        <div className="relative rounded-3xl overflow-hidden h-[420px] group">
          <img
            src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1200&h=420&fit=crop&auto=format"
            alt="Lederwerkstatt"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D1206] via-[#2D1206]/80 to-[#2D1206]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1206]/70 via-transparent to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-10 max-w-lg gap-5">
            <span className="inline-flex items-center gap-1.5 self-start bg-[#C49A6C]/20 text-[#C49A6C] border border-[#C49A6C]/40 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">
              🧵 Handwerk & Tradition
            </span>
            <h2 className="text-white font-black text-4xl leading-[1.1]" style={{ letterSpacing: "-0.02em" }}>
              Echtes Leder,<br />
              <span className="text-[#C49A6C]">echte Handarbeit</span>
            </h2>
            <p className="text-white/65 text-sm leading-relaxed max-w-xs">
              Jedes Stück wird mit Sorgfalt und Leidenschaft von Hand gefertigt — für Liebhaber echter Qualität.
            </p>
            <div className="flex gap-7">
              {[["200+", "Produkte"], ["100%", "Echtleder"], ["Gratis", "Beratung"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="text-white font-black text-lg leading-none">{val}</p>
                  <p className="text-white/45 text-[11px] mt-1">{lbl}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="self-start bg-[#C49A6C] text-[#2D1206] font-bold px-6 py-3 text-sm hover:bg-white transition-all duration-200 rounded-xl inline-flex items-center gap-2 shadow-xl"
            >
              Jetzt entdecken →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
