"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Category { id: number; slug: string; name: string }
interface Product { id: number; category?: string; image_url?: string; image_urls?: (string | null)[] }

const BG_COLORS = ["#2D1206", "#3D1F0D", "#4A2C17", "#2D1206", "#3D1F0D", "#4A2C17"]

export function HeroSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [catImages, setCatImages] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ])
        const catData = await catRes.json()
        const prodData = await prodRes.json()

        if (!catData.success || !prodData.success) return

        const cats: Category[] = catData.categories
        const products: Product[] = prodData.products

        // Build map: slug → random product image from that category
        const imgMap: Record<string, string> = {}
        for (const cat of cats) {
          const matching = products.filter(
            (p) => p.category === cat.slug && (p.image_url || (p.image_urls && p.image_urls[0]))
          )
          if (matching.length > 0) {
            const pick = matching[Math.floor(Math.random() * matching.length)]
            imgMap[cat.slug] = pick.image_url || pick.image_urls?.find(Boolean) || ""
          }
        }

        setCategories(cats)
        setCatImages(imgMap)
      } catch {}
    }
    load()
  }, [])

  return (
    <div className="bg-white">

      {/* ── Trust bar ── */}
      <div className="border-b border-[#E0E0E0] bg-white">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm text-[#333333]">
            {[
              "100% Handgemacht",
              "Schnelle Lieferung",
              "14 Tage Rückgaberecht",
              "200+ Lederartikel",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-[#8B5E3C] font-bold">✓</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div
        id="hero"
        className="relative w-full overflow-hidden"
        style={{ minHeight: "520px" }}
      >
        {/* Background photo — leather craft */}
        <img
          src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1600&h=600&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)", transformOrigin: "center center" }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = "none"
            if (el.parentElement) {
              el.parentElement.style.background =
                "linear-gradient(135deg, #2D1206 0%, #6B4226 50%, #8B5E3C 100%)"
            }
          }}
        />
        {/* Cinematic overlay — dark left, fade right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.58) 45%, rgba(0,0,0,0.18) 100%)",
          }}
        />
        {/* Vignette bottom */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 flex items-center" style={{ minHeight: "520px" }}>
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="bg-[#8B5E3C] text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                ✦ Neue Kollektion
              </span>
              <span className="text-white/55 text-xs font-medium tracking-wide">Handgemacht & Einzigartig</span>
            </div>

            <h1
              className="text-white font-black leading-[1.05] mb-5"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                letterSpacing: "-0.02em",
              }}
            >
              Premium Leder-<br />
              <span className="text-[#C49A6C]">artikel & Taschen</span>
            </h1>

            <p className="text-white/75 text-lg mb-8 leading-relaxed max-w-lg">
              Handgemachte Taschen, Portemonnaies & Accessoires<br />
              aus echtem Leder — für jeden Anlass.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/shop")}
                className="bg-white text-[#1A1A1A] font-bold px-8 py-3.5 text-sm hover:bg-[#F0F0F0] transition-all rounded-full inline-flex items-center gap-2 shadow-xl"
              >
                Kollektion entdecken <span className="text-base">→</span>
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3.5 text-sm transition-all rounded-full hover:bg-white/10"
              >
                Alle Kategorien
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/12">
              {[
                { val: "200+", label: "Artikel" },
                { val: "1–3 Tage", label: "Lieferung" },
                { val: "100%", label: "Echtes Leder" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-white font-black text-xl leading-none">{val}</div>
                  <div className="text-white/45 text-xs mt-1 tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right accent line */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#8B5E3C]/70 to-transparent" />
      </div>

     

      {/* ── Unsere Leder-Kategorien ── */}
      <div id="leder-kategorien" className="bg-white border-b border-[#E0E0E0] py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-[0.2em] mb-2">Sortiment</p>
              <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Unsere Leder-Kategorien</h2>
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E3C] border border-[#8B5E3C]/30 hover:border-[#8B5E3C] px-4 py-2 rounded-full transition-all duration-200"
            >
              Alle Produkte <span>→</span>
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#EDE0D4] animate-pulse">
                  <div className="h-[160px] bg-[#EDE0D4]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#EDE0D4] rounded-full w-2/3" />
                    <div className="h-3 bg-[#EDE0D4] rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {categories.map((cat, i) => {
                const img = catImages[cat.slug]
                const bg = BG_COLORS[i % BG_COLORS.length]
                const displayName = cat.name.replace(/\s*\d{4}$/, "")
                return (
                  <div
                    key={cat.slug}
                    onClick={() => router.push(`/shop?cat=${encodeURIComponent(cat.slug)}`)}
                    className="group cursor-pointer bg-white rounded-2xl border border-[#EDE0D4] hover:border-[#8B5E3C] hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative overflow-hidden" style={{ height: "160px", backgroundColor: bg }}>
                      {img && (
                        <img
                          src={img}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <p className="font-black text-[#1A1A1A] text-base leading-tight">{displayName}</p>
                      <span className="w-8 h-8 rounded-full bg-[#F5EDE0] group-hover:bg-[#8B5E3C] flex items-center justify-center text-[#8B5E3C] group-hover:text-white font-bold text-sm transition-all duration-200 flex-shrink-0">
                        →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
