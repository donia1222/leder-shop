"use client"

import { useState } from "react"
import { Droplets, Shield, Sun, Package, ChevronDown, ChevronUp, Clock, Star } from "lucide-react"

const careTips = [
  {
    icon: Droplets,
    title: "Regelmäßig ölen",
    short: "Alle 2–3 Monate mit hochwertigem Lederöl einreiben.",
    full: "Tragen Sie das Lederöl mit einem weichen, fusselfreien Tuch dünn und gleichmäßig auf. Lassen Sie es 10–15 Minuten einziehen, bevor Sie überschüssiges Öl sanft abtupfen. So bleibt das Leder geschmeidig und reißt nicht ein.",
    timing: "Alle 2–3 Monate",
    difficulty: "Einfach",
  },
  {
    icon: Shield,
    title: "Vor Feuchtigkeit schützen",
    short: "Imprägnierungsspray aufwenden — besonders vor Regen und Schnee.",
    full: "Verwenden Sie ein hochwertiges Lederschutzspray und tragen Sie es aus 20–30 cm Abstand auf. Lassen Sie es vollständig trocknen, bevor Sie das Portemonnaie wieder benutzen. Bei starker Nässe: sofort mit einem trockenen Tuch abtupfen und an der Luft trocknen lassen — nie mit Wärmequellen.",
    timing: "Monatlich",
    difficulty: "Einfach",
  },
  {
    icon: Sun,
    title: "Richtig lagern",
    short: "Kühl, trocken und lichtgeschützt lagern — nie in direkter Sonne.",
    full: "Direkte Sonneneinstrahlung bleicht das Leder aus und lässt es spröde werden. Lagern Sie Ihr Portemonnaie an einem kühlen, trockenen Ort. Bei längerer Lagerung: in einem Baumwollbeutel aufbewahren, damit die Luft zirkulieren kann und keine Feuchtigkeit entsteht.",
    timing: "Dauerhaft",
    difficulty: "Einfach",
  },
  {
    icon: Package,
    title: "Flecken behandeln",
    short: "Flecken sofort mit einem trockenen Tuch abtupfen — niemals reiben.",
    full: "Reiben verschmiert den Fleck und drückt ihn tiefer ins Leder. Tupfen Sie stattdessen vorsichtig von außen nach innen. Bei hartnäckigen Flecken: speziellen Lederreiniger verwenden. Für Fettflecken wirkt etwas Maisstärke, die den Fett-fleck über Nacht aufsaugt.",
    timing: "Bei Bedarf",
    difficulty: "Mittel",
  },
]

const qualities = [
  { label: "Vollnarbenleder", desc: "Die höchste Lederqualität — natürliche Maserung, keine Korrekturen" },
  { label: "Handgenäht", desc: "Jede Naht von Hand — hält ein Leben lang" },
  { label: "Naturfarben", desc: "Pflanzlich gegerbte Farben, die mit der Zeit schöner werden" },
  { label: "Patina", desc: "Entwickelt mit der Zeit einen einzigartigen Charakter" },
]

export function CulinaryInspiration() {
  const [openTip, setOpenTip] = useState<number | null>(0)

  return (
    <section id="recipes" className="py-24 bg-[#F9F7F4] dark:bg-[#120804]">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div
              className="inline-block px-5 py-2 rounded-xl"
              style={{ border: "2px dashed #B8864E", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #B8864E33" }}
            >
              <h3 className="text-2xl font-black text-[#8B5E3C] dark:text-[#C49A6C]">Pflege & Stil</h3>
            </div>
          </div>
          <p className="text-xl text-[#9B9189] dark:text-[#A89070] max-w-2xl mx-auto">
            So pflegen Sie Ihre Lederwaren richtig — damit sie ein Leben lang halten
          </p>
          <div className="w-16 h-0.5 bg-[#B8864E] mx-auto mt-6"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left: Care tips accordion */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#B8864E] mb-6">Pflegetipps</h4>
            {careTips.map((tip, index) => {
              const Icon = tip.icon
              const isOpen = openTip === index
              return (
                <div
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-[#B8864E] bg-white dark:bg-[#2D1206] shadow-md" : "border-[#E8E0D5] dark:border-[#3a2010] bg-white dark:bg-[#2D1206] hover:border-[#B8864E]/50"
                  }`}
                >
                  <button
                    onClick={() => setOpenTip(isOpen ? null : index)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen ? "bg-[#2E1F0F]" : "bg-[#F9F7F4] dark:bg-[#1a0b04]"
                    }`}>
                      <Icon className={`w-5 h-5 ${isOpen ? "text-[#B8864E]" : "text-[#9B9189] dark:text-[#A89070]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#2E1F0F] dark:text-[#C49A6C] text-sm">{tip.title}</div>
                      {!isOpen && <div className="text-[#9B9189] dark:text-[#A89070] text-xs mt-0.5 line-clamp-1">{tip.short}</div>}
                    </div>
                    <div className="flex-shrink-0 text-[#9B9189] dark:text-[#A89070]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-[#9B9189] dark:text-[#A89070] text-sm leading-relaxed mb-4">{tip.full}</p>
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#B8864E]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{tip.timing}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#9B9189] dark:text-[#A89070]">
                          <Star className="w-3.5 h-3.5" />
                          <span>{tip.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right: Why real leather */}
          <div>
            <h4 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#B8864E] mb-6">Warum Echtleder?</h4>

            <div className="bg-[#2E1F0F] rounded-3xl p-8 mb-6">
              <blockquote className="text-white/80 text-lg leading-relaxed italic mb-6">
                "Ein Lederportemonnaie aus echter Haut ist kein Wegwerfprodukt —
                es ist ein Begleiter, der mit Ihnen wächst und mit der Zeit
                seinen ganz eigenen Charakter entwickelt."
              </blockquote>
              <div className="flex items-center gap-3">
       
  
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {qualities.map((q, i) => (
                <div key={i} className="bg-white dark:bg-[#2D1206] border border-[#E8E0D5] dark:border-[#3a2010] rounded-2xl p-4 hover:border-[#B8864E] transition-colors duration-300">
                  <div className="font-bold text-[#2E1F0F] dark:text-[#C49A6C] text-sm mb-1">{q.label}</div>
                  <div className="text-[#9B9189] dark:text-[#A89070] text-xs leading-relaxed">{q.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 p-4 bg-white dark:bg-[#2D1206] border border-[#E8E0D5] dark:border-[#3a2010] rounded-2xl">
              <div className="flex -space-x-2">
                {["👜", "💼", "🎒"].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-[#F9F7F4] border-2 border-white flex items-center justify-center text-base">{e}</div>
                ))}
              </div>
              <div>
                <div className="text-[#2E1F0F] dark:text-[#C49A6C] font-bold text-sm">+200 zufriedene Kunden</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-[#B8864E] fill-[#B8864E]" />)}
                  <span className="text-[#9B9189] dark:text-[#A89070] text-xs ml-1">(4.9)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
