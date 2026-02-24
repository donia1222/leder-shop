"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Star, ShoppingCart, Minus, Plus, Award, MapPin } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
}

const sauces = [
  {
    id: 1,
    name: "Honey Barbecue Sauce",
    flavor: "Süß & Rauchig",
    description: "Eine perfekte Mischung aus natürlichem Honig und rauchigen Gewürzen, die jeden Grillabend veredelt",
    image: "r1.png",
    color: "from-amber-600 to-orange-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    price: 14.0,
    heatLevel: 3,
    rating: 4.9,
    badge: "Süß",
    origin: "USA",
  },
  {
    id: 2,
    name: "Oh My Garlic",
    flavor: "Intensiver Knoblauch",
    description: "Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3d80ed726ed156b5aa0d206db2ccc3891007f6fe85080889f79989c913ede8f6.jpeg-ctV8YfEMX1U7QwZsSCG2gq5sDsdpjm.webp",
    color: "from-stone-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-stone-50 to-amber-50",
    price: 14.0,
    heatLevel: 4,
    rating: 4.8,
    badge: "Intensiv",
    origin: "Premium",
  },
  {
    id: 3,
    name: "Carolina-Style BBQ",
    flavor: "Carolina-Stil",
    description: "Traditionelles Südstaaten-Rezept, international preisgekrönt",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/568a4add4d961a12a4f870c513148755a0c890f1d400808d3120ed9af4181343.jpeg-bJCgIXnACGcryBfMqQehBQRlSpgVaY.webp",
    color: "from-yellow-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    price: 14.0,
    heatLevel: 4,
    rating: 4.9,
    badge: "Preisgekrönt",
    origin: "Carolina",
  },
  {
    id: 4,
    name: "Coffee BBQ Sauce",
    flavor: "Kaffee & Gewürze",
    description: "Eine einzigartige Kombination aus geröstetem Kaffee und geheimen Gewürzen für anspruchsvolle Gaumen",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1565863979.jpg-Pk5yoHlY9ut3Ps8lH35MjtSdGW5BLj.webp",
    color: "from-amber-800 to-stone-800",
    bgColor: "bg-gradient-to-br from-amber-50 to-stone-50",
    price: 14.0,
    heatLevel: 3,
    rating: 4.7,
    badge: "Gourmet",
    origin: "Handwerk",
  },
  {
    id: 5,
    name: "Chipotle Barbecue",
    flavor: "Scharf Geräuchert",
    description: "Das perfekte Gleichgewicht zwischen Chipotle-Schärfe und traditionellem Rauchgeschmack",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/980ba511dce874ec5ab60f463bdc4ac626cab1821f77078ed9b73987781ae67d.jpeg-9cnZkwXheoa7FZe6WZry5dIHGRvT8r.webp",
    color: "from-red-700 to-amber-800",
    bgColor: "bg-gradient-to-br from-red-50 to-amber-50",
    price: 14.0,
    heatLevel: 5,
    rating: 4.8,
    badge: "Scharf",
    origin: "Mexiko",
  },
  {
    id: 6,
    name: "Pineapple Papaya BBQ",
    flavor: "Tropisch Fruchtig",
    description: "Tropische Aromen, die Ihre Sinne in ein kulinarisches Paradies entführen",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b8325b8eededbf657bc081b327a9ae37a0bcb2b7ebaba3df7ab289126870b663.jpeg-As6qPfHwjfrENZLqRkPALbZGY0Cnr0.webp",
    color: "from-orange-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    price: 14.0,
    heatLevel: 2,
    rating: 4.6,
    badge: "Tropisch",
    origin: "Karibik",
  },
]

interface PremiumSaucesProps {
  onAddToCart?: (product: Product, quantity: number) => void
  purchasedItems?: Set<number>
  onMarkAsPurchased?: (productId: number) => void
}

export function PremiumSaucesSlideshow({
  onAddToCart = () => {},
  purchasedItems = new Set(),
  onMarkAsPurchased = () => {},
}: PremiumSaucesProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const updateQty = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1
      const next = Math.min(10, Math.max(1, current + delta))
      return { ...prev, [id]: next }
    })
  }

  const getQty = (id: number) => quantities[id] ?? 1

  const renderHeatLevel = (level: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${i < level ? "text-red-500 fill-red-500" : "text-gray-300"}`}
      />
    ))

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-colors duration-300 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-600/5 to-yellow-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Premium BBQ Collection
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            SMOKEHOUSE
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              BBQ SAUCEN
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Handwerklich geräucherte Premium-Saucen für den perfekten Grillgenuss
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sauces.map((sauce) => (
            <Card
              key={sauce.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
            >
              <div className="relative overflow-hidden">
                <img
                  src={sauce.image || "/placeholder.svg"}
                  alt={sauce.name}
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white font-semibold shadow-sm">
                    {sauce.badge}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90 border-gray-200 text-gray-700 font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    {sauce.origin}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{sauce.name}</h3>
                  <p className="text-orange-600 font-semibold text-sm mb-2">{sauce.flavor}</p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{sauce.description}</p>
                </div>

                {/* Rating and Heat Level */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(sauce.rating)}</div>
                    <span className="text-sm font-medium text-gray-700">{sauce.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">{renderHeatLevel(sauce.heatLevel)}</div>
                </div>

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {(sauce.price * getQty(sauce.id)).toFixed(2)} CHF
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQty(sauce.id, -1)}
                      className="px-3 hover:bg-gray-200 text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">
                      {getQty(sauce.id)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQty(sauce.id, 1)}
                      className="px-3 hover:bg-gray-200 text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => {
                    const product: Product = {
                      id: sauce.id,
                      name: sauce.name,
                      price: sauce.price,
                      image: sauce.image,
                      description: sauce.description,
                      heatLevel: sauce.heatLevel,
                      rating: sauce.rating,
                      badge: sauce.badge,
                      origin: sauce.origin,
                    }
                    onAddToCart(product, getQty(sauce.id))
                    onMarkAsPurchased(sauce.id)
                  }}
                  disabled={purchasedItems.has(sauce.id)}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {purchasedItems.has(sauce.id) ? "✓ Hinzugefügt" : "In Warenkorb"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-8">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Noch nicht das Richtige gefunden?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Entdecken Sie unsere komplette Smokehouse-Kollektion mit noch mehr handwerklich geräucherten
                Spezialitäten und Grill-Klassikern.
              </p>
              <Button
                onClick={() => {
                  const offersSection = document.getElementById("offers")
                  if (offersSection) {
                    offersSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Mehr BBQ-Produkte entdecken
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
