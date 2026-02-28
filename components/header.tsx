"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Menu, ArrowUp, Newspaper, Download, Images } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LoginAuth } from "./login-auth"

interface HeaderProps {
  onCartOpen?: () => void
  cartCount?: number
}


export function Header({ onCartOpen, cartCount = 0 }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLightSection] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [backendCategories, setBackendCategories] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => { if (data.success) setBackendCategories(data.categories) })
      .catch(() => {})
  }, [])

  const categories: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
    { label: "Alle Produkte", href: "/shop" },
    ...backendCategories.map(cat => ({
      label: cat.name,
      href: `/shop?cat=${encodeURIComponent(cat.name)}`,
    })),
  ]

  const handleLoginSuccess = (_user: any) => {}
  const handleLogout = () => {}
  const handleShowProfile = () => {
    router.push("/profile")
    setIsMenuOpen(false)
  }

  const downloadVcard = () => {
    const imageUrl = "https://online-shop-seven-delta.vercel.app/logo.png"
    fetch(imageUrl)
      .then((res) => { if (!res.ok) throw new Error(res.statusText); return res.blob() })
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          const base64data = (reader.result as string).split(",")[1]
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:LEDER · HANDWERK · QUALITÄT\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nPHOTO;ENCODING=b;TYPE=PNG:${base64data}\nEND:VCARD`
          const link = document.createElement("a")
          link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
          link.download = "Leder-Shop.vcf"
          document.body.appendChild(link); link.click(); document.body.removeChild(link)
        }
        reader.readAsDataURL(blob)
      })
      .catch(() => {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:LEDER · HANDWERK · QUALITÄT\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nEND:VCARD`
        const link = document.createElement("a")
        link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
        link.download = "Leder-Shop.vcf"
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
      })
  }

  return (
    <>
 

      {/* ── Main header ── */}
      <div className="bg-white border-b border-[#E8D9C8] sticky top-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* LEFT: Mobile menu + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-9 h-9 flex items-center justify-center border border-[#E8D9C8] rounded-lg hover:bg-[#F5EDE0] transition-colors flex-shrink-0">
                  <Menu className="w-5 h-5 text-[#444]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-72 bg-white p-0 flex flex-col h-full">
                <div className="bg-[#2D1206] px-4 py-4 flex items-center justify-between flex-shrink-0 pr-12">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <div>
                      <div className="font-black text-white text-sm leading-none">Leder-Shop</div>
                      <div className="text-[#C49A6C] text-[10px] tracking-widest uppercase mt-0.5">Handgemacht</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="[&_span]:hidden flex items-center">
                      <LoginAuth
                        onLoginSuccess={handleLoginSuccess}
                        onLogout={handleLogout}
                        onShowProfile={handleShowProfile}
                        isLightSection={false}
                        variant="button"
                      />
                    </div>
                    <button
                      onClick={() => { onCartOpen?.(); setIsMenuOpen(false) }}
                      className="p-2 rounded-lg hover:bg-[#3D2010] text-white relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-[#C49A6C] text-[#2D1206] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => { router.push(cat.href); setIsMenuOpen(false) }}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-[#F5EDE0] hover:text-[#8B5E3C] text-[#333] font-medium transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                  <div className="pt-2 mt-1 border-t border-[#EDE0D4] space-y-0.5">
                    <button
                      onClick={() => { router.push("/blog"); setIsMenuOpen(false) }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-[#F5EDE0] text-[#8B5E3C] font-semibold"
                    >
                      <Newspaper className="w-4 h-4" />
                      Blog
                    </button>
                    <button
                      onClick={() => { router.push("/galerie"); setIsMenuOpen(false) }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-[#F5EDE0] text-[#8B5E3C] font-semibold"
                    >
                      <Images className="w-4 h-4" />
                      Galerie
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); downloadVcard() }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-[#F5EDE0] text-[#8B5E3C] font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Digitale Visitenkarte
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <button onClick={() => router.push("/")} className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.png" alt="Leder-Shop" className="h-12 w-auto object-contain" />
              <div className="hidden sm:block text-left">
                <div className="font-black text-[#1A1A1A] text-lg leading-none tracking-tight">Leder-Shop</div>
                <div className="text-[10px] text-[#8B5E3C] tracking-[0.15em] uppercase mt-0.5 font-semibold">Handgemacht</div>
              </div>
            </button>
          </div>

          {/* CENTER: Desktop nav */}
          <nav className="hidden lg:flex items-center flex-1 justify-center">
            {categories.filter(c => c.label !== "Home").map((cat, i) => (
              <button
                key={i}
                onClick={() => router.push(cat.href)}
                className="relative px-3.5 py-2 text-[14px] font-semibold text-[#555] hover:text-[#2D1206] whitespace-nowrap group transition-colors duration-150"
              >
                {cat.label}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </button>
            ))}
            <button
              onClick={() => router.push("/blog")}
              className="relative px-3.5 py-2 text-[14px] font-semibold text-[#555] hover:text-[#2D1206] whitespace-nowrap group transition-colors duration-150"
            >
              Blog
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
            </button>
            <button
              onClick={() => router.push("/galerie")}
              className="relative px-3.5 py-2 text-[14px] font-semibold text-[#555] hover:text-[#2D1206] whitespace-nowrap group transition-colors duration-150"
            >
              Galerie
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
            </button>
          </nav>

          {/* RIGHT: Login + Cart */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="[&_span]:hidden flex items-center">
              <LoginAuth
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onShowProfile={handleShowProfile}
                isLightSection={isLightSection}
                variant="button"
              />
            </div>
            <button
              onClick={() => onCartOpen?.()}
              className="relative w-10 h-10 flex items-center justify-center hover:bg-[#F5EDE0] rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-[#444]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B5E3C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-6 z-50 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3 shadow-xl border border-gray-200 transition-all hover:scale-110 active:scale-95"
          style={{ bottom: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '5.5rem' : '1.5rem' }}
          aria-label="Nach oben scrollen"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
