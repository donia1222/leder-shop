"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

interface GalleryImage {
  id: number
  title?: string
  image_url: string
  created_at: string
}

// Fallback static images (used if API returns nothing)
const STATIC_IMAGES = [
  "/images/ledershop/063a0dda-3b21-4fb9-891d-774337100655.JPG",
  "/images/ledershop/0dbe1c2e-33d5-4a19-afb1-281c1e310167.JPG",
  "/images/ledershop/12cb7965-db69-469c-834e-5ed34b377792.JPG",
  "/images/ledershop/3097d259-3ccb-4f7f-95ba-4ecb1e2abb90.JPG",
  "/images/ledershop/417b9c50-f89d-4d06-a161-69564f8f82ae.JPG",
  "/images/ledershop/51ba66c7-69d5-4a5a-84d1-2640d7997fa6%202.JPG",
  "/images/ledershop/5334dcf7-009d-4924-8ef1-bf5ca30bed8a.JPG",
  "/images/ledershop/588ac1f5-d4cf-4171-a057-4bf8c45a227b.JPG",
  "/images/ledershop/6eac3e62-85e9-49b2-920e-db1e9d25840c%202.JPG",
  "/images/ledershop/bafdef0f-291e-4382-956d-7ad9a3710c36%202.JPG",
  "/images/ledershop/c02832ce-6513-4994-ba9e-e79b758de2ba.JPG",
  "/images/ledershop/c89bb77c-1d22-4e31-9dd3-516cc71e2fc3%202.JPG",
  "/images/ledershop/cc8c699b-ab1f-4a35-9e4f-656dc4baac2b%202.JPG",
  "/images/ledershop/IMG_0005%202.JPG",
  "/images/ledershop/IMG_0007%202.JPG",
  "/images/ledershop/IMG_1007%202.JPG",
  "/images/ledershop/IMG_2344%202.PNG",
  "/images/ledershop/upload/IMG_2332.jpeg",
]

export default function GaleriePage() {
  const router = useRouter()
  const [images, setImages] = useState<{ src: string; title?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [failed, setFailed] = useState<Set<number>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/gallery")
        const data = await res.json()
        if (data.success && (data.images ?? data.gallery ?? []).length > 0) {
          const imgs: GalleryImage[] = data.images ?? data.gallery ?? []
          setImages(imgs.map(img => ({ src: img.image_url, title: img.title })))
        } else {
          // Fallback to static images
          setImages(STATIC_IMAGES.map(src => ({ src })))
        }
      } catch {
        setImages(STATIC_IMAGES.map(src => ({ src })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const visible = images.filter((_, i) => !failed.has(i))

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() =>
    setLightbox(i => i !== null ? (i - 1 + visible.length) % visible.length : null),
  [visible.length])
  const next = useCallback(() =>
    setLightbox(i => i !== null ? (i + 1) % visible.length : null),
  [visible.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox, prev, next, closeLightbox])

  // prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [lightbox])

  return (
    <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#120804]">

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#1a0b04] border-b border-[#E0E0E0] dark:border-[#3a2010]">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#6B4226]/30 text-[#6B4226] hover:bg-[#6B4226] hover:text-white hover:border-[#6B4226] transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#E0E0E0]" />
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #C49A6C33" }}
          >
            <div className="font-black text-[#2D1206] dark:text-[#C49A6C] text-base leading-tight tracking-tight">Galerie</div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bg-[#2D1206] py-16 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#C49A6C]" />
          <span className="text-[#C49A6C] text-[11px] font-black uppercase tracking-[0.25em]">Handgemacht</span>
          <div className="w-8 h-px bg-[#C49A6C]" />
        </div>
        <h1
          className="font-black text-white tracking-tight mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
        >
          Unsere Galerie
        </h1>
        <p className="text-white/55 text-base max-w-md mx-auto leading-relaxed">
          Einblicke in unsere Lederarbeiten — von der Werkstatt bis zum fertigen Stück.
        </p>
        {!loading && <p className="text-white/30 text-xs mt-4 tracking-wide">{visible.length} Aufnahmen</p>}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="container mx-auto px-4 py-12">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3" style={{ columnGap: "12px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3 rounded-2xl bg-gray-200 dark:bg-[#3a1a08] animate-pulse" style={{ height: `${160 + (i % 3) * 60}px` }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Masonry grid ── */}
      {!loading && (
        <div className="container mx-auto px-4 py-12">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3" style={{ columnGap: "12px" }}>
            {visible.map((img, i) => (
              <div
                key={img.src + i}
                className="break-inside-avoid mb-3 cursor-pointer group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300"
                onClick={() => setLightbox(i)}
              >
                <img
                  src={img.src}
                  alt={img.title ?? `Leder-Shop Galerie ${i + 1}`}
                  className="w-full h-auto block rounded-2xl group-hover:scale-[1.03] transition-transform duration-500"
                  onError={() => setFailed(prev => new Set([...prev, i]))}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                    <Maximize2 className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                </div>
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tabular-nums select-none">
            {lightbox + 1} / {visible.length}
          </div>

          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-3 sm:left-5 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <img
            src={visible[lightbox].src}
            alt={visible[lightbox].title ?? ""}
            className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Title */}
          {visible[lightbox].title && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium text-center select-none">
              {visible[lightbox].title}
            </div>
          )}

          {/* Next */}
          <button
            className="absolute right-3 sm:right-5 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

    </div>
  )
}
