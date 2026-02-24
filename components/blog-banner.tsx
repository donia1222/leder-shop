"use client"

import { useRouter } from "next/navigation"
import { Newspaper, ArrowRight, BookOpen, PenLine } from "lucide-react"

export function BlogBanner() {
  const router = useRouter()

  return (
    <section className="bg-white border-t border-[#E0E0E0] py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.push("/blog")}
          className="w-full group relative overflow-hidden rounded-3xl text-left transition-all hover:shadow-2xl hover:-translate-y-0.5 duration-300"
          style={{ minHeight: "220px" }}
        >
          {/* Background: leather texture image + brown overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1400&h=400&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(45,18,6,0.95) 0%, rgba(45,18,6,0.82) 50%, rgba(107,66,38,0.55) 100%)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(45,18,6,0.6) 0%, transparent 60%)" }}
            />
          </div>

          {/* Accent line left */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#C49A6C] to-transparent" />

          {/* Content */}
          <div className="relative z-10 px-8 sm:px-14 py-12 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center gap-8">

            {/* Left: text */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-[#C49A6C]/20 border border-[#C49A6C]/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                <Newspaper className="w-3.5 h-3.5 text-[#C49A6C]" />
                <span className="text-[#C49A6C] text-[11px] font-bold uppercase tracking-widest">Blog & Ratgeber</span>
              </div>

              <h2
                className="font-black text-white leading-tight tracking-tight mb-4"
                style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", letterSpacing: "-0.02em" }}
              >
                Pflegetipps & Wissenswertes
                <span className="block text-[#C49A6C]">rund ums Leder</span>
              </h2>

              <p className="text-white/65 text-sm leading-relaxed max-w-lg">
                Erfahre alles über Lederpflege, Materialien und handwerkliche Qualität — direkt aus unserer Werkstatt in Sevelen.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#C49A6C] group-hover:bg-white text-[#2D1206] font-black text-sm px-7 py-4 rounded-2xl transition-colors duration-300 shadow-xl">
                <BookOpen className="w-5 h-5" />
                Zum Blog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </button>
      </div>
    </section>
  )
}
