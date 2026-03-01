"use client"

import { useState, useEffect } from "react"
import {
  User,
  Package,
  Edit,
  Save,
  X,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  Lock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserData {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  canton: string
  notes: string
  created_at: string
  last_login: string
}

interface OrderStats {
  total_orders: number
  total_spent: number
  last_order_date: string
}

interface OrderItem {
  product_id: number
  product_name: string
  product_description: string
  product_image: string
  price: number
  quantity: number
  subtotal: number
  heat_level: number
  rating: number
  badge: string
  origin: string
}

interface Order {
  id: number
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_canton: string
  customer_notes: string
  total_amount: number
  shipping_cost: number
  status: string
  payment_method: string
  payment_status: string
  created_at: string
  updated_at: string
  items_count: number
  items?: OrderItem[]
}

interface OrdersResponse {
  success: boolean
  data: Order[]
  pagination: {
    current_page: number
    total_pages: number
    total_orders: number
    per_page: number
    has_next: boolean
    has_prev: boolean
  }
  stats: {
    total_orders: number
    total_revenue: number
    avg_order_value: number
    completed_orders: number
    pending_orders: number
    processing_orders: number
    cancelled_orders: number
  }
}

interface UserProfileProps {
  onClose: () => void
  onAccountDeleted?: () => void
}

export function UserProfile({ onClose, onAccountDeleted }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOrderItems, setShowOrderItems] = useState<{ [key: number]: boolean }>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserData>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Estados para eliminación de cuenta
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Estados para cambio de contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    loadUserProfile()
  }, [])

  useEffect(() => {
    if (userData) {
      loadUserOrders()
    }
  }, [userData, currentPage, statusFilter, searchTerm])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const sessionToken = localStorage.getItem("user-session-token")
      console.log("UserProfile: Loading with token:", sessionToken?.substring(0, 10) + "...")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

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

      console.log("UserProfile: Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("UserProfile: HTTP Error:", response.status, errorText)

        if (response.status === 401) {
          localStorage.removeItem("user-session-token")
          throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("UserProfile: Response data:", data)

      if (data.success) {
        setUserData(data.user)
        setOrderStats(data.orderStats)
        setEditData(data.user)
      } else {
        throw new Error(data.error || "Failed to load user profile")
      }
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading user profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadUserOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError("")

      if (!userData?.email) {
        console.log("No user email available for orders")
        return
      }

      console.log("Loading orders for user:", userData.email)

      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        email: userData.email,
        include_items: "true",
      })

      if (statusFilter) {
        params.append("status", statusFilter)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await fetch(`${API_BASE_URL}/get_ordersuser.php?${params.toString()}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
      })

      console.log("Orders response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Orders HTTP Error:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data: OrdersResponse = await response.json()
      console.log("Orders response data:", data)

      if (data.success) {
        setOrders(data.data || [])
        setTotalPages(data.pagination?.total_pages || 1)
        setTotalOrders(data.pagination?.total_orders || 0)

        // Actualizar estadísticas si están disponibles
        if (data.stats) {
          setOrderStats({
            total_orders: data.stats.total_orders,
            total_spent: data.stats.total_revenue,
            last_order_date: data.data?.[0]?.created_at || "",
          })
        }
      } else {
        throw new Error("Failed to load orders")
      }
    } catch (err: any) {
      setOrdersError(err.message)
      console.error("Error loading orders:", err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      const response = await fetch(`${API_BASE_URL}/update_user.php`, {
        method: "PUT",
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
          firstName: editData.first_name,
          lastName: editData.last_name,
          phone: editData.phone,
          address: editData.address,
          city: editData.city,
          postalCode: editData.postal_code,
          canton: editData.canton,
          notes: editData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserData((prev) => (prev ? { ...prev, ...editData } : null))
        setIsEditing(false)
      } else {
        throw new Error(data.error || "Failed to update user")
      }
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`)
      console.error("Error updating user:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Bitte geben Sie Ihr Passwort ein")
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError("")
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      console.log("🗑️ Iniciando eliminación de cuenta...")

      const response = await fetch(`${API_BASE_URL}/delete_user.php`, {
        method: "DELETE",
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
          confirmPassword: deletePassword,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)

        if (response.status === 401) {
          throw new Error("Passwort ist falsch oder Sitzung ist abgelaufen")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Respuesta de eliminación:", data)

      if (data.success) {
        localStorage.removeItem("user-session-token")
        localStorage.removeItem("leder-customer-info")
        localStorage.removeItem("leder-cart")

        setShowDeleteDialog(false)
        alert("Ihr Konto wurde erfolgreich gelöscht. Sie werden zur Startseite weitergeleitet.")

        if (onAccountDeleted) {
          onAccountDeleted()
        }

        onClose()

        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      } else {
        throw new Error(data.error || "Failed to delete account")
      }
    } catch (error: unknown) {
      console.error("❌ Error eliminando cuenta:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      if (errorMessage.includes("Passwort ist falsch")) {
        setDeleteError("Das eingegebene Passwort ist falsch")
      } else if (errorMessage.includes("Sitzung ist abgelaufen")) {
        setDeleteError("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.")
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        setDeleteError("Verbindungsfehler. Bitte versuchen Sie es erneut.")
      } else {
        setDeleteError(`Fehler beim Löschen des Kontos: ${errorMessage}`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword.trim()) {
      setPasswordError("Bitte geben Sie Ihr aktuelles Passwort ein")
      return
    }

    if (!passwordData.newPassword.trim()) {
      setPasswordError("Bitte geben Sie ein neues Passwort ein")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Das neue Passwort muss mindestens 8 Zeichen lang sein")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Die neuen Passwörter stimmen nicht überein")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("Das neue Passwort muss sich vom aktuellen unterscheiden")
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordError("")
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      console.log("🔑 Iniciando cambio de contraseña...")

      const response = await fetch(`${API_BASE_URL}/change_password.php`, {
        method: "PUT",
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
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)

        if (response.status === 401) {
          throw new Error("Das aktuelle Passwort ist falsch oder die Sitzung ist abgelaufen")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Respuesta de cambio de contraseña:", data)

      if (data.success) {
        setShowPasswordDialog(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        alert("Ihr Passwort wurde erfolgreich geändert!")
      } else {
        throw new Error(data.error || "Failed to change password")
      }
    } catch (error: unknown) {
      console.error("❌ Error cambiando contraseña:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      if (errorMessage.includes("aktuelle Passwort ist falsch")) {
        setPasswordError("Das aktuelle Passwort ist falsch")
      } else if (errorMessage.includes("Sitzung ist abgelaufen")) {
        setPasswordError("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.")
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        setPasswordError("Verbindungsfehler. Bitte versuchen Sie es erneut.")
      } else {
        setPasswordError(`Fehler beim Ändern des Passworts: ${errorMessage}`)
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCancel = () => {
    setEditData(userData || {})
    setIsEditing(false)
  }

  const openDeleteDialog = () => {
    setShowDeleteDialog(true)
    setDeletePassword("")
    setDeleteError("")
  }

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setDeletePassword("")
    setDeleteError("")
  }

  const openPasswordDialog = () => {
    setShowPasswordDialog(true)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
  }

  const closePasswordDialog = () => {
    setShowPasswordDialog(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
  }

  const getVisibleNotes = (notes: string) =>
    notes
      .split("\n")
      .filter(
        (l) =>
          !l.startsWith("Kauf auf Rechnung") &&
          !l.startsWith("Stock actualizado") &&
          !l.startsWith("PayPal Payer ID")
      )
      .join("\n")
      .trim()

  const downloadInvoicePDF = async (order: Order) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    const pageW = doc.internal.pageSize.getWidth()
    const margin = 15

    // --- Logo ---
    try {
      const img = new window.Image()
      img.src = "/logo.png"
      await new Promise<void>((res) => {
        img.onload = () => res()
        img.onerror = () => res()
      })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth || 1
      canvas.height = img.naturalHeight || 1
      canvas.getContext("2d")?.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL("image/png")
      const logoH = 20
      const logoW = img.naturalWidth ? (img.naturalWidth / img.naturalHeight) * logoH : logoH
      doc.addImage(dataUrl, "PNG", margin, 10, logoW, logoH)
    } catch (_) {/* kein Logo */}

    // --- Firmendaten (links, unter Logo) ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(139, 94, 60)
    doc.text("Leder-Shop", margin, 36)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text("LEDER · HANDWERK · QUALITÄT", margin, 41)
    doc.text("Bahnhofstrasse 2, 9475 Sevelen", margin, 46)
    doc.text("Tel: 078 606 61 05", margin, 51)
    doc.text("info@lweb.ch", margin, 56)

    // --- Titel Rechnung (rechts) ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(139, 94, 60)
    doc.text("RECHNUNG", pageW - margin, 36, { align: "right" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Nr: ${order.order_number}`, pageW - margin, 43, { align: "right" })
    doc.text(`Datum: ${formatDate(order.created_at)}`, pageW - margin, 49, { align: "right" })

    // --- Trennlinie ---
    doc.setDrawColor(139, 94, 60)
    doc.setLineWidth(0.5)
    doc.line(margin, 62, pageW - margin, 62)

    // --- Kundendaten ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(40, 40, 40)
    doc.text("Rechnungsadresse:", margin, 70)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const lines = [
      `${order.customer_first_name} ${order.customer_last_name}`,
      order.customer_address,
      `${order.customer_postal_code} ${order.customer_city}`,
      order.customer_canton,
      order.customer_email,
      order.customer_phone,
    ].filter(Boolean)
    lines.forEach((l, i) => doc.text(l, margin, 77 + i * 5.5))

    // --- Bestellstatus ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(`Status: ${getStatusText(order.status)}`, pageW - margin, 70, { align: "right" })
    doc.text(`Zahlung: ${order.payment_method}`, pageW - margin, 76, { align: "right" })

    // --- Artikeltabelle ---
    let y = 118
    doc.setFillColor(139, 94, 60)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.rect(margin, y, pageW - margin * 2, 8, "F")
    doc.text("Artikel", margin + 2, y + 5.5)
    const colQty    = 130   // Menge (links)
    const colPrice  = 158   // Stückpreis (rechts-aligned)
    const colTotal  = pageW - margin  // Subtotal (rechts-aligned)

    doc.text("Menge", colQty, y + 5.5)
    doc.text("Stückpreis", colPrice, y + 5.5, { align: "right" })
    doc.text("Gesamt", colTotal, y + 5.5, { align: "right" })
    y += 10

    doc.setFont("helvetica", "normal")
    doc.setTextColor(40, 40, 40)
    const items = order.items || []
    items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 245, 235)
        doc.rect(margin, y - 2, pageW - margin * 2, 8, "F")
      }
      doc.setFontSize(9)
      doc.text(item.product_name.substring(0, 50), margin + 2, y + 4)
      doc.text(`${item.quantity}x`, colQty, y + 4)
      doc.text(`${(Number(item.price) || 0).toFixed(2)} CHF`, colPrice, y + 4, { align: "right" })
      doc.text(`${(Number(item.subtotal) || 0).toFixed(2)} CHF`, colTotal, y + 4, { align: "right" })
      y += 9
    })

    // --- Totales ---
    y += 4
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageW - margin, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Versandkosten:", pageW - 55, y)
    doc.text(`${(Number(order.shipping_cost) || 0).toFixed(2)} CHF`, pageW - margin, y, { align: "right" })
    y += 7
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(139, 94, 60)
    doc.text("TOTAL:", pageW - 55, y)
    doc.text(`${(Number(order.total_amount) || 0).toFixed(2)} CHF`, pageW - margin, y, { align: "right" })

    // --- Footer ---
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("Vielen Dank für Ihren Einkauf!", pageW / 2, 285, { align: "center" })

    doc.save(`Rechnung_${order.order_number}.pdf`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Abgeschlossen"
      case "pending":
        return "Ausstehend"
      case "processing":
        return "In Bearbeitung"
      case "cancelled":
        return "Storniert"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleOrderItems = (orderId: number) => {
    setShowOrderItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefreshOrders = () => {
    loadUserOrders()
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C] mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Benutzerprofil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="text-center p-8">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-700 mb-2">Fehler</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
                  Zurück
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <div className="bg-white flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-[#E0E0E0] sticky top-0 z-30 flex-shrink-0">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#6B4226]/30 text-[#6B4226] hover:bg-[#6B4226] hover:text-white hover:border-[#6B4226] transition-all flex-shrink-0"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-[#E5E5E5] flex-shrink-0" />
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px #fff, 0 0 0 1px #C49A6C33" }}
                >
                  <User className="w-4 h-4 text-[#2D1206]" />
                  <h1 className="text-base font-black text-[#2D1206]">Mein Profil</h1>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {!isEditing ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="bg-[#8B5E3C] hover:bg-[#6B4226] flex-1 sm:flex-none"
                    size="sm"
                    type="button"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                ) : (
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSave();
                      }}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                      size="sm"
                      type="button"
                    >
                      <Save className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{isSaving ? "Speichere..." : "Speichern"}</span>
                      <span className="sm:hidden">{isSaving ? "..." : "OK"}</span>
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancel();
                      }} 
                      variant="outline" 
                      size="sm"
                      type="button"
                    >
                      <X className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Abbrechen</span>
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#F7F7F8]">
          <div className="px-3 sm:px-6 py-4 sm:py-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* User Info */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-[#8B5E3C]" />
                        Persönliche Daten
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Vorname</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={editData.first_name || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, first_name: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.first_name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nachname</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={editData.last_name || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, last_name: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.last_name}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>E-Mail</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="p-2 bg-gray-100 rounded flex-1 text-gray-600">{userData?.email}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.phone || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                            className="bg-white"
                            placeholder="+41 XX XXX XX XX"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="p-2 bg-gray-50 rounded flex-1">{userData?.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-[#8B5E3C]" />
                        Adresse
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Straße und Hausnummer</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={editData.address || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                            className="bg-white"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{userData?.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode">PLZ</Label>
                          {isEditing ? (
                            <Input
                              id="postalCode"
                              value={editData.postal_code || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, postal_code: e.target.value }))}
                              className="bg-white"
                              placeholder="1234"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.postal_code}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="city">Stadt</Label>
                          {isEditing ? (
                            <Input
                              id="city"
                              value={editData.city || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, city: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.city}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="canton">Kanton</Label>
                        {isEditing ? (
                          <Input
                            id="canton"
                            value={editData.canton || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, canton: e.target.value }))}
                            className="bg-white"
                            placeholder="z.B. Zürich, Bern, Basel..."
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{userData?.canton}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="notes">Anmerkungen</Label>
                        {isEditing ? (
                          <Textarea
                            id="notes"
                            value={editData.notes || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                            className="bg-white"
                            rows={3}
                            placeholder="Besondere Lieferhinweise..."
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded min-h-[80px]">
                            {userData?.notes || "Keine Anmerkungen"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-[#8B5E3C]" />
                        Konto-Übersicht
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#8B5E3C]">{totalOrders || 0}</div>
                        <p className="text-sm text-gray-600">Bestellungen</p>
                      </div>

                      <Separator />
                      {orderStats?.last_order_date && (
                   <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Letzte Bestellung</span>
                          </div>
                          <p className="text-sm font-medium">{formatDate(orderStats.last_order_date)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Password Change */}
                  <Card className="border-[#8B5E3C]/20 bg-[#8B5E3C]/5">
                    <CardHeader>
                      <CardTitle className="flex items-center text-[#8B5E3C]">
                        <Lock className="w-5 h-5 mr-2" />
                        Passwort ändern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-[#8B5E3C]">
                          Ändern Sie Ihr Passwort regelmäßig, um Ihr Konto zu schützen.
                        </p>
                        <Button onClick={openPasswordDialog} className="bg-[#8B5E3C] hover:bg-[#6B4226] w-full" size="lg">
                          <Lock className="w-4 h-4 mr-2" />
                          Passwort ändern
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* DANGER ZONE */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Konto löschen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-red-700">
                          <strong>Achtung:</strong> Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten werden
                          permanent entfernt.
                        </p>
                        <Button
                          onClick={openDeleteDialog}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 w-full"
                          size="lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Mein Konto löschen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Orders Section - EXPANDED */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Package className="w-5 h-5 mr-2 text-[#8B5E3C]" />
                          Meine Bestellungen ({totalOrders})
                        </CardTitle>
                        <Button
                          onClick={handleRefreshOrders}
                          variant="outline"
                          size="sm"
                          disabled={ordersLoading}
                          className="bg-white hover:bg-gray-50"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading ? "animate-spin" : ""}`} />
                          Aktualisieren
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Filters and Search */}
                      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-full">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Bestellnummer oder Produkt suchen..."
                              value={searchTerm}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="pl-10 bg-white text-sm"
                            />
                          </div>
                        </div>
              
                      </div>

                      {/* Orders Loading State */}
                      {ordersLoading && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C] mx-auto mb-4"></div>
                          <p className="text-gray-600">Lade Bestellungen...</p>
                        </div>
                      )}

                      {/* Orders Error State */}
                      {ordersError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <div>
                              <p className="text-red-700 font-medium">Fehler beim Laden der Bestellungen</p>
                              <p className="text-red-600 text-sm mt-1">{ordersError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Orders List */}
                      {!ordersLoading && !ordersError && (
                        <>
                          {orders.length > 0 ? (
                            <div className="space-y-4">
                              {orders.map((order) => (
                                <div key={order.id} className="border rounded-lg bg-white shadow-sm">
                                  <div className="p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                                      <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div>
                               
                                          <h4 className="font-semibold text-base sm:text-lg">{order.order_number}</h4>
                                          <p className="text-xs sm:text-sm text-gray-600">
                                            {formatDate(order.created_at)}
                                          </p>
                                        </div>
                             
                                      </div>
                                      <div className="text-left sm:text-right w-full sm:w-auto">
                                        <p className="font-bold text-lg text-[#8B5E3C]">
                                          {(Number(order.total_amount) || 0).toFixed(2)} CHF
                                        </p>
                                        <p className="text-sm text-gray-500">{order.items_count} Artikel</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600 mb-3">
                                      <div>
                                        <span className="font-medium">Zahlung:</span>
                                        <p className="capitalize">{order.payment_method}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Versand:</span>
                                        <p>{(Number(order.shipping_cost) || 0).toFixed(2)} CHF</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Stadt:</span>
                                        <p>{order.customer_city}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">PLZ:</span>
                                        <p>{order.customer_postal_code}</p>
                                      </div>
                                    </div>

                                    {getVisibleNotes(order.customer_notes || "") && (
                                      <div className="mb-3">
                                        <span className="font-medium text-sm text-gray-600">Anmerkungen:</span>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                                          {getVisibleNotes(order.customer_notes || "")}
                                        </p>
                                      </div>
                                    )}

                                    {/* Toggle Items Button */}
                                    <div className="flex justify-between items-center pt-3 border-t">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          onClick={() => toggleOrderItems(order.id)}
                                          variant="outline"
                                          size="sm"
                                          className="bg-gray-50 hover:bg-gray-100"
                                        >
                                          <Package className="w-4 h-4 mr-2" />
                                          {showOrderItems[order.id] ? "Ausblenden" : "Anzeigen"}
                                          {showOrderItems[order.id] ? (
                                            <ChevronLeft className="w-4 h-4 ml-2" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                          )}
                                        </Button>
                                        <Button
                                          onClick={() => downloadInvoicePDF(order)}
                                          variant="outline"
                                          size="sm"
                                          className="bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 text-[#8B5E3C] border-[#8B5E3C]/30"
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          PDF
                                        </Button>
                                      </div>
                                      <div className="text-xs text-gray-500 p-4">
                                        Bestellt am {formatDate(order.created_at)}
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    {showOrderItems[order.id] && order.items && order.items.length > 0 && (
                                      <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                                        <h5 className="font-medium mb-3 text-gray-800">Bestellte Artikel:</h5>
                                        <div className="space-y-3">
                                          {order.items.map((item, index) => (
                                            <div
                                              key={index}
                                              className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white p-3 rounded-lg shadow-sm"
                                            >
                                    
                                              <div className="flex-1 text-center sm:text-left">
                                                <h6 className="font-medium text-sm">{item.product_name}</h6>
                                                {item.product_description && (
                                                  <p className="text-xs text-gray-600 line-clamp-2">
                                                    {item.product_description}
                                                  </p>
                                                )}
                                                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1 flex-wrap gap-1">
                                              
                                                  {item.badge && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {item.badge}
                                                    </Badge>
                                                  )}
                                                  {item.origin && (
                                                    <Badge variant="outline" className="text-xs">
                                                      📍 {item.origin}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="text-center sm:text-right w-full sm:w-auto">
                                                <p className="font-medium text-[#8B5E3C]">
                                                  {(Number(item.subtotal) || 0).toFixed(2)} CHF
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                  {item.quantity}x {(Number(item.price) || 0).toFixed(2)} CHF
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t gap-3">
                                  <div className="text-sm text-gray-600 order-2 sm:order-1">
                                    Seite {currentPage} von {totalPages} ({totalOrders} Bestellungen)
                                  </div>
                                  <div className="flex items-center space-x-2 order-1 sm:order-2">
                                    <Button
                                      onClick={() => handlePageChange(currentPage - 1)}
                                      disabled={currentPage <= 1 || ordersLoading}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                      <span className="hidden sm:inline">Zurück</span>
                                    </Button>
                                    <span className="px-3 py-1 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded text-sm font-medium">
                                      {currentPage}
                                    </span>
                                    <Button
                                      onClick={() => handlePageChange(currentPage + 1)}
                                      disabled={currentPage >= totalPages || ordersLoading}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <span className="hidden sm:inline">Weiter</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-medium mb-2">Keine Bestellungen gefunden</h3>
                              {searchTerm || statusFilter ? (
                                <div>
                                  <p className="mb-4">Keine Bestellungen entsprechen Ihren Suchkriterien.</p>
                                  <Button
                                    onClick={() => {
                                      setSearchTerm("")
                                      setStatusFilter("")
                                      setCurrentPage(1)
                                    }}
                                    variant="outline"
                                    className="bg-white hover:bg-gray-50"
                                  >
                                    Filter zurücksetzen
                                  </Button>
                                </div>
                              ) : (
                                <p>Sie haben noch keine Bestellungen aufgegeben.</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md bg-white mx-4 max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Konto löschen
              </DialogTitle>
              <DialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Ihr Konto und alle damit verbundenen Daten werden
                permanent gelöscht.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Ihr Benutzerkonto und Profil</li>
                    <li>Alle Bestellungen und Bestellhistorie</li>
                    <li>Warenkorb und Favoriten</li>
                    <li>Alle Sitzungen und Anmeldedaten</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="deletePassword">Passwort zur Bestätigung</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Geben Sie Ihr Passwort ein"
                  className="bg-white"
                />
                {deleteError && <p className="text-sm text-red-600 mt-1">{deleteError}</p>}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={closeDeleteDialog} variant="outline" className="w-full sm:w-auto">
                Abbrechen
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !deletePassword.trim()}
                variant="destructive"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Lösche Konto..." : "Konto endgültig löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      {showPasswordDialog && (
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md bg-white mx-4 max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#8B5E3C]">
                <Lock className="w-5 h-5 mr-2" />
                Passwort ändern
              </DialogTitle>
              <DialogDescription>
                Geben Sie Ihr aktuelles Passwort ein und wählen Sie ein neues sicheres Passwort.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Ihr aktuelles Passwort"
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mindestens 8 Zeichen"
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="confirmNewPassword">Neues Passwort bestätigen</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Neues Passwort wiederholen"
                  className="bg-white"
                />
              </div>

              {passwordError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-600">{passwordError}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Passwort-Anforderungen:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Mindestens 8 Zeichen lang</li>
                    <li>Unterschiedlich vom aktuellen Passwort</li>
                    <li>Verwenden Sie eine Kombination aus Buchstaben, Zahlen und Symbolen</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={closePasswordDialog} variant="outline" className="w-full sm:w-auto">
                Abbrechen
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword || !passwordData.currentPassword.trim() || !passwordData.newPassword.trim()
                }
                className="w-full sm:w-auto bg-[#8B5E3C] hover:bg-[#6B4226]"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isChangingPassword ? "Ändere Passwort..." : "Passwort ändern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
