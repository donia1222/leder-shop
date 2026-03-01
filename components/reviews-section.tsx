"use client"

const reviews = [
  {
    name: "Miriam Steinacher",
    date: "Vor 3 Monaten",
    text: "Die Qualität der Ledertasche übertrifft alle Erwartungen. Man merkt sofort, dass hier wirklich von Hand gearbeitet wird — jede Naht sitzt perfekt. Ich werde definitiv wiederkommen.",
    stars: 5,
  },
  {
    name: "Lukas Fehr",
    date: "Vor 6 Monaten",
    text: "Absolut begeistert von meinem neuen Ledergürtel. Carlos fertigt alles selbst von Hand — das sieht und spürt man sofort. Der Service war zudem sehr freundlich und persönlich.",
    stars: 5,
  },
  {
    name: "Sandra Moser",
    date: "Vor 1 Jahr",
    text: "Wunderschöne Lederartikel in hervorragender Qualität. Das Portemonnaie, das ich gekauft habe, ist nach einem Jahr noch wie neu. Klare Kaufempfehlung!",
    stars: 5,
  },
  {
    name: "Patrick Wyss",
    date: "Vor 8 Monaten",
    text: "Tolle Auswahl an handgefertigten Produkten. Die Beratung war kompetent und ich habe genau das gefunden, was ich gesucht habe. Sehr empfehlenswert!",
    stars: 5,
  },
  {
    name: "Julia Berger",
    date: "Vor 5 Monaten",
    text: "Exceptional quality and craftsmanship. The leather wallet I ordered is beautiful and the stitching is flawless. Fast delivery to Switzerland too!",
    stars: 5,
  },
  {
    name: "Thomas Keller",
    date: "Vor 2 Monaten",
    text: "Erstklassige Verarbeitung, echtes Leder und ein fairer Preis. Carlos macht wirklich alles von Hand — das merkt man an jedem Detail. Genau das, was man sich von einem echten Handwerker erhofft.",
    stars: 5,
  },
  {
    name: "Franziska Huber",
    date: "Vor 4 Monaten",
    text: "Meine Ledertasche ist ein absoluter Hingucker — viele Komplimente von Freunden und Kollegen. Die Verarbeitung ist makellos und das Leder riecht wunderbar. Sehr zufrieden!",
    stars: 5,
  },
]

const GoogleLogo = ({ size = 5 }: { size?: number }) => (
  <svg className={`w-${size} h-${size} flex-shrink-0`} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-[#C49A6C]" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection() {
  return (
    <section className="bg-[#F5EDE0] border-t border-[#E8D9C8] py-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-[#8B5E3C]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B5E3C]">
                Verifizierte Kundenstimmen
              </span>
              <div className="h-px w-8 bg-[#8B5E3C]" />
            </div>
            <div
              className="inline-block px-5 py-2 rounded-xl mb-2"
              style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px #F5EDE0, 0 0 0 1px #C49A6C33" }}
            >
              <h2 className="text-xl font-black text-[#2D1206] tracking-tight">Was unsere Kunden sagen</h2>
            </div>
            <p className="text-sm text-[#9B8B7A] mt-1">Echte Erfahrungen — direkt von Google.</p>
          </div>

          {/* Google rating badge */}
          <div
            className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 self-start sm:self-auto"
            style={{ border: "1.5px solid #E8D9C8", boxShadow: "0 2px 12px rgba(139,94,60,0.08)" }}
          >
            <GoogleLogo size={8} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-3xl text-[#2D1206] leading-none">4.8</span>
                <div className="flex flex-col gap-0.5">
                  <Stars count={5} />
                  <span className="text-xs text-[#9B8B7A]">41 Bewertungen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews carousel */}
        <div className="relative">
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#F5EDE0] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-white rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                style={{ width: "296px", border: "1.5px solid #E8D9C8", boxShadow: "0 2px 10px rgba(139,94,60,0.07)" }}
              >
                {/* Quote mark */}
                <div
                  className="text-4xl font-serif leading-none select-none mb-1"
                  style={{ color: "rgba(139,94,60,0.15)" }}
                >
                  &ldquo;
                </div>

                {/* Review text */}
                <p className="text-[#5A4030] text-sm leading-relaxed line-clamp-4 flex-1 -mt-2">
                  {review.text}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-[#F0E6D8] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #8B5E3C, #C49A6C)" }}
                    >
                      <span className="text-white font-bold text-sm">{review.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2D1206] text-sm leading-tight truncate">{review.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Stars count={review.stars} />
                        <span className="text-[#BBA898] text-xs">· {review.date}</span>
                      </div>
                    </div>
                  </div>
                  <GoogleLogo size={4} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
