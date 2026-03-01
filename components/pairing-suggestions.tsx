"use client"

import { Badge } from "@/components/ui/badge"
import { ChefHat, Utensils, Award } from "lucide-react"

export function PairingSuggestions() {
  const pairings = [
    {
      sauce: "Klassisch Braun",
      subtitle: "Zeitloser Stil",
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500",
      borderColor: "border-[#E8E0D5]",
      bgColor: "bg-[#F9F7F4]",
      icon: "👜",
      foods: [
        { emoji: "👔", name: "Business-Outfit", description: "Formelle Anlässe" },
        { emoji: "🧥", name: "Casual Chic", description: "Alltag & Freizeit" },
        { emoji: "💼", name: "Konferenzen", description: "Professionell auftreten" },
        { emoji: "🎩", name: "Elegante Abende", description: "Besondere Momente" },
      ]
    },
    {
      sauce: "Natur Leder",
      subtitle: "Authentische Qualität",
      color: "red",
      gradient: "from-red-500 to-orange-600",
      borderColor: "border-[#E8E0D5]",
      bgColor: "bg-[#F9F7F4]",
      icon: "🌿",
      foods: [
        { emoji: "👕", name: "Smart Casual", description: "Entspannt & stilvoll" },
        { emoji: "🥾", name: "Outdoor-Look", description: "Abenteuer & Natur" },
        { emoji: "🎒", name: "Wochenend-Trip", description: "Reisen & Erkunden" },
        { emoji: "☕", name: "Café & Lunch", description: "Entspannte Treffen" },
      ]
    },
    {
      sauce: "Schwarz Edition",
      subtitle: "Moderne Eleganz",
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      borderColor: "border-[#E8E0D5]",
      bgColor: "bg-[#F9F7F4]",
      icon: "⚡",
      foods: [
        { emoji: "🕴️", name: "Urban Style", description: "Stadtleben pur" },
        { emoji: "🎭", name: "Theater & Kultur", description: "Kulturelle Events" },
        { emoji: "🚀", name: "Start-up Ambiente", description: "Modern & dynamisch" },
        { emoji: "🌙", name: "Abendveranstaltungen", description: "Stilvoller Auftritt" },
      ]
    }
  ]

  return (
    <section id="pairing" className="py-24 bg-[#F9F7F4] dark:bg-[#120804]">
      <div className="container mx-auto px-4">
        {/* Modern Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-[#2E1F0F] rounded-2xl flex items-center justify-center shadow-lg">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <div className="w-2 h-2 bg-[#B8864E] rounded-full animate-pulse"></div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-[#E8E0D5]">
              <ChefHat className="w-8 h-8 text-[#B8864E]" />
            </div>
          </div>

          <h3 className="text-4xl font-black mb-6 text-[#2E1F0F] dark:text-[#FAF7F4]">
            Stil-Kombinationen
          </h3>
          <p className="text-xl text-[#9B9189] dark:text-[#A89070] max-w-4xl mx-auto leading-relaxed font-light">
            Professionelle Empfehlungen für die perfekte Kombination Ihrer Lederwaren mit verschiedenen Looks und Anlässen
          </p>
          <div className="w-32 h-1 bg-[#B8864E] mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Pairing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {pairings.map((pairing, index) => (
            <div
              key={pairing.sauce}
              className={`group relative bg-white dark:bg-[#2D1206] rounded-3xl p-8 border ${pairing.borderColor} dark:border-[#3a2010] hover:border-opacity-60 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl`}
            >
              {/* Header */}
              <div className="text-center mb-8 relative">
                <div className={`w-24 h-24 ${pairing.bgColor} backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border ${pairing.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl filter drop-shadow-lg">{pairing.icon}</span>
                </div>
                <h4 className="text-3xl font-bold text-[#2E1F0F] dark:text-[#FAF7F4] mb-2">
                  {pairing.sauce}
                </h4>
                <p className="text-[#9B9189] dark:text-[#A89070] font-medium tracking-wide">{pairing.subtitle}</p>
              </div>

              {/* Food Items */}
              <div className="space-y-4">
                {pairing.foods.map((food, foodIndex) => (
                  <div
                    key={foodIndex}
                    className="group/item flex items-center space-x-4 p-4 bg-[#F9F7F4] dark:bg-[#1a0b04] backdrop-blur-sm rounded-xl border border-[#E8E0D5] dark:border-[#3a2010] hover:border-[#B8864E] transition-all duration-300 hover:bg-white dark:hover:bg-[#3D1F0D]"
                  >
                    <div className="text-2xl flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                      {food.emoji}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-[#2E1F0F] dark:text-[#D4C0A0] text-lg group-hover/item:text-[#B8864E] dark:group-hover/item:text-[#C49A6C] transition-colors duration-300">
                        {food.name}
                      </h5>
                      <p className="text-[#9B9189] dark:text-[#A89070] text-sm font-medium">{food.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Index */}
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-[#F9F7F4] backdrop-blur-sm rounded-full flex items-center justify-center border border-[#E8E0D5]">
                  <span className="text-xs font-bold text-[#9B9189] dark:text-[#A89070]">{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Chef's Section */}
        <div className="relative bg-white dark:bg-[#2D1206] rounded-3xl p-12 shadow-2xl border border-[#E8E0D5] dark:border-[#3a2010] overflow-hidden">
          <div className="relative text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <Award className="w-12 h-12 text-[#B8864E]" />
              <div className="w-3 h-3 bg-[#B8864E] rounded-full animate-pulse"></div>
              <ChefHat className="w-12 h-12 text-[#B8864E]" />
            </div>

            <h4 className="text-4xl font-black text-[#2E1F0F] dark:text-[#FAF7F4] mb-6">
              Experten-Empfehlung
            </h4>

            <p className="text-xl text-[#9B9189] dark:text-[#A89070] max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              "Wählen Sie Ihre Lederwaren bewusst nach dem Anlass. Ein hochwertiges Portemonnaie aus echtem Leder ist nicht nur ein Accessoire — es ist eine Aussage über Ihren Stil und Ihre Werte. Qualität, die man sieht und spürt."
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-[#2E1F0F] text-white font-bold px-6 py-3 text-lg border-0 hover:shadow-lg transition-shadow duration-300">
                🏆 Handgefertigte Qualität
              </Badge>
              <Badge className="bg-[#F9F7F4] text-[#B8864E] font-bold px-6 py-3 text-lg border border-[#E8E0D5] hover:bg-white transition-colors duration-300">
                ✨ Echtes Leder
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
