"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductImage } from "./product-image"

interface Product {
  id: number
  name: string
  price: number
  original_price?: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  badge?: string
  category?: string
  stock?: number
}

export function RecommendedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const markFailed = (id: number) =>
    setFailedIds(prev => new Set([...prev, id]))

  useEffect(() => {
    let cancelled = false

    const load = async (retries = 2): Promise<void> => {
      try {
        const r = await fetch(`/api/products`)
        if (!r.ok) throw new Error(`${r.status}`)
        const data = await r.json()
        if (!data.success || cancelled) return

        const allProducts: Product[] = data.products

        const hasImage = (p: Product) =>
          !!(p.image_url && /\.(jpg|jpeg|png|webp|gif)$/i.test(p.image_url))

        const inStock = [
          ...allProducts.filter((p) => (p.stock ?? 1) > 0 && hasImage(p)),
          ...allProducts.filter((p) => (p.stock ?? 1) > 0 && !hasImage(p)),
        ]

        const byCategory: Record<string, Product[]> = {}
        for (const p of inStock) {
          const key = p.category || "other"
          if (!byCategory[key]) byCategory[key] = []
          byCategory[key].push(p)
        }

        const selected: Product[] = []
        for (const catProducts of Object.values(byCategory)) {
          selected.push(...catProducts.slice(0, 3))
          if (selected.length >= 24) break
        }
        if (selected.length < 24) {
          const ids = new Set(selected.map((p) => p.id))
          for (const p of inStock) {
            if (!ids.has(p.id)) { selected.push(p); if (selected.length >= 24) break }
          }
        }

        setProducts(selected.slice(0, 24))
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

  const visibleProducts = products.filter(p => !failedIds.has(p.id)).slice(0, 12)

  if (loading) return (
    <section className="border-t border-[#E0E0E0]">
      <div className="h-[260px] bg-[#2D1206] animate-pulse" />
      <div className="bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-gray-100 rounded-2xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-5/6 mb-1" />
                <div className="h-3 bg-gray-100 rounded-full w-3/4 mb-1" />
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  if (visibleProducts.length === 0) return null

  return (
    <section className="border-t border-[#E0E0E0]">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden" style={{ minHeight: "260px" }}>
        <img
          src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1400&h=300&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)", transformOrigin: "center 60%" }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = "none"
            if (el.parentElement) {
              el.parentElement.style.background = "linear-gradient(135deg, #2D1206 0%, #6B4226 100%)"
            }
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(45,18,6,0.94) 0%, rgba(45,18,6,0.78) 55%, rgba(45,18,6,0.30) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(45,18,6,0.6) 0%, transparent 60%)" }}
        />

        {/* Content */}
        <div className="relative h-full container mx-auto px-6 flex items-center justify-between gap-8 py-12">
          {/* Left: title */}
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#C49A6C]" />
              <span className="text-[#C49A6C] text-[11px] font-black uppercase tracking-[0.25em]">
                Empfohlen für dich
              </span>
            </div>
            <h2
              className="text-white font-black leading-[1.05] mb-3"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              Unsere Favoriten
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Handverlesene Lederartikel aus unserem Sortiment —<br className="hidden sm:block" />
              ausgewählt für Qualität und Stil.
            </p>
          </div>

          {/* Right: stats + CTA */}
          <div className="hidden md:flex flex-col items-end gap-5 flex-shrink-0">
            <div className="flex gap-8">
              {[
                { val: "200+", lbl: "Artikel" },
                { val: "100%", lbl: "Echtleder" },
                { val: "Swiss", lbl: "Qualität" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="text-right">
                  <div className="text-white font-black text-xl leading-none">{val}</div>
                  <div className="text-white/40 text-xs mt-1 tracking-wide">{lbl}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="inline-flex items-center gap-2 bg-[#C49A6C] hover:bg-white text-[#2D1206] font-bold px-6 py-2.5 rounded-full text-sm transition-all duration-200 shadow-lg"
            >
              Alle Produkte <span>→</span>
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, #C49A6C55, transparent)" }}
        />
      </div>

      {/* ── Product grid ── */}
      <div className="bg-[#Fffff] py-10 border-b border-[#D9C4A8]">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {visibleProducts.map((product) => {
              const hasDiscount =
                product.original_price && product.original_price > product.price
              const discountPct = hasDiscount
                ? Math.round(
                    ((product.original_price! - product.price) /
                      product.original_price!) *
                      100
                  )
                : null

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E8D9C8] hover:border-[#8B5E3C]/50"
                >
                  {/* Image */}
                  <div className="relative bg-[#2D1206] overflow-hidden aspect-square">
                    <ProductImage
                      src={product.image_url}
                      candidates={product.image_url_candidates}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onAllFailed={() => markFailed(product.id)}
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discountPct && (
                        <span className="bg-[#8B5E3C] text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none shadow-sm">
                          -{discountPct}%
                        </span>
                      )}
                      {product.badge && (
                        <span className="bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shadow-sm">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-white text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        Ansehen →
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-[#1A1A1A] leading-tight line-clamp-2 mb-1.5 group-hover:text-[#8B5E3C] transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-[#8B5E3C]">
                        CHF {product.price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-[#BBB] line-through">
                          CHF {product.original_price!.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 sm:hidden">
            <button
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 rounded-2xl border-2 border-[#8B5E3C]/20 hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 text-sm font-bold text-[#8B5E3C] transition-all duration-200"
            >
              Alle Produkte entdecken →
            </button>
          </div>

        </div>
      </div>

    </section>
  )
}
