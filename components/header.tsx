"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, ChevronDown, Menu, ArrowUp, Newspaper, Download } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LoginAuth } from "./login-auth"

interface HeaderProps {
  onAdminOpen: () => void
  onCartOpen?: () => void
  cartCount?: number
}

export function Header({ onAdminOpen, onCartOpen, cartCount = 0 }: HeaderProps) {
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

  const categories: { label: string; href: string; highlight?: boolean }[] = [
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

  return (
    <>
    


      {/* ── TIER 2: Logo + Search + Icons ── */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-3">

          {/* LEFT: Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] flex-shrink-0">
                  <Menu className="w-5 h-5 text-[#333]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white p-0 flex flex-col h-full">
                <div className="flex items-center p-4 pr-12 border-b border-[#E0E0E0] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="font-black text-[#1A1A1A] text-sm">Leder-Shop</span>
                  </div>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => { router.push(cat.href); setIsMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] ${cat.highlight ? "text-[#CC0000] font-bold" : "text-[#333333] font-medium"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <div className="pt-2 mt-1 border-t border-[#E0E0E0] space-y-0.5">
                    <button
                      onClick={() => { router.push("/blog"); setIsMenuOpen(false) }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#8B5E3C] font-semibold"
                    >
                      <Newspaper className="w-4 h-4" />
                      Blog
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
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
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#8B5E3C] font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Digitale Visitenkarte
                    </button>
                    <div className="flex items-center gap-1 pt-1 px-1 justify-end">
                      <div className="[&_span]:hidden flex items-center">
                        <LoginAuth
                          onLoginSuccess={handleLoginSuccess}
                          onLogout={handleLogout}
                          onShowProfile={handleShowProfile}
                          isLightSection={true}
                          variant="button"
                        />
                      </div>
                      <button
                        onClick={() => { onCartOpen?.(); setIsMenuOpen(false) }}
                        className="p-2 rounded-xl hover:bg-[#F5F5F5] text-[#555]"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="Leder-Shop"
                className="h-16 w-auto object-contain"
              />
              <div className="hidden sm:block text-left">
                <div className="font-black text-[#1A1A1A] text-xl leading-none tracking-tight">Leder-Shop</div>
                <div className="text-xs text-[#666] tracking-widest uppercase mt-1">Handgemachte Lederartikel</div>
              </div>
            </button>
          </div>

          {/* RIGHT: Login + Cart */}
          <div className="flex items-center gap-1 justify-end">
            <div className="[&_span]:hidden flex items-center justify-center">
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
              className="relative flex items-center justify-center w-11 h-11 hover:bg-[#F5F5F5] rounded-xl transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-[#555]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#8B5E3C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── TIER 3: Category navigation bar ── */}
      <div className="bg-white border-b border-[#E0E0E0] hidden lg:block sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-0">
            {categories.filter(cat => cat.label !== "Home").map((cat, i) => (
              <button
                key={i}
                onClick={() => router.push(cat.href)}
                className={`
                  flex items-center gap-1 px-4 py-3.5 text-[15px] font-medium whitespace-nowrap border-b-2 border-transparent
                  hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-colors
                  ${cat.highlight ? "text-[#CC0000] font-bold hover:border-[#CC0000] hover:text-[#CC0000]" : "text-[#333333]"}
                `}
              >
                {cat.label}
                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 bg-[#8B5E3C] hover:bg-[#1A4520] text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label="Nach oben scrollen"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
