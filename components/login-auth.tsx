"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Eye, EyeOff, Mail, KeyRound, CheckCircle, AlertCircle, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface UserData {
  id?: number
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  postalCode: string
  canton: string
  notes: string
}

interface LoginAuthProps {
  onLoginSuccess?: (user: UserData) => void
  onLogout?: () => void
  onShowProfile?: () => void
  className?: string
  variant?: "button" | "inline"
  buttonText?: string
  isLightSection?: boolean
}

// Exportable Admin Login Button Component
export function AdminLoginButton({
  className = "",
  isLightSection = false,
  onOpenAuth,
}: {
  className?: string
  isLightSection?: boolean
  onOpenAuth: () => void
}) {
  return (
    <Button
      onClick={onOpenAuth}
      variant="ghost"
      size="sm"
      className={`p-2 rounded-xl transition-all duration-300 ${
        isLightSection
          ? "text-gray-900/10 hover:bg-white/20 text-white border-white/20"
          : "text-gray-900/5 hover:bg-white/10 text-gray-600 hover:text-gray-800"
      } ${className}`}
    >
      <User className="w-6 h-6 text-gray-200" />
    </Button>
  )
}

export function LoginAuth({
  onLoginSuccess,
  onLogout,
  onShowProfile,
  className = "",
  variant = "button",
  buttonText = "Anmelden",
  isLightSection = false,
}: LoginAuthProps) {
  // User states
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  // Login states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState<any>({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle")
  const [loginMessage, setLoginMessage] = useState("")

  // Register states
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerErrors, setRegisterErrors] = useState<any>({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerStatus, setRegisterStatus] = useState<"idle" | "success" | "error">("idle")
  const [registerMessage, setRegisterMessage] = useState("")

  // Password Reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">("idle")
  const [resetMessage, setResetMessage] = useState("")
  const [resetErrors, setResetErrors] = useState<any>({})

  const router = useRouter()
  const API_BASE_URL = "https://web.lweb.ch/ledershop"

  // Check if user is logged in on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔍 LoginAuth: Inicializando autenticación...")
      const sessionToken = localStorage.getItem("user-session-token")
      if (sessionToken) {
        console.log("🎫 Token encontrado:", sessionToken.substring(0, 20) + "...")
        const isValid = await verifyAndLoadUser(sessionToken)
        if (!isValid) {
          console.log("❌ Token inválido, limpiando...")
          localStorage.removeItem("user-session-token")
        }
      }
    }
    initializeAuth()
  }, [])

  const verifyAndLoadUser = async (sessionToken: string): Promise<boolean> => {
    try {
      console.log("🔄 Verificando token con el servidor...")
      const response = await fetch(`${API_BASE_URL}/get_user.php`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        return false
      }

      const data = await response.json()
      console.log("✅ Datos del usuario recibidos:", data)

      if (data.success && data.user) {
        const userData = {
          id: data.user.user_id || data.user.id,
          email: data.user.email,
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postal_code || "",
          canton: data.user.canton || "",
          notes: data.user.notes || "",
        }

        setIsLoggedIn(true)
        setCurrentUser(userData)

        // Notify parent component
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }

        console.log("✅ Usuario logueado exitosamente")
        return true
      } else {
        console.error("❌ Respuesta inválida del servidor:", data)
        return false
      }
    } catch (error) {
      console.error("❌ Error verificando token:", error)
      return false
    }
  }

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      setShowUserMenu(true)
    } else {
      setShowAuthModal(true)
      setAuthMode("login")
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginStatus("idle")
      setLoginErrors({})
      console.log("🔄 Iniciando sesión...")

      // Basic validation
      const errors: any = {}
      if (!loginData.email.trim()) errors.email = "E-Mail ist erforderlich"
      if (!loginData.password.trim()) errors.password = "Passwort ist erforderlich"

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (loginData.email && !emailRegex.test(loginData.email)) {
        errors.email = "Ungültige E-Mail-Adresse"
      }

      if (Object.keys(errors).length > 0) {
        setLoginErrors(errors)
        return
      }

      const response = await fetch(`${API_BASE_URL}/login_user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      })

      console.log("📡 Respuesta de login:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de login:", result)

      if (result.success && result.sessionToken) {
        const sessionToken = result.sessionToken
        console.log("💾 Guardando token de login:", sessionToken.substring(0, 20) + "...")
        localStorage.setItem("user-session-token", sessionToken)

        const userData = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          city: result.user.city || "",
          postalCode: result.user.postal_code || "",
          canton: result.user.canton || "",
          notes: result.user.notes || "",
        }

        setIsLoggedIn(true)
        setCurrentUser(userData)
        setLoginStatus("success")
        setLoginMessage("¡Anmeldung erfolgreich!")

        // Clear login data
        setLoginData({
          email: "",
          password: "",
        })

        // Notify parent component
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }

        // Navigate to profile after success
        setTimeout(() => {
          setShowAuthModal(false)
          setLoginStatus("idle")
          router.push("/profile")
        }, 1500)

        console.log("✅ Login exitoso")
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (error: unknown) {
      console.error("❌ Error en login:", error)
      setLoginStatus("error")
      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // More specific messages
      if (errorMessage.includes("Invalid email or password")) {
        errorMessage = "E-Mail oder Passwort ist falsch"
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Verbindungsfehler. Bitte versuchen Sie es erneut."
      }

      setLoginMessage(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      setRegisterStatus("idle")
      setRegisterErrors({})
      console.log("🔄 Registrando usuario...")

      // Basic validation
      const errors: any = {}
      if (!registerData.firstName.trim()) errors.firstName = "Vorname ist erforderlich"
      if (!registerData.lastName.trim()) errors.lastName = "Nachname ist erforderlich"
      if (!registerData.email.trim()) errors.email = "E-Mail ist erforderlich"
      if (!registerData.password.trim()) errors.password = "Passwort ist erforderlich"
      if (registerData.password.length < 6) errors.password = "Passwort muss mindestens 6 Zeichen haben"
      if (registerData.password !== registerData.confirmPassword) {
        errors.confirmPassword = "Passwörter stimmen nicht überein"
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (registerData.email && !emailRegex.test(registerData.email)) {
        errors.email = "Ungültige E-Mail-Adresse"
      }

      if (Object.keys(errors).length > 0) {
        setRegisterErrors(errors)
        return
      }

      const response = await fetch(`${API_BASE_URL}/create_user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        }),
      })

      console.log("📡 Respuesta de registro:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de registro:", result)

      if (result.success && result.sessionToken) {
        const sessionToken = result.sessionToken
        console.log("💾 Guardando token de registro:", sessionToken.substring(0, 20) + "...")
        localStorage.setItem("user-session-token", sessionToken)

        const userData = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          phone: result.user.phone || "",
          address: result.user.address || "",
          city: result.user.city || "",
          postalCode: result.user.postalCode || "",
          canton: result.user.canton || "",
          notes: result.user.notes || "",
        }

        setIsLoggedIn(true)
        setCurrentUser(userData)
        setRegisterStatus("success")
        setRegisterMessage("¡Konto erfolgreich erstellt!")

        // Clear register data
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        })

        // Notify parent component
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }

        // Close modal after success
        setTimeout(() => {
          setShowAuthModal(false)
          setRegisterStatus("idle")
        }, 1500)

        console.log("✅ Registro exitoso")
      } else {
        throw new Error(result.error || "Registration failed")
      }
    } catch (error: unknown) {
      console.error("❌ Error en registro:", error)
      setRegisterStatus("error")
      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Verbindungsfehler. Bitte versuchen Sie es erneut."
      } else if (errorMessage.includes("Email already exists")) {
        errorMessage = "Diese E-Mail-Adresse ist bereits registriert"
      }

      setRegisterMessage(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    localStorage.removeItem("user-session-token")
    setIsLoggedIn(false)
    setCurrentUser(null)
    setShowUserMenu(false)

    // Notify parent component
    if (onLogout) {
      onLogout()
    }
  }

  const handleShowProfile = () => {
    setShowUserMenu(false)
    if (onShowProfile) {
      onShowProfile()
    }
  }

  const handlePasswordReset = async () => {
    try {
      setIsResettingPassword(true)
      setResetStatus("idle")
      setResetErrors({})
      console.log("🔄 Iniciando reset de contraseña...")

      // Basic validation
      const errors: any = {}
      if (!resetEmail.trim()) {
        errors.email = "E-Mail-Adresse ist erforderlich"
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (resetEmail && !emailRegex.test(resetEmail)) {
        errors.email = "Ungültige E-Mail-Adresse"
      }

      if (Object.keys(errors).length > 0) {
        setResetErrors(errors)
        return
      }

      const response = await fetch(`${API_BASE_URL}/reset_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
        }),
      })

      console.log("📡 Respuesta de reset:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Respuesta de reset:", result)

      if (result.success) {
        setResetStatus("success")
        setResetMessage(result.message || "Ein neues Passwort wurde an Ihre E-Mail-Adresse gesendet.")
        setResetEmail("")
        console.log("✅ Reset de contraseña exitoso")
      } else {
        throw new Error(result.error || "Password reset failed")
      }
    } catch (error: unknown) {
      console.error("❌ Error en reset de contraseña:", error)
      setResetStatus("error")
      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Verbindungsfehler. Bitte versuchen Sie es erneut."
      } else if (errorMessage.includes("CORS")) {
        errorMessage = "Serverfehler. Bitte kontaktieren Sie den Support."
      }

      setResetMessage(errorMessage)
    } finally {
      setIsResettingPassword(false)
    }
  }

  const openPasswordReset = () => {
    setShowPasswordReset(true)
    setResetEmail(loginData.email)
    setResetStatus("idle")
    setResetMessage("")
    setResetErrors({})
  }

  const closePasswordReset = () => {
    setShowPasswordReset(false)
    setResetEmail("")
    setResetStatus("idle")
    setResetMessage("")
    setResetErrors({})
  }

  return (
    <>
      {/* ── User Icon Button ── */}
      <button
        onClick={handleUserIconClick}
        className={`relative flex flex-col items-center p-2 hover:bg-[#F5EDE0] dark:hover:bg-[#2D1206] rounded min-w-[64px] ${className}`}
      >
        <User className={`w-6 h-6 ${isLoggedIn ? "text-[#8B5E3C] dark:text-[#C49A6C]" : "text-[#2D1206] dark:text-[#C49A6C]"}`} />
        <span className="text-xs text-[#555] dark:text-[#A89070] mt-0.5 leading-none text-center font-medium">
          {isLoggedIn && currentUser ? currentUser.firstName || "Konto" : "Anmelden"}
        </span>
        {isLoggedIn && currentUser && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8B5E3C] rounded-full border border-white" />
        )}
      </button>

      {/* ── Auth Modal (Login / Register) ── */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="p-0 gap-0 sm:max-w-sm border-0 overflow-hidden rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">{authMode === "login" ? "Anmelden" : "Registrieren"}</DialogTitle>
          <DialogDescription className="sr-only">
            {authMode === "login" ? "Anmelden bei Leder-Shop" : "Neues Konto erstellen"}
          </DialogDescription>

          {/* Dark leather header */}
          <div className="bg-[#2D1206] flex flex-col items-center pt-7 pb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15"
              style={{ backgroundImage: "radial-gradient(ellipse at 20% 60%, #C49A6C 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #8B5E3C 0%, transparent 55%)" }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <img src="/logo.png" alt="Leder-Shop" className="h-12 w-auto object-contain mb-2.5" />
              <span className="font-black text-white text-base tracking-tight">Leder-Shop</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-px bg-[#C49A6C]" />
                <span className="text-[#C49A6C] text-[10px] font-bold tracking-[0.2em] uppercase">Handgemachte Lederartikel</span>
                <div className="w-5 h-px bg-[#C49A6C]" />
              </div>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="bg-white px-5 pt-5">
            <div className="flex bg-[#F5EDE0] rounded-full p-1">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all duration-200 ${
                  authMode === "login" ? "bg-[#8B5E3C] text-white shadow-sm" : "text-[#8B5E3C] hover:text-[#6B4226]"
                }`}
              >
                Anmelden
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all duration-200 ${
                  authMode === "register" ? "bg-[#8B5E3C] text-white shadow-sm" : "text-[#8B5E3C] hover:text-[#6B4226]"
                }`}
              >
                Registrieren
              </button>
            </div>
          </div>

          {/* Form body */}
          <div className="bg-white px-5 pb-2 pt-4">

            {/* ── Login ── */}
            {authMode === "login" && (
              <div className="space-y-3.5">
                <h2 className="text-lg font-black text-[#1A1A1A]">Willkommen zurück</h2>

                <div>
                  <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">E-Mail</label>
                  <Input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(p => ({ ...p, email: e.target.value }))}
                    className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] ${loginErrors.email ? "border-red-400" : ""}`}
                    placeholder="ihre@email.com"
                  />
                  {loginErrors.email && <p className="text-red-500 text-xs mt-1 pl-1">{loginErrors.email}</p>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">Passwort</label>
                  <div className="relative">
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] pr-11 ${loginErrors.password ? "border-red-400" : ""}`}
                      placeholder="Ihr Passwort"
                    />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBB] hover:text-[#8B5E3C] transition-colors">
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-red-500 text-xs mt-1 pl-1">{loginErrors.password}</p>}
                  <button type="button" onClick={openPasswordReset}
                    className="text-xs text-[#8B5E3C] hover:text-[#6B4226] mt-1.5 pl-0.5 underline underline-offset-2">
                    Passwort vergessen?
                  </button>
                </div>

                <Button onClick={handleLogin} disabled={isLoggingIn || !loginData.email || !loginData.password}
                  className="w-full h-11 rounded-xl bg-[#8B5E3C] hover:bg-[#6B4226] text-white font-bold text-sm">
                  {isLoggingIn
                    ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    : "Anmelden →"}
                </Button>

                {loginStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-green-700 text-sm">{loginMessage}</p>
                  </div>
                )}
                {loginStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-600 text-sm">{loginMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Register ── */}
            {authMode === "register" && (
              <div className="space-y-3">
                <h2 className="text-lg font-black text-[#1A1A1A]">Konto erstellen</h2>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">Vorname</label>
                    <Input value={registerData.firstName}
                      onChange={(e) => setRegisterData(p => ({ ...p, firstName: e.target.value }))}
                      className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] ${registerErrors.firstName ? "border-red-400" : ""}`}
                      placeholder="Max" />
                    {registerErrors.firstName && <p className="text-red-500 text-xs mt-1">{registerErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">Nachname</label>
                    <Input value={registerData.lastName}
                      onChange={(e) => setRegisterData(p => ({ ...p, lastName: e.target.value }))}
                      className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] ${registerErrors.lastName ? "border-red-400" : ""}`}
                      placeholder="Mustermann" />
                    {registerErrors.lastName && <p className="text-red-500 text-xs mt-1">{registerErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">E-Mail</label>
                  <Input type="email" value={registerData.email}
                    onChange={(e) => setRegisterData(p => ({ ...p, email: e.target.value }))}
                    className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] ${registerErrors.email ? "border-red-400" : ""}`}
                    placeholder="ihre@email.com" />
                  {registerErrors.email && <p className="text-red-500 text-xs mt-1 pl-1">{registerErrors.email}</p>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">Passwort</label>
                  <div className="relative">
                    <Input type={showRegisterPassword ? "text" : "password"} value={registerData.password}
                      onChange={(e) => setRegisterData(p => ({ ...p, password: e.target.value }))}
                      className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] pr-11 ${registerErrors.password ? "border-red-400" : ""}`}
                      placeholder="Mindestens 6 Zeichen" />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBB] hover:text-[#8B5E3C] transition-colors">
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerErrors.password && <p className="text-red-500 text-xs mt-1 pl-1">{registerErrors.password}</p>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-1.5 block">Passwort bestätigen</label>
                  <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(p => ({ ...p, confirmPassword: e.target.value }))}
                      className={`h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#8B5E3C]/30 focus-visible:border-[#8B5E3C] pr-11 ${registerErrors.confirmPassword ? "border-red-400" : ""}`}
                      placeholder="Passwort wiederholen" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBB] hover:text-[#8B5E3C] transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 pl-1">{registerErrors.confirmPassword}</p>}
                </div>

                <Button onClick={handleRegister}
                  disabled={isRegistering || !registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName}
                  className="w-full h-11 rounded-xl bg-[#8B5E3C] hover:bg-[#6B4226] text-white font-bold text-sm">
                  {isRegistering
                    ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    : "Konto erstellen →"}
                </Button>

                {registerStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-green-700 text-sm">{registerMessage}</p>
                  </div>
                )}
                {registerStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-600 text-sm">{registerMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer tagline */}
          <div className="bg-white pb-6 pt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-px bg-[#E8D9C8]" />
              <span className="text-[10px] text-[#C0A882] uppercase tracking-widest font-semibold">LEDER · HANDWERK · QUALITÄT</span>
              <div className="w-6 h-px bg-[#E8D9C8]" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── User Menu Modal ── */}
      <Dialog open={showUserMenu} onOpenChange={setShowUserMenu}>
        <DialogContent className="p-0 gap-0 sm:max-w-sm border-0 overflow-hidden rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Mein Konto</DialogTitle>
          <DialogDescription className="sr-only">Angemeldet als {currentUser?.firstName} {currentUser?.lastName}</DialogDescription>

          {/* Dark leather header */}
          <div className="bg-[#2D1206] flex flex-col items-center pt-7 pb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15"
              style={{ backgroundImage: "radial-gradient(ellipse at 20% 60%, #C49A6C 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #8B5E3C 0%, transparent 55%)" }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <img src="/logo.png" alt="Leder-Shop" className="h-12 w-auto object-contain mb-2.5" />
              <span className="font-black text-white text-base tracking-tight">Leder-Shop</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-px bg-[#C49A6C]" />
                <span className="text-[#C49A6C] text-[10px] font-bold tracking-[0.2em] uppercase">Handgemachte Lederartikel</span>
                <div className="w-5 h-px bg-[#C49A6C]" />
              </div>
            </div>
          </div>

          {/* User card + actions */}
          <div className="bg-white px-5 py-5 space-y-3">
            {/* User info row */}
            <div className="flex items-center gap-3.5 p-4 bg-[#FAF3EB] rounded-2xl border border-[#E8D9C8]">
              <div className="w-12 h-12 rounded-full bg-[#8B5E3C] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-black text-lg leading-none">
                  {currentUser?.firstName?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#1A1A1A] text-sm leading-tight truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-[#999] truncate mt-0.5">{currentUser?.email}</p>
              </div>
            </div>

            <Button onClick={handleShowProfile}
              className="w-full h-11 rounded-xl bg-[#8B5E3C] hover:bg-[#6B4226] text-white font-bold text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Mein Profil →
            </Button>

            <Button onClick={handleLogout} variant="outline"
              className="w-full h-11 rounded-xl border-[#E8D9C8] text-[#666] hover:bg-[#FAF3EB] hover:border-[#8B5E3C]/40 font-semibold text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>

          <div className="bg-white pb-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-px bg-[#E8D9C8]" />
              <span className="text-[10px] text-[#C0A882] uppercase tracking-widest font-semibold">LEDER · HANDWERK · QUALITÄT</span>
              <div className="w-6 h-px bg-[#E8D9C8]" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Password Reset Modal ── */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <KeyRound className="w-5 h-5 text-[#8B5E3C]" />
              Passwort zurücksetzen
            </DialogTitle>
            <DialogDescription>
              Geben Sie Ihre E-Mail ein. Wir senden Ihnen ein neues temporäres Passwort.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="resetEmail">E-Mail-Adresse</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB]" />
                <Input id="resetEmail" type="email" value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`pl-10 h-11 rounded-xl border-[#E8D9C8] bg-[#FAF7F4] focus-visible:border-[#8B5E3C] focus-visible:ring-[#8B5E3C]/20 ${resetErrors.email ? "border-red-400" : ""}`}
                  placeholder="ihre@email.com"
                  disabled={isResettingPassword} />
              </div>
              {resetErrors.email && <p className="text-red-500 text-xs mt-1">{resetErrors.email}</p>}
            </div>

            {resetStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-green-700 text-sm">{resetMessage}</p>
              </div>
            )}
            {resetStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-600 text-sm">{resetMessage}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button onClick={handlePasswordReset}
                disabled={isResettingPassword || !resetEmail.trim() || resetStatus === "success"}
                className="flex-1 h-11 rounded-xl bg-[#8B5E3C] hover:bg-[#6B4226] text-white font-bold">
                {isResettingPassword
                  ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  : <Mail className="w-4 h-4 mr-2" />}
                Passwort senden
              </Button>
              <Button onClick={closePasswordReset} variant="outline" disabled={isResettingPassword}
                className="flex-1 h-11 rounded-xl border-[#E8D9C8] text-[#666] hover:bg-[#FAF7F4]">
                {resetStatus === "success" ? "Schließen" : "Abbrechen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
