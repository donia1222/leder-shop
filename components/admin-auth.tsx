"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Shield, Eye, EyeOff, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminAuthProps {
  onAdminOpen: () => void
  isLightSection?: boolean
}

// Exportable Admin Login Button Component (simplified version for footer)
export function AdminLoginButton({
  onAdminOpen,
  isLightSection = false,
  className = "",
}: {
  onAdminOpen: () => void
  isLightSection?: boolean
  className?: string
}) {
  return (
    <AdminAuth 
      onAdminOpen={onAdminOpen} 
      isLightSection={isLightSection} 
    />
  )
}

export function AdminAuth({ onAdminOpen, isLightSection = false }: AdminAuthProps) {
  // Estados del sistema de admin
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminProfile, setAdminProfile] = useState({
    email: "",
    loginTime: "",
    sessionDuration: "",
  })

  // Estado para debug
  const [debugInfo, setDebugInfo] = useState({
    envEmailExists: false,
    envPasswordExists: false,
    localStorageWorks: false,
    savedSessionExists: false,
    credentialsMatch: false,
  })

  // Función para comprobar el estado del sistema
  const checkSystemStatus = () => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    // Verificar si localStorage funciona
    let localStorageWorking = false
    try {
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")
      localStorageWorking = true
    } catch (e) {
      localStorageWorking = false
    }

    // Verificar si existe sesión guardada
    const savedSession = localStorage.getItem("admin-login-state")

    const debugStatus = {
      envEmailExists: !!adminEmail,
      envPasswordExists: !!adminPassword,
      localStorageWorks: localStorageWorking,
      savedSessionExists: !!savedSession,
      credentialsMatch: false,
    }

    setDebugInfo(debugStatus)

    // Log detallado para debugging
    console.log("🔍 SISTEMA DE LOGIN - ESTADO COMPLETO:")
    console.log("Email de admin desde env:", adminEmail ? "✅ Definido" : "❌ No definido")
    console.log("Password de admin desde env:", adminPassword ? "✅ Definido" : "❌ No definido")
    console.log("localStorage funciona:", localStorageWorking ? "✅ Sí" : "❌ No")
    console.log("Sesión guardada existe:", savedSession ? "✅ Sí" : "❌ No")

    if (savedSession) {
      console.log("Contenido de sesión guardada:", savedSession)
    }

    return { adminEmail, adminPassword, savedSession }
  }

  // Función para calcular la duración de sesión
  const calculateSessionDuration = (loginTimestamp: string) => {
    const now = new Date().getTime()
    const loginTime = new Date(loginTimestamp).getTime()
    const diffInMinutes = Math.floor((now - loginTime) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} Minute${diffInMinutes !== 1 ? "n" : ""}`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} Stunde${hours !== 1 ? "n" : ""}`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} Tag${days !== 1 ? "e" : ""}`
    }
  }

  // Función para cargar el estado de login guardado
  const loadSavedLoginState = () => {
    try {
      console.log("🔄 Intentando cargar estado de login guardado...")
      const savedLoginState = localStorage.getItem("admin-login-state")
      console.log("📁 Contenido de localStorage:", savedLoginState)

      if (savedLoginState) {
        const loginState = JSON.parse(savedLoginState)
        console.log("📋 Estado parseado:", loginState)

        if (loginState.isLoggedIn && loginState.timestamp && loginState.email) {
          // Verificar si la sesión sigue siendo válida (7 días)
          const now = new Date().getTime()
          const loginTime = new Date(loginState.timestamp).getTime()
          const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24)

          console.log("⏰ Días desde login:", daysDiff)

          if (daysDiff < 7) {
            // Sesión válida, restaurar estado
            console.log("✅ Sesión válida, restaurando estado...")
            setIsLoggedIn(true)
            setAdminProfile({
              email: loginState.email,
              loginTime: new Date(loginState.timestamp).toLocaleString("es-ES"),
              sessionDuration: calculateSessionDuration(loginState.timestamp),
            })
            console.log("🎉 Sesión restaurada exitosamente")
            return true
          } else {
            console.log("❌ Sesión expirada, limpiando localStorage")
            localStorage.removeItem("admin-login-state")
          }
        } else {
          console.log("❌ Datos de sesión incompletos")
        }
      } else {
        console.log("❌ No hay sesión guardada")
      }
      return false
    } catch (error) {
      console.error("💥 Error cargando estado de login:", error)
      localStorage.removeItem("admin-login-state")
      return false
    }
  }

  // Función para guardar el estado de login
  const saveLoginState = (email: string, timestamp: string) => {
    try {
      const loginState = {
        isLoggedIn: true,
        email: email,
        timestamp: timestamp,
        version: "2.0",
      }

      localStorage.setItem("admin-login-state", JSON.stringify(loginState))
      console.log("💾 Estado de login guardado:", loginState)
    } catch (error) {
      console.error("💥 Error guardando estado de login:", error)
    }
  }

  // Efecto para inicializar el sistema
  useEffect(() => {
    console.log("🚀 Iniciando sistema de login...")
    const systemStatus = checkSystemStatus()
    loadSavedLoginState()

    if (!systemStatus.adminEmail || !systemStatus.adminPassword) {
      console.warn("⚠️ ADVERTENCIA: Variables de entorno no definidas")
      console.warn("Necesitas definir NEXT_PUBLIC_ADMIN_EMAIL y NEXT_PUBLIC_ADMIN_PASSWORD en tu archivo .env")
    }
  }, [])

  // Efecto para actualizar la duración de sesión cada minuto
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        const savedState = localStorage.getItem("admin-login-state")
        if (savedState) {
          try {
            const loginState = JSON.parse(savedState)
            setAdminProfile((prev) => ({
              ...prev,
              sessionDuration: calculateSessionDuration(loginState.timestamp),
            }))
          } catch (error) {
            console.error("Error actualizando duración de sesión:", error)
          }
        }
      }, 60000) // Actualizar cada minuto

      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  // Función para manejar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    console.log("🔐 Iniciando proceso de login...")

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    console.log("📋 Credenciales desde .env:")
    console.log("Email:", adminEmail ? "✅ Definido" : "❌ No definido")
    console.log("Password:", adminPassword ? "✅ Definido" : "❌ No definido")

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar credenciales con fallback para testing
    let credentialsValid = false
    if (adminEmail && adminPassword) {
      credentialsValid = loginData.email === adminEmail && loginData.password === adminPassword
      console.log("🔍 Verificando con variables de entorno:", credentialsValid ? "✅ Válidas" : "❌ Inválidas")
    } else {
      // Fallback para testing si no hay variables de entorno
      console.log("⚠️ Variables de entorno no disponibles, usando credenciales de prueba")
      credentialsValid = loginData.email === "admin@hotbbq.com" && loginData.password === "admin123"
      console.log("🔍 Verificando con credenciales de prueba:", credentialsValid ? "✅ Válidas" : "❌ Inválidas")
    }

    
    // Actualizar debug info
    setDebugInfo((prev) => ({ ...prev, credentialsMatch: credentialsValid }))

    if (credentialsValid) {
      const loginTime = new Date()
      const loginTimestamp = loginTime.toISOString()

      console.log("🎉 Login exitoso!")

      // Establecer estado de login
      setIsLoggedIn(true)
      setIsLoginOpen(false)

      // Establecer datos del perfil
      const profileData = {
        email: loginData.email,
        loginTime: loginTime.toLocaleString("es-ES"),
        sessionDuration: "Recién iniciada",
      }
      setAdminProfile(profileData)

      // Guardar estado si "recordar" está marcado
      if (rememberMe) {
        console.log("💾 Guardando sesión para recordar...")
        saveLoginState(loginData.email, loginTimestamp)
      } else {
        console.log("🚫 No se guardará la sesión (recordar no marcado)")
      }

      // Limpiar formulario
      setLoginData({ email: "", password: "" })
      setRememberMe(false)

      // Llamar a la función de admin (abrir panel)
      console.log("🚀 Llamando onAdminOpen")
      onAdminOpen()
    } else {
      console.log("❌ Credenciales incorrectas")
      setLoginError("Email o contraseña incorrectos")
    }

    setIsLoggingIn(false)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    setIsLoggedIn(false)
    setLoginData({ email: "", password: "" })
    setAdminProfile({ email: "", loginTime: "", sessionDuration: "" })
    localStorage.removeItem("admin-login-state")
    console.log("✅ Sesión cerrada")
  }

  // Función para ver perfil
  const handleViewProfile = () => {
    setIsProfileOpen(true)
  }

  console.log("🔄 Renderizando AdminAuth, isLoggedIn:", isLoggedIn)

  return (
    <>
      {isLoggedIn ? (
        // Menú desplegable cuando está logueado
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                isLightSection
                  ? "bg-green-500/20 hover:bg-green-500/30 text-white border-green-400/50 hover:border-green-400/70"
                  : "bg-green-500/10 hover:bg-green-500/20 text-white border-green-400/30 hover:border-green-400/50"
              }`}
              title="Administrator-Menü – Aktive Sitzung"
            >
              <Shield className="w-4 h-4 text-green-400 transition-colors" />
              {/* Indicador de sesión activa */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 bg-[#F7F7F5] border-0 shadow-2xl rounded-2xl overflow-hidden p-0"
            align="end"
            sideOffset={8}
          >
            {/* Header */}
            <div className="flex flex-col items-center pt-5 pb-4 bg-white border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-[#2C5F2E]/10 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-[#2C5F2E]" />
              </div>
              <p className="font-bold text-[#1A1A1A] text-sm">Administrator</p>
              <p className="text-xs text-gray-500 truncate max-w-48">{adminProfile.email}</p>
            </div>

            {/* Items */}
            <div className="p-2 space-y-1">
              <DropdownMenuItem
                onClick={handleViewProfile}
                className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white focus:bg-white transition-colors"
              >
                <User className="w-4 h-4 mr-3 text-[#2C5F2E] shrink-0" />
                <div>
                  <p className="font-medium text-[#1A1A1A] text-sm">Profil anzeigen</p>
                  <p className="text-xs text-gray-400">Sitzungsinformationen</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onAdminOpen}
                className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white focus:bg-white transition-colors"
              >
                <Settings className="w-4 h-4 mr-3 text-[#2C5F2E] shrink-0" />
                <div>
                  <p className="font-medium text-[#1A1A1A] text-sm">Admin-Panel</p>
                  <p className="text-xs text-gray-400">Websiteverwaltung</p>
                </div>
              </DropdownMenuItem>

              <div className="pt-1 border-t border-gray-200/60">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2.5 cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500 shrink-0" />
                  <div>
                    <p className="font-medium text-red-600 text-sm">Abmelden</p>
                    <p className="text-xs text-red-400">Sitzung beenden</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Botón de login cuando no está logueado
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                isLightSection
                  ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-[#2C5F2E]/50"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-[#2C5F2E]/30"
              }`}
              title="Iniciar Sesión Admin"
            >
              <Shield className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 sm:max-w-sm bg-[#F7F7F5] border-0 overflow-hidden rounded-2xl">
            <DialogTitle className="sr-only">Admin-Anmeldung</DialogTitle>

            {/* Logo area */}
            <div className="flex flex-col items-center pt-8 pb-6 bg-white border-b border-gray-100">
              <img src="/Security_n.png" alt="US - Fishing & Huntingshop" className="h-14 w-auto object-contain mb-2" />
              <span className="font-black text-[#1A1A1A] text-base tracking-tight">US - Fishing &amp; Huntingshop</span>
              <span className="text-xs text-[#888] tracking-widest uppercase mt-0.5">Admin-Bereich</span>
            </div>

            {/* Form card */}
            <div className="mx-4 my-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#2C5F2E]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#2C5F2E]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Anmelden</h2>
              </div>

              {/* Debug info */}
              {(!debugInfo.envEmailExists || !debugInfo.envPasswordExists) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-700">
                  <p className="font-medium mb-1">⚠️ Fallback-Zugangsdaten:</p>
                  <p>Email: admin@hotbbq.com</p>
                  <p>Passwort: admin123</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">E-Mail</p>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@email.com"
                    required
                    className="rounded-full bg-white border-gray-200 h-12 px-5"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Passwort</p>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="rounded-full bg-white border-gray-200 h-12 px-5 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#2C5F2E]"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-500">7 Tage angemeldet bleiben</Label>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                    {loginError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-full bg-[#2C5F2E] hover:bg-[#1A4520] text-white font-semibold text-base"
                >
                  {isLoggingIn ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>Anmelden &nbsp;→</>
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-sm text-gray-500 pb-6 px-4">
              Jagd · Angeln · <span className="text-[#2C5F2E] font-semibold">Outdoor</span> · Schweiz
            </p>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Perfil de Administrador */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Administratorprofil</h2>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del usuario */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Aktiver Administrator</h3>
                  <p className="text-sm text-gray-600">Verifizierte und sichere Sitzung</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-800 font-mono">{adminProfile.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                  <span className="text-sm font-medium text-gray-600">Letzter Zugriff:</span>
                  <span className="text-sm text-gray-800">{adminProfile.loginTime}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Sitzungsdauer:</span>
                  <span className="text-sm text-gray-800">{adminProfile.sessionDuration}</span>
                </div>
              </div>
            </div>

            {/* Información de debug del sistema */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200/50">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-gray-600" />
                Systemstatus
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <p className="text-gray-600">ENV-Variablen</p>
                  <p
                    className={`font-semibold ${debugInfo.envEmailExists && debugInfo.envPasswordExists ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {debugInfo.envEmailExists && debugInfo.envPasswordExists ? "✅ OK" : "⚠️ Fallback"}
                  </p>
                </div>
                <div className="text-center p-2 bg-white/50 rounded-lg">
                  <p className="text-gray-600">localStorage</p>
                  <p className={`font-semibold ${debugInfo.localStorageWorks ? "text-green-600" : "text-red-600"}`}>
                    {debugInfo.localStorageWorks ? "✅ OK" : "❌ Error"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <Button onClick={() => setIsProfileOpen(false)} variant="outline" className="flex-1 bg-white text-gray-700 hover:bg-gray-50">
                Schließen
              </Button>
              <Button
                onClick={() => {
                  setIsProfileOpen(false)
                  onAdminOpen()
                }}
                className="flex-1 bg-[#2C5F2E] hover:bg-[#1A4520]"
              >
                Zum Admin-Panel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
