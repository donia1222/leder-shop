"use client"

const items = [
  { text: "Handgefertigt in der Schweiz" },
  { text: "Vollnarbiges Echtleder" },
  { text: "Seit 2018 · Sax, St. Gallen" },
  { text: "Jedes Stück ein Unikat" },
  { text: "1–3 Tage Lieferung" },
  { text: "Leder · Handwerk · Qualität" },
  { text: "Nachhaltig & langlebig" },
  { text: "Massarbeit auf Bestellung" },
]

function Stitch() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="inline-block flex-shrink-0">
      <rect x="7" y="1" width="4" height="4" rx="1" fill="#C49A6C" opacity="0.7" transform="rotate(45 9 3)" />
      <rect x="7" y="13" width="4" height="4" rx="1" fill="#C49A6C" opacity="0.7" transform="rotate(45 9 15)" />
      <line x1="9" y1="5" x2="9" y2="13" stroke="#C49A6C" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  )
}

function Needle() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="inline-block flex-shrink-0">
      <ellipse cx="11" cy="7" rx="10" ry="2.5" stroke="#8B5E3C" strokeWidth="1.2" fill="none" opacity="0.5" />
      <circle cx="4" cy="7" r="1.5" fill="#C49A6C" opacity="0.7" />
      <circle cx="11" cy="7" r="1.5" fill="#C49A6C" opacity="0.7" />
      <circle cx="18" cy="7" r="1.5" fill="#C49A6C" opacity="0.7" />
    </svg>
  )
}

function LeafMark() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="inline-block flex-shrink-0">
      <path d="M7 1 C 12 5, 13 10, 7 17 C 1 10, 2 5, 7 1Z" stroke="#8B5E3C" strokeWidth="1.2" fill="#C49A6C" fillOpacity="0.15" />
      <line x1="7" y1="3" x2="7" y2="15" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

const SEPARATORS = [<Stitch key="s" />, <Needle key="n" />, <LeafMark key="l" />]

export function MarqueeBanner() {
  const repeated = [...items, ...items]

  return (
    <div
      className="w-full overflow-hidden border-y border-[#E8D9C8] dark:border-[#3a2010] bg-[#FAF7F4] dark:bg-[#120804] relative"
      style={{ height: "44px" }}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-[#FAF7F4] dark:from-[#120804] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-[#FAF7F4] dark:from-[#120804] to-transparent" />

      {/* Scrolling track */}
      <div
        className="flex items-center h-full gap-0"
        style={{
          animation: "marquee-scroll 32s linear infinite",
          width: "max-content",
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap">
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#2D1206] dark:text-[#C49A6C]">
              {item.text}
            </span>
            {SEPARATORS[i % SEPARATORS.length]}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
