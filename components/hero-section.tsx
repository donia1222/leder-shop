"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MarqueeBanner } from "./marquee-banner"

const HERO_IMAGE = "/logo.png"

interface Category { id: number; slug: string; name: string }
interface Product { id: number; category?: string; image_url?: string; image_urls?: (string | null)[] }

const BG_COLORS = ["#2D1206", "#3D1F0D", "#4A2C17", "#2D1206", "#3D1F0D", "#4A2C17"]

export function HeroSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [catImages, setCatImages] = useState<Record<string, string>>({})
  const [logoOpacity, setLogoOpacity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      const opacity = Math.max(0, 1 - window.scrollY / 300)
      setLogoOpacity(opacity)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <div className="bg-[#FAF7F4] dark:bg-[#120804]">

      {/* ── Hero editorial split ── */}
      <div id="hero" className="border-b border-[#E8D9C8] dark:border-[#3a2010]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 items-center">

            {/* Mobile image — above text */}
            <div className="lg:hidden w-full flex justify-center py-4" style={{ opacity: logoOpacity, transition: "opacity 0.1s ease-out" }}>
              <img src={HERO_IMAGE} alt="Premium Lederartikel"
                className="w-64 h-64 object-contain transition-transform duration-500 ease-out hover:scale-110 cursor-pointer"
              />
            </div>

            {/* LEFT: Text */}
            <div className="py-8 lg:py-20">

              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#8B5E3C]" />
                <span className="text-[#8B5E3C] text-[11px] font-black uppercase tracking-[0.25em]">Neue Kollektion 2026</span>
              </div>

              {/* Heading */}
              <h1
                className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] leading-[1.02] mb-5"
                style={{ fontSize: "clamp(2.6rem, 4.5vw, 4.2rem)", letterSpacing: "-0.03em" }}
              >
                Premium<br />
                <span className="text-[#8B5E3C]">Lederartikel</span><br />
                & Taschen
              </h1>

              {/* Description */}
              <p className="text-[#777] dark:text-[#B8A080] text-base leading-relaxed mb-8 max-w-md">
                Handgemachte Taschen, Portemonnaies & Accessoires
                aus echtem Leder — für jeden Anlass.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => router.push("/shop")}
                  className="bg-[#2D1206] hover:bg-[#8B5E3C] text-white font-bold px-7 py-3 text-sm rounded-full inline-flex items-center gap-2 transition-all duration-200 shadow-md"
                >
                  Kollektion entdecken <span>→</span>
                </button>
                <button
                  onClick={() => router.push("/shop")}
                  className="text-[#8B5E3C] font-semibold px-7 py-3 text-sm rounded-full transition-all duration-200 hover:bg-[#F5EDE0]"
                  style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #C49A6C33" }}
                >
                  Alle Kategorien
                </button>
              </div>

              {/* Decorative tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["Handgemacht", "Echtes Leder", "Swiss Quality", "Seit 2018"].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-[#F5EDE0] dark:bg-[#2D1206] text-[#8B5E3C] dark:text-[#C49A6C] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E8D9C8] dark:border-[#3a2010]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] inline-block" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-[#E8D9C8] dark:border-[#3a2010]">
                {[
                  { val: "200+", label: "Artikel" },
                  { val: "1–3 Tage", label: "Lieferung" },
                  { val: "100%", label: "Echtes Leder" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] text-xl leading-none">{val}</div>
                    <div className="text-[#AAA] dark:text-[#A89070] text-xs mt-1 tracking-wide uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Single image (desktop only) */}
            <div className="hidden lg:flex items-center justify-center h-full py-6">
              <div className="relative" style={{ width: "440px", height: "490px", opacity: logoOpacity, transition: "opacity 0.1s ease-out" }}>
                <img src={HERO_IMAGE} alt="Premium Leder" className="w-full h-full object-contain transition-transform duration-500 ease-out hover:scale-110 cursor-pointer" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <MarqueeBanner />

      {/* ── Unsere Leder-Kategorien ── */}
      <div id="leder-kategorien" className="bg-white dark:bg-[#1a0b04] border-b border-[#E0E0E0] dark:border-[#3a2010] py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div
                className="inline-block px-3 py-1 rounded-lg mb-3"
                style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #C49A6C33" }}
              >
                <span className="text-xs font-black text-[#2D1206] dark:text-[#C49A6C] uppercase tracking-[0.25em]">Sortiment</span>
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-[#FAF7F4] tracking-tight">Unsere Leder-Kategorien</h2>
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
                <div key={i} className="rounded-2xl overflow-hidden border border-[#EDE0D4] dark:border-[#3a2010] bg-white dark:bg-[#2D1206] animate-pulse">
                  <div className="h-[160px] bg-[#EDE0D4] dark:bg-[#3a1a08]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#EDE0D4] dark:bg-[#3a1a08] rounded-full w-2/3" />
                    <div className="h-3 bg-[#EDE0D4] dark:bg-[#3a1a08] rounded-full w-1/2" />
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
                    className="group cursor-pointer bg-white dark:bg-[#2D1206] rounded-2xl border border-[#EDE0D4] dark:border-[#3a2010] hover:border-[#8B5E3C] hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                      <p className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] text-base leading-tight">{displayName}</p>
                      <span className="w-8 h-8 rounded-full bg-[#F5EDE0] dark:bg-[#3D1F0D] group-hover:bg-[#8B5E3C] flex items-center justify-center text-[#8B5E3C] dark:text-[#C49A6C] group-hover:text-white font-bold text-sm transition-all duration-200 flex-shrink-0">
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
