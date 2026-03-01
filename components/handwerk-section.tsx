"use client"

import { Scissors, Hammer, Star, Shield, Clock, MapPin } from "lucide-react"

const steps = [
  {
    icon: Scissors,
    label: "Zuschnitt",
    desc: "Jedes Stück wird von Hand zugeschnitten — kein Millimeter dem Zufall überlassen.",
    num: "01",
  },
  {
    icon: Hammer,
    label: "Verarbeitung",
    desc: "Traditionelle Techniken, weitergegeben über Generationen. Jede Naht sitzt.",
    num: "02",
  },
  {
    icon: Star,
    label: "Veredelung",
    desc: "Natürliche Öle, Wachse und Pflege — das Leder lebt und patiniert mit der Zeit.",
    num: "03",
  },
  {
    icon: Shield,
    label: "Qualitätskontrolle",
    desc: "Bevor es zu Ihnen kommt, prüfen wir jedes Detail. Kein Kompromiss.",
    num: "04",
  },
]

const qualities = [
  { icon: Clock, text: "Hält ein Leben lang" },
  { icon: MapPin, text: "Hergestellt in der Schweiz" },
  { icon: Star, text: "Vollnarbiges Echtleder" },
  { icon: Shield, text: "5 Jahre Garantie" },
]

export function HandwerkSection() {
  return (
    <section className="bg-[#F9F5F0] dark:bg-[#120804] py-24 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="h-px w-12 bg-[#B8864E]" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#B8864E]">Seit 2018 · Sax, Schweiz</span>
            <div className="h-px w-12 bg-[#B8864E]" />
          </div>

          <div
            className="inline-block px-8 py-3 rounded-2xl mb-6"
            style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 4px var(--box-inset), 0 0 0 1px #C49A6C44" }}
          >
            <h2 className="text-2xl md:text-3xl font-black text-[#2D1206] dark:text-[#C49A6C] tracking-tight leading-none">
              Das Handwerk
            </h2>
          </div>

          <p className="text-[#9B8B7A] text-lg max-w-xl mx-auto leading-relaxed">
            Kein Fließband. Keine Massenware.<br />
            <span className="text-[#8B5E3C] font-semibold">Nur Hände, Leder und Leidenschaft.</span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map(({ icon: Icon, label, desc, num }) => (
            <div
              key={num}
              className="relative bg-white dark:bg-[#2D1206] rounded-2xl p-6 group hover:-translate-y-1 transition-transform duration-300 border border-[#E8D9C8] dark:border-[#3a2010]"
              style={{ boxShadow: "0 2px 16px rgba(139,94,60,0.07)" }}
            >
              {/* Step number */}
              <span
                className="absolute top-4 right-5 text-[2.5rem] font-black leading-none select-none"
                style={{ color: "rgba(180,130,80,0.10)" }}
              >
                {num}
              </span>

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#FDF8F3] dark:bg-[#1a0b04]"
                style={{ border: "2px dashed #8B5E3C" }}
              >
                <Icon className="w-5 h-5 text-[#8B5E3C]" />
              </div>

              <h3 className="font-black text-[#2D1206] dark:text-[#C49A6C] text-base mb-2">{label}</h3>
              <p className="text-[#9B8B7A] dark:text-[#A89070] text-sm leading-relaxed">{desc}</p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#8B5E3C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </div>
          ))}
        </div>

        {/* Center banner */}
        <div
          className="relative rounded-3xl overflow-hidden mb-16 bg-[#2D1206] px-8 py-14 text-center"
          style={{ boxShadow: "0 8px 40px rgba(45,18,6,0.25)" }}
        >
          {/* Decorative dashed frame inside */}
          <div
            className="absolute inset-4 rounded-2xl pointer-events-none"
            style={{ border: "1.5px dashed rgba(196,154,108,0.35)" }}
          />
          {/* Corner ornaments */}
          {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-4 h-4`}>
              <div className="w-full h-[2px] bg-[#C49A6C] rounded-full" />
              <div className="w-[2px] h-full bg-[#C49A6C] rounded-full mt-[-2px]" />
            </div>
          ))}

          <div className="relative z-10">
            <p className="text-[#C49A6C] text-xs font-black uppercase tracking-[0.3em] mb-4">Unser Versprechen</p>
            <blockquote className="text-white text-2xl md:text-3xl font-black leading-snug max-w-2xl mx-auto mb-6">
              „Wir fertigen keine Produkte.<br />
              <span className="text-[#C49A6C]">Wir erschaffen Begleiter fürs Leben."</span>
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#C49A6C] opacity-60" />
              <span className="text-[#C49A6C] text-xs tracking-widest uppercase font-semibold">Leder-Shop · Sax</span>
              <div className="h-px w-10 bg-[#C49A6C] opacity-60" />
            </div>
          </div>
        </div>

        {/* Quality badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {qualities.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 bg-white dark:bg-[#2D1206] px-5 py-3 rounded-full border border-[#E8D9C8] dark:border-[#3a2010]"
              style={{ boxShadow: "0 1px 6px rgba(139,94,60,0.06)" }}
            >
              <Icon className="w-4 h-4 text-[#8B5E3C] flex-shrink-0" />
              <span className="text-sm font-semibold text-[#5A3E2B] dark:text-[#C49A6C]">{text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
