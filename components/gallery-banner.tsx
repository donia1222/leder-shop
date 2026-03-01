"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Images } from "lucide-react"

const PREVIEW = [
  "/images/ledershop/417b9c50-f89d-4d06-a161-69564f8f82ae.JPG",
  "/images/ledershop/12cb7965-db69-469c-834e-5ed34b377792.JPG",
  "/images/ledershop/c02832ce-6513-4994-ba9e-e79b758de2ba.JPG",
  "/images/ledershop/588ac1f5-d4cf-4171-a057-4bf8c45a227b.JPG",
]

export function GalleryBanner() {
  const router = useRouter()

  return (
    <section className="bg-white dark:bg-[#1a0b04] border-t border-[#E0E0E0] dark:border-[#3a2010] py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.push("/galerie")}
          className="w-full group relative overflow-hidden rounded-3xl text-left transition-all hover:shadow-2xl hover:-translate-y-0.5 duration-300 bg-[#2D1206]"
        >
          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C49A6C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 px-8 sm:px-12 py-10">

            {/* Left: text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-[#C49A6C]/20 border border-[#C49A6C]/30 rounded-full px-4 py-1.5 mb-5">
                <Images className="w-3.5 h-3.5 text-[#C49A6C]" />
                <span className="text-[#C49A6C] text-[11px] font-bold uppercase tracking-widest">Fotogalerie</span>
              </div>

              <h2
                className="font-black text-white leading-tight tracking-tight mb-3"
                style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}
              >
                Unsere Galerie
                <span className="block text-[#C49A6C]">Handwerk in Bildern</span>
              </h2>

              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Entdecke unsere Lederarbeiten — von der Werkstatt bis zum fertigen Stück. Echte Fotos, echte Qualität.
              </p>
            </div>

            {/* Right: image collage */}
            <div className="flex-shrink-0 flex gap-2 items-center">
              {/* Tall image */}
              <div className="w-24 sm:w-28 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={PREVIEW[0]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
              {/* Column with 2 small images */}
              <div className="flex flex-col gap-2">
                {PREVIEW.slice(1, 3).map((src, i) => (
                  <div key={i} className="w-20 sm:w-24 h-[92px] sm:h-[110px] rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      style={{ transitionDelay: `${i * 80}ms` }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                ))}
              </div>
              {/* Tall image 2 */}
              <div className="hidden sm:block w-24 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={PREVIEW[3]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ transitionDelay: "120ms" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
            </div>

            {/* CTA button */}
            <div className="flex-shrink-0 sm:ml-4">
              <div className="flex items-center gap-2 bg-[#C49A6C] group-hover:bg-white text-[#2D1206] font-black text-sm px-6 py-3.5 rounded-2xl transition-colors duration-300 shadow-lg whitespace-nowrap">
                <Images className="w-4 h-4" />
                Galerie öffnen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </button>
      </div>
    </section>
  )
}
