"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  Package,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  Clock,
  Flame,
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Shield,
  X,
  AlertTriangle,
  Package2,
  Upload,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  ImageIcon,
  Download,
  Images,
  Settings,
  Save,
  Megaphone,
  Bell,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ProductImage } from "@/components/product-image"

// Interfaces für Orders
interface OrderItem {
  order_id: number
  product_id: number
  product_name: string
  product_description: string
  product_image: string
  price: number | string
  quantity: number
  subtotal: number | string
  heat_level: number
  rating: number | string
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
  total_amount: number | string
  shipping_cost: number | string
  status: "pending" | "processing" | "completed" | "cancelled"
  payment_method: string
  payment_status: "pending" | "completed" | "failed"
  created_at: string
  updated_at: string
  items_count: number
  items?: OrderItem[]
}

interface OrderStats {
  total_orders: number | string
  total_revenue: number | string
  avg_order_value: number | string
  completed_orders: number | string
  pending_orders: number | string
  processing_orders: number | string
  cancelled_orders: number | string
}

// Interfaces für Products
interface Product {
  id: number
  name: string
  description: string
  price: number | string
  category: string
  stock: number
  stock_status: "in_stock" | "low_stock" | "out_of_stock"
  heat_level: number
  rating: number | string
  badge: string
  origin: string
  supplier: string
  weight_kg: number
  image_url: string
  image_url_candidates?: string[]
  created_at: string
}

interface ProductStats {
  total_products: number
  hot_sauces: number
  bbq_sauces: number
  total_stock: number
  out_of_stock: number
  low_stock: number
  in_stock: number
}

interface Category {
  id: number
  slug: string
  name: string
  description: string
  parent_id: number | null
}

interface AdminProps {
  onClose: () => void
}

export default function AdminPage() {
  return <Admin onClose={() => window.history.back()} />
}

export function Admin({ onClose }: AdminProps) {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const prevThemeRef = useRef<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("orders")

  // Payment Settings
  const [paySettings, setPaySettings] = useState({
    paypal_email: "", stripe_secret_key: "", stripe_publishable_key: "", stripe_webhook_secret: "",
    twint_phone: "", bank_iban: "", bank_holder: "", bank_name: "",
    enable_paypal: false, enable_stripe: false, enable_twint: false, enable_invoice: true,
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSavedMsg, setSettingsSavedMsg] = useState("")

  const API_BASE = "https://web.lweb.ch/ledershop"

  const getPaymentChip = (method: string, status?: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      paypal:  { label: "PayPal",    bg: "#e8f0fe", color: "#0070BA" },
      stripe:  { label: "Kreditkarte", bg: "#f3e8ff", color: "#7c3aed" },
      twint:   { label: "TWINT",     bg: "#1a1a1a", color: "#ffffff" },
      invoice: { label: "Rechnung",  bg: "#f0fdf4", color: "#166534" },
    }
    const cfg = map[method?.toLowerCase()] ?? { label: method || "—", bg: "#f3f4f6", color: "#555" }
    const isPending = status === "pending"
    return (
      <span style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full">
        {cfg.label}
        {isPending && <span className="ml-1 text-orange-500">⏳</span>}
      </span>
    )
  }

  const loadPaymentSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_payment_settings.php`)
      const data = await res.json()
      if (data.success && data.settings) {
        setPaySettings(prev => ({ ...prev, ...data.settings }))
      }
    } catch {}
  }

  const savePaymentSettings = async () => {
    setIsSavingSettings(true)
    setSettingsSavedMsg("")
    try {
      const res = await fetch(`${API_BASE}/save_payment_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paySettings),
      })
      const data = await res.json()
      setSettingsSavedMsg(data.success ? "✅ Einstellungen gespeichert!" : `❌ ${data.error}`)
    } catch (e: any) {
      setSettingsSavedMsg(`❌ Fehler: ${e.message}`)
    } finally {
      setIsSavingSettings(false)
      setTimeout(() => setSettingsSavedMsg(""), 4000)
    }
  }

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [totalOrderPages, setTotalOrderPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null)
  const [sendingShipId, setSendingShipId] = useState<number | null>(null)
  const [shipConfirmOrder, setShipConfirmOrder] = useState<Order | null>(null)

  // Products State
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [productStats, setProductStats] = useState<ProductStats | null>(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState("")
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEditingProduct, setCurrentEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null])

  // Bulk selection
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<string>("")
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const filterCardRef = useRef<HTMLDivElement>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [removedImages, setRemovedImages] = useState<boolean[]>([false, false, false, false])

  // Categories State
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    inserted?: number
    updated?: number
    skipped?: number
    deleted?: number
    parsed?: number
    errors?: string[]
    error?: string
  } | null>(null)

  // Excel Add (sin borrar) State
  const [addFile, setAddFile] = useState<File | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [addResult, setAddResult] = useState<{
    success: boolean
    inserted?: number
    updated?: number
    skipped?: number
    parsed?: number
    processedIds?: number[]
    errors?: string[]
    error?: string
  } | null>(null)

  type ImportBatch = { filename: string; date: string; ids: number[]; count: number }
  const [importHistory, setImportHistory] = useState<ImportBatch[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved: ImportBatch[] = JSON.parse(localStorage.getItem("excel-import-history") || "[]")
      const cleaned = saved.filter(b => b.ids?.length > 0)
      if (cleaned.length !== saved.length) localStorage.setItem("excel-import-history", JSON.stringify(cleaned))
      return cleaned
    } catch { return [] }
  })
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null)

  // Blog State
  interface BlogPost { id: number; title: string; content: string; hero_image?: string; hero_image_url?: string; image2_url?: string; image3_url?: string; image4_url?: string; created_at: string }
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(false)
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  const [currentEditingPost, setCurrentEditingPost] = useState<BlogPost | null>(null)
  const [blogImagePreviews, setBlogImagePreviews] = useState<(string | null)[]>([null, null, null, null])
  const [blogRemovedImages, setBlogRemovedImages] = useState<boolean[]>([false, false, false, false])
  const [blogForm, setBlogForm] = useState({ title: "", content: "" })
  const [blogImageFiles, setBlogImageFiles] = useState<(File | null)[]>([null, null, null, null])
  const [blogSaving, setBlogSaving] = useState(false)
  const [deleteBlogId, setDeleteBlogId] = useState<number | null>(null)
  const [blogImageUrls, setBlogImageUrls] = useState<string[]>(["", "", "", ""])

  // Gallery State
  interface GalleryImage { id: number; title?: string; image_url: string; created_at: string }
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [galleryForm, setGalleryForm] = useState({ title: "" })
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null)
  const [galleryImageUrl, setGalleryImageUrl] = useState("")
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null)
  const [gallerySaving, setGallerySaving] = useState(false)
  const [deleteGalleryId, setDeleteGalleryId] = useState<number | null>(null)

  // Announcements State
  interface Announcement { id: number; type: 'general' | 'product'; title: string; subtitle: string | null; image1: string | null; image1_url: string | null; image2: string | null; image2_url: string | null; product_url: string | null; is_active: boolean; show_once: boolean; created_at: string }
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading] = useState(false)
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false)
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
  const [annSaving, setAnnSaving] = useState(false)
  const [deleteAnnId, setDeleteAnnId] = useState<number | null>(null)
  const [annForm, setAnnForm] = useState({ type: 'general' as 'general' | 'product', title: '', subtitle: '', product_url: '', show_once: false })
  const [annImageFiles, setAnnImageFiles] = useState<[File | null, File | null]>([null, null])
  const [annImagePreviews, setAnnImagePreviews] = useState<[string | null, string | null]>([null, null])
  const [annImageUrls, setAnnImageUrls] = useState<[string, string]>(["", ""])
  const [annRemovedImages, setAnnRemovedImages] = useState<[boolean, boolean]>([false, false])
  const [togglingAnnId, setTogglingAnnId] = useState<number | null>(null)

  // Shipping Settings State
  interface ShippingZone { id: number; name: string; countries: string; enabled: boolean }
  interface ShippingRange { id: number; min_kg: number; max_kg: number; label: string }
  interface ShippingRate { zone_id: number; range_id: number; price: number }
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [shippingRanges, setShippingRanges] = useState<ShippingRange[]>([])
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingSavedMsg, setShippingSavedMsg] = useState("")
  const [isSavingShipping, setIsSavingShipping] = useState(false)

  const loadShippingSettings = async () => {
    setShippingLoading(true)
    try {
      const res = await fetch(`${API_BASE}/get_shipping_settings.php`)
      const data = await res.json()
      if (data.success) {
        setShippingZones(data.zones.map((z: any) => ({ ...z, enabled: z.enabled !== false && z.enabled !== 0 && z.enabled !== "0" })))
        setShippingRanges(data.ranges)
        setShippingRates(data.rates.map((r: any) => ({
          zone_id: Number(r.zone_id),
          range_id: Number(r.range_id),
          price: Number(r.price),
        })))
      }
    } catch {}
    setShippingLoading(false)
  }

  const getRate = (zoneId: number, rangeId: number) =>
    shippingRates.find(r => r.zone_id === zoneId && r.range_id === rangeId)?.price ?? 0

  const setRate = (zoneId: number, rangeId: number, price: number) => {
    setShippingRates(prev => {
      const idx = prev.findIndex(r => r.zone_id === zoneId && r.range_id === rangeId)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = { zone_id: zoneId, range_id: rangeId, price }; return next
      }
      return [...prev, { zone_id: zoneId, range_id: rangeId, price }]
    })
  }

  const saveShippingSettingsData = async (zones: any[], ranges: any[], rates: any[]) => {
    try {
      await fetch(`${API_BASE}/save_shipping_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones, ranges, rates }),
      })
    } catch {}
  }

  const saveShippingSettings = async () => {
    setIsSavingShipping(true)
    setShippingSavedMsg("")
    try {
      const res = await fetch(`${API_BASE}/save_shipping_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones: shippingZones, ranges: shippingRanges, rates: shippingRates }),
      })
      const data = await res.json()
      setShippingSavedMsg(data.success ? "✅ Versandeinstellungen gespeichert!" : `❌ ${data.error}`)
    } catch (e: any) {
      setShippingSavedMsg(`❌ Fehler: ${e.message}`)
    } finally {
      setIsSavingShipping(false)
      setTimeout(() => setShippingSavedMsg(""), 4000)
    }
  }

  const nextShippingId = (arr: { id: number }[]) =>
    arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1

  // Filter Orders
  const [orderFilters, setOrderFilters] = useState({
    search: "",
    status: "all",
    email: "",
  })

  // Filter Products
  const [productFilters, setProductFilters] = useState({
    search: "",
    category: "",
    stock_status: "",
    sortBy: "name",
  })

  const API_BASE_URL = "https://web.lweb.ch/ledershop"

  useEffect(() => {
    setMounted(true)
    prevThemeRef.current = theme
    setTheme("light")
    return () => { setTheme(prevThemeRef.current || "dark") }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = filterCardRef.current
      if (!el) { setHasScrolled(window.scrollY > 200); return }
      const rect = el.getBoundingClientRect()
      setHasScrolled(rect.bottom < 64)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders()
    } else if (activeTab === "products") {
      loadProducts()
      if (categories.length === 0) loadCategories()
    } else if (activeTab === "blog") {
      loadBlogPosts()
    } else if (activeTab === "gallery") {
      loadGalleryImages()
    } else if (activeTab === "settings") {
      loadPaymentSettings()
    } else if (activeTab === "versand") {
      loadShippingSettings()
    } else if (activeTab === "anuncios") {
      loadAnnouncements()
    }
  }, [activeTab, currentOrderPage, orderFilters])

  useEffect(() => {
    if (activeTab === "products") {
      filterProducts()
    }
  }, [products, productFilters])

  // Blog Functions
  const loadBlogPosts = async () => {
    setBlogLoading(true)
    try {
      const res = await fetch("/api/blog")
      const d = await res.json()
      if (d.success) setBlogPosts(d.posts)
    } catch {}
    finally { setBlogLoading(false) }
  }

  const openBlogModal = (post?: BlogPost) => {
    setCurrentEditingPost(post ?? null)
    setBlogForm({ title: post?.title ?? "", content: post?.content ?? "" })
    setBlogImagePreviews([post?.hero_image_url ?? null, post?.image2_url ?? null, post?.image3_url ?? null, post?.image4_url ?? null])
    setBlogRemovedImages([false, false, false, false])
    setBlogImageFiles([null, null, null, null])
    setBlogImageUrls(["", "", "", ""])
    setIsBlogModalOpen(true)
  }

  const saveBlogPost = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      toast({ title: "Fehler", description: "Titel und Inhalt sind erforderlich", variant: "destructive" }); return
    }
    setBlogSaving(true)
    try {
      const fd = new FormData()
      const fields = ["hero_image", "image2", "image3", "image4"]
      if (currentEditingPost) {
        fd.append("id", String(currentEditingPost.id))
        blogRemovedImages.forEach((r, i) => { if (r) fd.append("remove_" + fields[i], "1") })
      }
      fd.append("title", blogForm.title)
      fd.append("content", blogForm.content)
      blogImageFiles.forEach((f, i) => { if (f) fd.append(fields[i], f) })
      blogImageUrls.forEach((u, i) => { if (u.trim() && !blogImageFiles[i]) fd.append(fields[i] + "_url", u.trim()) })
      const url = currentEditingPost
        ? `/api/blog/edit`
        : `/api/blog/add`
      const res = await fetch(url, { method: "POST", body: fd })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: currentEditingPost ? "Post aktualisiert" : "Post erstellt" })
      setIsBlogModalOpen(false)
      await loadBlogPosts()
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    } finally { setBlogSaving(false) }
  }

  const deleteBlogPost = async (id: number) => {
    try {
      const res = await fetch(`/api/blog/edit?id=${id}`, { method: "DELETE" })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: "Post gelöscht" })
      setDeleteBlogId(null)
      await loadBlogPosts()
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    }
  }

  // Gallery Functions
  const loadGalleryImages = async (bustCache = false) => {
    setGalleryLoading(true)
    try {
      const url = bustCache ? `/api/gallery?t=${Date.now()}` : "/api/gallery"
      const res = await fetch(url)
      const d = await res.json()
      if (d.success) setGalleryImages(d.images ?? d.gallery ?? [])
    } catch {}
    finally { setGalleryLoading(false) }
  }

  const openGalleryModal = () => {
    setGalleryForm({ title: "" })
    setGalleryImageFile(null)
    setGalleryImageUrl("")
    setGalleryImagePreview(null)
    setIsGalleryModalOpen(true)
  }

  const saveGalleryImage = async () => {
    if (!galleryImageFile && !galleryImageUrl.trim()) {
      toast({ title: "Bitte wähle ein Bild aus oder gib eine URL ein.", variant: "destructive" }); return
    }
    setGallerySaving(true)
    try {
      const fd = new FormData()
      if (galleryForm.title.trim()) fd.append("title", galleryForm.title.trim())
      if (galleryImageFile) fd.append("image", galleryImageFile)
      else if (galleryImageUrl.trim()) fd.append("image_url", galleryImageUrl.trim())
      const res = await fetch("/api/gallery/add", { method: "POST", body: fd })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: "Bild hinzugefügt" })
      setIsGalleryModalOpen(false)
      await loadGalleryImages(true)
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    } finally { setGallerySaving(false) }
  }

  const deleteGalleryImage = async (id: number) => {
    try {
      const res = await fetch(`/api/gallery/edit?id=${id}`, { method: "DELETE" })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: "Bild gelöscht" })
      setDeleteGalleryId(null)
      setGalleryImages(prev => prev.filter(img => img.id !== id))
      await loadGalleryImages(true)
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    }
  }

  // Announcement Functions
  const loadAnnouncements = async () => {
    setAnnLoading(true)
    try {
      const res = await fetch("/api/announcement")
      const d = await res.json()
      if (d.success) setAnnouncements(d.announcements ?? [])
    } catch {}
    finally { setAnnLoading(false) }
  }

  const openAnnModal = (ann?: Announcement) => {
    setEditingAnn(ann ?? null)
    setAnnForm({
      type: ann?.type ?? 'general',
      title: ann?.title ?? '',
      subtitle: ann?.subtitle ?? '',
      product_url: ann?.product_url ?? '',
      show_once: ann?.show_once ?? false,
    })
    setAnnImagePreviews([ann?.image1_url ?? null, ann?.image2_url ?? null])
    setAnnImageFiles([null, null])
    setAnnImageUrls(["", ""])
    setAnnRemovedImages([false, false])
    setIsAnnModalOpen(true)
  }

  const saveAnnouncement = async () => {
    if (!annForm.title.trim()) {
      toast({ title: "Fehler", description: "Titel ist erforderlich", variant: "destructive" }); return
    }
    setAnnSaving(true)
    try {
      const fd = new FormData()
      fd.append("action", "save")
      if (editingAnn) fd.append("id", String(editingAnn.id))
      fd.append("type", annForm.type)
      fd.append("title", annForm.title)
      fd.append("subtitle", annForm.subtitle)
      fd.append("product_url", annForm.product_url)
      fd.append("show_once", annForm.show_once ? "1" : "")
      ;([0, 1] as const).forEach(i => {
        const key = i === 0 ? "image1" : "image2"
        if (annRemovedImages[i]) fd.append(`remove_${key}`, "1")
        if (annImageFiles[i]) fd.append(key, annImageFiles[i]!)
        else if (annImageUrls[i]) fd.append(`${key}_url`, annImageUrls[i])
      })
      const res = await fetch("/api/announcement/save", { method: "POST", body: fd })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: editingAnn ? "Aktualisiert" : "Erstellt" })
      setIsAnnModalOpen(false)
      await loadAnnouncements()
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    } finally { setAnnSaving(false) }
  }

  const deleteAnnouncement = async (id: number) => {
    try {
      const res = await fetch(`/api/announcement/save?id=${id}`, { method: "DELETE" })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast({ title: "Anzeige gelöscht" })
      setDeleteAnnId(null)
      await loadAnnouncements()
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    }
  }

  const toggleAnnouncement = async (id: number) => {
    setTogglingAnnId(id)
    try {
      const fd = new FormData()
      fd.append("action", "toggle")
      fd.append("id", String(id))
      const res = await fetch("/api/announcement/save", { method: "POST", body: fd })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      await loadAnnouncements()
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" })
    } finally { setTogglingAnnId(null) }
  }

  // Orders Functions
  const sendShippingNotification = async (order: Order) => {
    setSendingShipId(order.id)
    try {
      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "processing" } : o))
        toast({ title: "📦 Versandbenachrichtigung gesendet", description: `Email an ${order.customer_email} gesendet.` })
      } else {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Verbindungsfehler", variant: "destructive" })
    } finally {
      setSendingShipId(null)
    }
  }

  const markAsPaid = async (order: Order) => {
    setMarkingPaidId(order.id)
    try {
      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, payment_status: "completed", status: "completed" }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: "completed", status: "completed" } : o))
        toast({ title: "Als bezahlt markiert" })
      } else {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Verbindungsfehler", variant: "destructive" })
    } finally {
      setMarkingPaidId(null)
    }
  }

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError("")

      const params = new URLSearchParams({
        page: currentOrderPage.toString(),
        limit: "20",
        include_items: "true",
        ...Object.fromEntries(Object.entries(orderFilters).filter(([_, value]) => value && value !== "all")),
      })

      const response = await fetch(`${API_BASE_URL}/get_orders.php?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setOrderStats(data.stats)
        setTotalOrderPages(data.pagination.total_pages)
      } else {
        setOrdersError("Fehler beim Laden der Bestellungen")
      }
    } catch (err) {
      setOrdersError("Verbindungsfehler")
      console.error("Error loading orders:", err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleOrderFilterChange = (key: string, value: string) => {
    setOrderFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentOrderPage(1)
  }

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  // Products Functions
  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setProductsError("")

      const params = new URLSearchParams()
      if (productFilters.stock_status) {
        params.append("stock_status", productFilters.stock_status)
      }

      params.append("_", Date.now().toString())
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setProductStats(data.stats)
      } else {
        setProductsError("Fehler beim Laden der Produkte")
      }
    } catch (err) {
      setProductsError("Verbindungsfehler")
      console.error("Error loading products:", err)
    } finally {
      setProductsLoading(false)
    }
  }

  const loadCategories = async (bust = false) => {
    try {
      const url = bust ? `/api/categories?bust=1` : `/api/categories`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (err) {
      console.error("Error loading categories:", err)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const isEditing = editingCategory !== null
    if (isEditing) formData.append("id", editingCategory.id.toString())
    // Convertir "none" a cadena vacía para que PHP lo trate como null
    if (formData.get("parent_id") === "none") formData.set("parent_id", "")
    const url = isEditing ? `${API_BASE_URL}/edit_category.php` : `${API_BASE_URL}/add_category.php`
    try {
      const response = await fetch(url, { method: "POST", body: formData })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Erfolg", description: isEditing ? "Kategorie aktualisiert" : "Kategorie erstellt" })
        setIsCategoryModalOpen(false)
        setEditingCategory(null)
        loadCategories(true)
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error(data.error || "Fehler")
      }
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete_category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${cat.id}`,
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Erfolg", description: "Kategorie gelöscht" })
        loadCategories(true)
      } else {
        toast({ title: "Nicht möglich", description: data.error, variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" })
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (productFilters.search) {
      const searchTerm = productFilters.search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          (product.badge && product.badge.toLowerCase().includes(searchTerm)) ||
          (product.origin && product.origin.toLowerCase().includes(searchTerm)),
      )
    }

    if (productFilters.category) {
      filtered = filtered.filter((product) => product.category === productFilters.category)
    }

    if (productFilters.stock_status) {
      filtered = filtered.filter((product) => product.stock_status === productFilters.stock_status)
    }

    filtered.sort((a, b) => {
      switch (productFilters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return Number.parseFloat(a.price.toString()) - Number.parseFloat(b.price.toString())
        case "stock":
          return b.stock - a.stock
        case "rating":
          return Number.parseFloat(b.rating.toString()) - Number.parseFloat(a.rating.toString())
        case "heat_level":
          return b.heat_level - a.heat_level
        case "category":
          return a.category.localeCompare(b.category)
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }

  const showAddProductModal = () => {
    setCurrentEditingProduct(null)
    setImagePreviews([null, null, null, null])
    setRemovedImages([false, false, false, false])
    setIsProductModalOpen(true)
  }

  const showEditProductModal = async (id: number) => {
    try {
      const response = await fetch(`/api/products?id=${id}&_=${Date.now()}`)
      const data = await response.json()

      if (data.success) {
        setCurrentEditingProduct(data.product)
        setImagePreviews(data.product.image_urls || [data.product.image_url, null, null, null])
        setRemovedImages([false, false, false, false])
        setIsProductModalOpen(true)
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden des Produkts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast({
        title: "Fehler",
        description: "Fehler beim Laden des Produkts",
        variant: "destructive",
      })
    }
  }

  const showDeleteProductModal = (id: number, name: string) => {
    setDeleteProductId(id)
    setIsDeleteModalOpen(true)
  }

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set())
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)))
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedProductIds.size === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(
        Array.from(selectedProductIds).map((id) => {
          const product = products.find((p) => p.id === id)
          if (!product) return Promise.resolve()
          const formData = new FormData()
          formData.append("id", id.toString())
          formData.append("name", product.name)
          formData.append("price", product.price.toString())
          formData.append("stock_status", bulkStatus)
          if (bulkStatus === "out_of_stock") {
            formData.append("stock", "0")
          } else if (bulkStatus === "in_stock" && Number(product.stock) === 0) {
            formData.append("stock", "5")
          } else {
            formData.append("stock", product.stock.toString())
          }
          formData.append("keep_image_0", "true")
          return fetch(`${API_BASE_URL}/edit_product.php`, { method: "POST", body: formData })
        })
      )
      toast({ title: "Erfolg", description: `${selectedProductIds.size} Produkte aktualisiert` })
      setSelectedProductIds(new Set())
      setBulkStatus("")
      loadProducts()
    } catch {
      toast({ title: "Fehler", description: "Fehler beim Aktualisieren", variant: "destructive" })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const isEditing = currentEditingProduct !== null

    if (isEditing) {
      formData.append("id", currentEditingProduct.id.toString())
    }

    const form = e.currentTarget
    for (let i = 0; i < 4; i++) {
      const imageInput = form.elements.namedItem(`image_${i}`) as HTMLInputElement
      if (imageInput?.files?.[0]) {
        formData.append(`image_${i}`, imageInput.files[0])
      } else if (isEditing) {
        if (removedImages[i]) {
          formData.append(`remove_image_${i}`, 'true')
        } else if (imagePreviews[i]) {
          formData.append(`keep_image_${i}`, 'true')
        }
      }
    }

    try {
      const url = isEditing ? `${API_BASE_URL}/edit_product.php` : `${API_BASE_URL}/add_product.php`

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Erfolg",
          description: isEditing ? "Produkt erfolgreich aktualisiert" : "Produkt erfolgreich hinzugefügt",
        })
        setIsProductModalOpen(false)
        loadProducts()
      } else {
        throw new Error(data.error || "Fehler beim Speichern des Produkts")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Produkts",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      const response = await fetch(`${API_BASE_URL}/edit_product.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${deleteProductId}`,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Erfolg",
          description: "Produkt erfolgreich gelöscht",
        })
        setIsDeleteModalOpen(false)
        setDeleteProductId(null)
        loadProducts()
      } else {
        throw new Error(data.error || "Fehler beim Löschen des Produkts")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Produkts",
        variant: "destructive",
      })
    }
  }

  const handleExcelImport = async () => {
    if (!importFile) return
    setImportLoading(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      const response = await fetch("/api/import-products", { method: "POST", body: formData })
      const data = await response.json()
      setImportResult(data)
      if (data.success) {
        toast({ title: "Import erfolgreich", description: `${data.inserted} neu, ${data.updated} aktualisiert, ${data.deleted ?? 0} gelöscht` })
        loadProducts()
        if (categories.length === 0) loadCategories()
        else loadCategories()
      } else {
        toast({ title: "Import fehlgeschlagen", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fehler", description: "Verbindungsfehler beim Import", variant: "destructive" })
    } finally {
      setImportLoading(false)
    }
  }

  const handleExcelAdd = async () => {
    if (!addFile) return
    setAddLoading(true)
    setAddResult(null)
    try {
      const formData = new FormData()
      formData.append("file", addFile)
      const response = await fetch("/api/add-products", { method: "POST", body: formData })
      const data = await response.json()
      setAddResult(data)
      if (data.success) {
        toast({ title: "Hinzufügen erfolgreich", description: `${data.inserted} neu, ${data.updated} aktualisiert — nichts gelöscht` })
        loadProducts()
        loadCategories()
        // Solo guardar en historial si hay productos nuevos
        if (data.processedIds?.length > 0) {
          const batch = {
            filename: addFile.name,
            date: new Date().toLocaleString("de-CH"),
            ids: data.processedIds,
            count: data.processedIds.length,
          }
          const updated = [batch, ...importHistory].slice(0, 20)
          setImportHistory(updated)
          localStorage.setItem("excel-import-history", JSON.stringify(updated))
        }
      } else {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fehler", description: "Verbindungsfehler", variant: "destructive" })
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteBatch = async (batch: { filename: string; date: string; ids: number[]; count: number }) => {
    setDeletingBatch(batch.date)
    try {
      const response = await fetch("/api/delete-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: batch.ids }),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Gelöscht", description: `${data.deleted} Produkte aus "${batch.filename}" entfernt` })
        const updated = importHistory.filter(b => b.date !== batch.date)
        setImportHistory(updated)
        localStorage.setItem("excel-import-history", JSON.stringify(updated))
        loadProducts()
        loadCategories()
      } else {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fehler", description: "Verbindungsfehler", variant: "destructive" })
    } finally {
      setDeletingBatch(null)
    }
  }

  const handleImageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPreviews = [...imagePreviews]
        newPreviews[index] = e.target?.result as string
        setImagePreviews(newPreviews)
      }
      reader.readAsDataURL(file)
    }
  }

  // Utility Functions
  const downloadInvoicePDF = async (order: Order) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 15

    // Logo
    try {
      const img = new window.Image()
      img.src = "/logo.png"
      await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res() })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth || 1
      canvas.height = img.naturalHeight || 1
      canvas.getContext("2d")?.drawImage(img, 0, 0)
      const logoH = 20
      const logoW = img.naturalWidth ? (img.naturalWidth / img.naturalHeight) * logoH : logoH
      doc.addImage(canvas.toDataURL("image/png"), "PNG", margin, 10, logoW, logoH)
    } catch (_) {/* kein Logo */}

    // Firmendaten
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(139, 94, 60)
    doc.text("Leder-Shop", margin, 36)
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
    doc.text("HANDGEMACHT · SCHWEIZ", margin, 41)
    doc.text("9468 Sax (SG)", margin, 46)
    doc.text("Tel: 077 416 73 75", margin, 51)
    doc.text("info@leder-shop.ch", margin, 56)

    // Titel Rechnung
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(139, 94, 60)
    doc.text("RECHNUNG", pageW - margin, 36, { align: "right" })
    doc.setFontSize(10); doc.setTextColor(100, 100, 100)
    doc.text(`Nr: ${order.order_number}`, pageW - margin, 43, { align: "right" })
    doc.text(`Datum: ${formatDate(order.created_at)}`, pageW - margin, 49, { align: "right" })

    // Trennlinie
    doc.setDrawColor(139, 94, 60); doc.setLineWidth(0.5)
    doc.line(margin, 62, pageW - margin, 62)

    // Kundendaten
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(40, 40, 40)
    doc.text("Rechnungsadresse:", margin, 70)
    doc.setFont("helvetica", "normal"); doc.setFontSize(10)
    const lines = [
      `${order.customer_first_name} ${order.customer_last_name}`,
      order.customer_address,
      `${order.customer_postal_code} ${order.customer_city}`,
      order.customer_canton,
      order.customer_email,
      order.customer_phone,
    ].filter(Boolean)
    lines.forEach((l, i) => doc.text(l, margin, 77 + i * 5.5))

    // Bestellstatus
    doc.setFont("helvetica", "bold"); doc.setFontSize(10)
    doc.text(`Status: ${getStatusText(order.status)}`, pageW - margin, 70, { align: "right" })
    const methodLabels: Record<string, string> = { paypal: "PayPal", stripe: "Kreditkarte", twint: "TWINT", invoice: "Rechnung/Vorkasse" }
    const methodLabel = methodLabels[order.payment_method?.toLowerCase()] ?? order.payment_method
    const statusLabel = order.payment_status === "completed" ? "✓ Bezahlt" : order.payment_status === "pending" ? "⏳ Ausstehend" : order.payment_status
    doc.text(`Zahlung: ${methodLabel} — ${statusLabel}`, pageW - margin, 76, { align: "right" })

    // Artikeltabelle
    let y = 118
    const colQty   = 130
    const colPrice = 158
    const colTotal = pageW - margin

    doc.setFillColor(139, 94, 60); doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold"); doc.setFontSize(10)
    doc.rect(margin, y, pageW - margin * 2, 8, "F")
    doc.text("Artikel", margin + 2, y + 5.5)
    doc.text("Menge", colQty, y + 5.5)
    doc.text("Stückpreis", colPrice, y + 5.5, { align: "right" })
    doc.text("Gesamt", colTotal, y + 5.5, { align: "right" })
    y += 10

    doc.setFont("helvetica", "normal"); doc.setTextColor(40, 40, 40)
    const items = order.items || []
    items.forEach((item, idx) => {
      if (idx % 2 === 0) { doc.setFillColor(250, 245, 235); doc.rect(margin, y - 2, pageW - margin * 2, 8, "F") }
      doc.setFontSize(9)
      doc.text(item.product_name.substring(0, 50), margin + 2, y + 4)
      doc.text(`${item.quantity}x`, colQty, y + 4)
      doc.text(`${(Number(item.price) || 0).toFixed(2)} CHF`, colPrice, y + 4, { align: "right" })
      doc.text(`${(Number(item.subtotal) || 0).toFixed(2)} CHF`, colTotal, y + 4, { align: "right" })
      y += 9
    })

    // Totales
    y += 4
    doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y); y += 6
    doc.setFontSize(10); doc.setFont("helvetica", "normal")
    doc.text("Versandkosten:", pageW - 55, y)
    doc.text(`${(Number(order.shipping_cost) || 0).toFixed(2)} CHF`, pageW - margin, y, { align: "right" })
    y += 7
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(139, 94, 60)
    doc.text("TOTAL:", pageW - 55, y)
    doc.text(`${(Number(order.total_amount) || 0).toFixed(2)} CHF`, pageW - margin, y, { align: "right" })

    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text("Vielen Dank für Ihren Einkauf!", pageW / 2, 285, { align: "center" })

    doc.save(`Rechnung_${order.order_number}.pdf`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#2D1206] dark:text-[#A89070] dark:border-[#3a2010]"
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

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#2D1206] dark:text-[#A89070] dark:border-[#3a2010]"
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "Auf Lager"
      case "low_stock":
        return "Geringer Lagerbestand"
      case "out_of_stock":
        return "Nicht vorrätig"
      default:
        return status
    }
  }

  const getCategoryDisplay = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug)
    return cat ? cat.name : slug || "❓ Keine Kategorie"
  }

  const generateHeatIcons = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Flame key={i} className={`w-4 h-4 ${i < level ? "text-red-500" : "text-gray-300"}`} />
    ))
  }

  const generateStarIcons = (rating: number | string) => {
    const numRating = Number.parseFloat(rating.toString())
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(numRating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
      />
    ))
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

  if (
    (activeTab === "orders" && ordersLoading && orders.length === 0) ||
    (activeTab === "products" && productsLoading && products.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] dark:bg-[#120804] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-[#D4C0A0]">Verwaltungspanel wird geladen...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] dark:bg-[#120804]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a0b04] border-b border-[#E0E0E0] dark:border-[#3a2010] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#6B4226]/30 dark:border-[#3a2010] text-[#6B4226] dark:text-[#C49A6C] hover:bg-[#6B4226] hover:text-white hover:border-[#6B4226] transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-[#E0E0E0] dark:bg-[#3a2010]" />
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #C49A6C33" }}
              >
                <Shield className="w-4 h-4 text-[#2D1206] dark:text-[#FAF7F4]" />
                <span className="font-black text-[#2D1206] dark:text-[#FAF7F4] text-sm tracking-tight">Verwaltungspanel</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "products" && hasScrolled && (
                <button
                  onClick={() => setShowCategoryFilterModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-bold rounded-full transition-all"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {productFilters.category
                      ? categories.find(c => c.slug === productFilters.category)?.name ?? productFilters.category
                      : "Kategorie"}
                  </span>
                </button>
              )}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[#F5EDE0] dark:hover:bg-[#2D1206] rounded-xl transition-colors"
                  aria-label="Farbschema wechseln"
                >
                  {theme === "dark"
                    ? <Sun className="w-5 h-5 text-[#C49A6C]" />
                    : <Moon className="w-5 h-5 text-[#8B5E3C]" />
                  }
                </button>
              )}
              <button
                onClick={activeTab === "orders" ? loadOrders : loadProducts}
                disabled={ordersLoading || productsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#8B5E3C] hover:bg-[#6B4226] text-white text-sm font-bold rounded-full transition-all disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading || productsLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Aktualisieren</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto mb-8 -mx-2 px-2 pb-1">
          <TabsList className="flex w-max lg:grid lg:grid-cols-7 lg:w-full bg-white dark:bg-[#1a0b04] border border-[#EBEBEB] dark:border-[#3a2010] rounded-2xl p-1 shadow-sm gap-1">
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 font-semibold shrink-0 bg-blue-50 text-blue-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-blue-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bestellungen</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 font-semibold shrink-0 bg-blue-50 text-blue-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-blue-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Produkte</span>
            </TabsTrigger>
            <TabsTrigger
              value="versand"
              className="flex items-center gap-2 font-semibold shrink-0 bg-blue-50 text-blue-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-blue-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Versand</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 font-semibold shrink-0 bg-blue-50 text-blue-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-blue-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Zahlungen</span>
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="flex items-center gap-2 font-semibold shrink-0 bg-green-50 text-green-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-green-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Images className="w-4 h-4" />
              <span>Galerie</span>
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="flex items-center gap-2 font-semibold shrink-0 bg-green-50 text-green-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-green-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Blog</span>
            </TabsTrigger>
            <TabsTrigger
              value="anuncios"
              className="flex items-center gap-2 font-semibold shrink-0 bg-green-50 text-green-700 dark:bg-[#2D1206] dark:text-[#C49A6C] data-[state=active]:bg-green-400 dark:data-[state=active]:bg-[#8B5E3C] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Anzeigen</span>
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {/* Orders Stats Cards */}
            {orderStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Bestellungen</p>
                        <p className="text-3xl font-black text-[#1A1A1A] dark:text-[#FAF7F4] mt-1">
                          {Number.parseInt(String(orderStats.total_orders ?? 0)) || 0}
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Umsatz</p>
                        <p className="text-2xl font-black text-[#8B5E3C] mt-1">
                          {(Number.parseFloat(String(orderStats.total_revenue ?? 0)) || 0).toFixed(2)}
                          <span className="text-sm font-semibold text-[#888] ml-1">CHF</span>
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-[#8B5E3C]/10 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#8B5E3C]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Abgeschlossen</p>
                        <p className="text-3xl font-black text-[#8B5E3C] mt-1">
                          {Number.parseInt(String(orderStats.completed_orders ?? 0)) || 0}
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-[#8B5E3C]/10 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[#8B5E3C]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Ausstehend</p>
                        <p className="text-3xl font-black text-yellow-600 mt-1">
                          {Number.parseInt(String(orderStats.pending_orders ?? 0)) || 0}
                        </p>
                      </div>
                      <div className="w-11 h-11 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Filters */}
            <Card className="mb-8 rounded-2xl border-[#EBEBEB] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Filter className="w-4 h-4 mr-2 text-[#8B5E3C]" />
                  Bestellungsfilter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="order-search">Suchen</Label>
                    <Input
                      id="order-search"
                      placeholder="Name, E-Mail, Nummer..."
                      value={orderFilters.search}
                      onChange={(e) => handleOrderFilterChange("search", e.target.value)}
                      className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="order-status">Status</Label>
                    <Select
                      value={orderFilters.status}
                      onValueChange={(value) => handleOrderFilterChange("status", value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] border-gray-300">
                        <SelectValue placeholder="Alle Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="processing">In Bearbeitung</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                        <SelectItem value="cancelled">Storniert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="order-email">E-Mail</Label>
                    <Input
                      id="order-email"
                      type="email"
                      placeholder="kunde@email.com"
                      value={orderFilters.email}
                      onChange={(e) => handleOrderFilterChange("email", e.target.value)}
                      className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setOrderFilters({ search: "", status: "all", email: "" })
                      }}
                      className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full text-sm"
                    >
                      Filter zurücksetzen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="flex flex-col gap-2">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-[#2D1206] border border-[#EBEBEB] dark:border-[#3a2010] rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Order number + payment chips */}
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-bold text-[#1A1A1A] dark:text-[#FAF7F4] text-sm truncate">{order.order_number}</span>
                    {order.payment_method && (
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] uppercase tracking-wide">
                        {(() => {
                          const m = (order.payment_method || "").toLowerCase()
                          if (m.includes("twint")) return "TWINT"
                          if (m.includes("paypal")) return "PayPal"
                          if (m === "stripe" || m.includes("stripe_card") || m.includes("card") || m.includes("stripe")) return "Kreditkarte"
                          if (m.includes("invoice") || m.includes("rechnung")) return "Auf Rechnung"
                          return order.payment_method
                        })()}
                      </span>
                    )}
                    {(() => {
                      const m = (order.payment_method || "").toLowerCase()
                      const isInvoice = m.includes("invoice") || m.includes("rechnung") || m.includes("faktura")
                      const isTwint = m.includes("twint")
                      const paid = order.payment_status === "completed"
                      if ((isInvoice || isTwint) && !paid) {
                        return <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">Offen</span>
                      }
                      if (paid) {
                        return <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Bezahlt</span>
                      }
                      return null
                    })()}
                  </div>
                  {/* Customer */}
                  <div className="sm:w-40 shrink-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-[#FAF7F4] truncate">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-xs text-gray-400 dark:text-[#A89070] truncate">{order.customer_email}</p>
                  </div>
                  {/* Total */}
                  <div className="sm:w-28 shrink-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-[#FAF7F4]">{(Number.parseFloat(order.total_amount.toString()) || 0).toFixed(2)} CHF</p>
                    <p className="text-xs text-gray-400 dark:text-[#A89070]">{formatDate(order.created_at)}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {(() => {
                      const m = (order.payment_method || "").toLowerCase()
                      const isInvoice = m.includes("invoice") || m.includes("rechnung")
                      const isTwint = m.includes("twint")
                      const notPaid = order.payment_status !== "completed"
                      if ((isInvoice || isTwint) && notPaid) {
                        return (
                          <Button
                            onClick={() => markAsPaid(order)}
                            disabled={markingPaidId === order.id}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 text-xs h-8"
                          >
                            {markingPaidId === order.id ? "..." : "✓ Bezahlt"}
                          </Button>
                        )
                      }
                      return null
                    })()}
                    <Button
                      onClick={() => showOrderDetail(order)}
                      className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-4 text-xs h-8"
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => downloadInvoicePDF(order)}
                      variant="outline"
                      className="rounded-full px-3 text-xs h-8 border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#8B5E3C]/10"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                    {(() => {
                      const m = (order.payment_method || "").toLowerCase()
                      const isInvoice = m.includes("invoice") || m.includes("rechnung")
                      const isTwint = m.includes("twint")
                      const notPaid = order.payment_status !== "completed"
                      if ((isInvoice || isTwint) && notPaid) return null
                      return (
                        <Button
                          onClick={() => setShipConfirmOrder(order)}
                          disabled={sendingShipId === order.id}
                          variant="outline"
                          className="rounded-full px-3 text-xs h-8 border-blue-400 text-blue-600 hover:bg-blue-50"
                        >
                          📦 {sendingShipId === order.id ? "..." : "Versandt"}
                        </Button>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Orders Pagination */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                onClick={() => setCurrentOrderPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentOrderPage === 1}
                className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-5 disabled:opacity-40"
              >
                ← Zurück
              </Button>
              <span className="text-sm font-semibold text-[#666] dark:text-[#D4C0A0] bg-white dark:bg-[#2D1206] border border-[#EBEBEB] dark:border-[#3a2010] rounded-full px-4 py-2 shadow-sm">
                {currentOrderPage} / {totalOrderPages}
              </span>
              <Button
                onClick={() => setCurrentOrderPage((prev) => Math.min(prev + 1, totalOrderPages))}
                disabled={currentOrderPage === totalOrderPages}
                className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-5 disabled:opacity-40"
              >
                Weiter →
              </Button>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            {/* Products Stats Cards */}
            {productStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Produkte</p>
                        <p className="text-3xl font-black text-[#1A1A1A] dark:text-[#FAF7F4] mt-1">{productStats.total_products}</p>
                      </div>
                      <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Lagerbestand</p>
                        <p className="text-3xl font-black text-[#8B5E3C] mt-1">{productStats.total_stock}</p>
                      </div>
                      <div className="w-11 h-11 bg-[#8B5E3C]/10 rounded-xl flex items-center justify-center">
                        <Package2 className="w-5 h-5 text-[#8B5E3C]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Wenig Lager</p>
                        <p className="text-3xl font-black text-yellow-600 mt-1">{productStats.low_stock}</p>
                      </div>
                      <div className="w-11 h-11 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#888] dark:text-[#A89070] text-xs font-medium uppercase tracking-wide">Ausverkauft</p>
                        <p className="text-3xl font-black text-red-500 mt-1">{productStats.out_of_stock}</p>
                      </div>
                      <div className="w-11 h-11 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Excel Import */}
            {false && <>
            <Card className="mb-6 border-dashed border-2 border-[#8B5E3C]/25 rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
                  Excel-Import (Produkte synchronisieren)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex-1 min-w-[220px] cursor-pointer">
                    <div className="flex items-center gap-2 border border-gray-300 dark:border-[#3a2010] rounded-lg px-4 py-2 bg-white dark:bg-[#2D1206] hover:bg-gray-50 dark:hover:bg-[#3a1a08] transition-colors">
                      <Upload className="w-4 h-4 text-gray-500 dark:text-[#A89070] shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-[#D4C0A0] truncate">
                        {importFile ? importFile.name : ".xlsx / .xls auswählen"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        setImportFile(e.target.files?.[0] ?? null)
                        setImportResult(null)
                      }}
                    />
                  </label>
                  <Button
                    onClick={handleExcelImport}
                    disabled={!importFile || importLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${importLoading ? "animate-spin" : ""}`} />
                    {importLoading ? "Importiere..." : "Importieren"}
                  </Button>
                </div>

                {importResult && (
                  <div className={`mt-4 rounded-lg p-3 text-sm ${importResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    {importResult.success ? (
                      <div className="space-y-1">
                        <p className="font-medium text-green-800">Import abgeschlossen ({importResult.parsed} verarbeitet)</p>
                        <div className="flex gap-4 text-green-700 flex-wrap">
                          <span>✅ Neu: <strong>{importResult.inserted}</strong></span>
                          <span>🔄 Aktualisiert: <strong>{importResult.updated}</strong></span>
                          <span>🗑 Gelöscht: <strong>{importResult.deleted ?? 0}</strong></span>
                          <span>⏭ Übersprungen: <strong>{importResult.skipped}</strong></span>
                        </div>
                        {importResult.errors && importResult.errors.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-yellow-700 font-medium">
                              {importResult.errors.length} Warnungen anzeigen
                            </summary>
                            <ul className="mt-1 space-y-0.5 text-yellow-700 text-xs">
                              {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </details>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-700 font-medium">Fehler: {importResult.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Excel Add (sin borrar) */}
            <Card className="mb-6 border-dashed border-2 border-blue-400/30 rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-500" />
                  Excel-Import (Produkte hinzufügen – nichts löschen)
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Neue Kategorien & Produkte hinzufügen, ohne bestehende zu löschen.</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex-1 min-w-[220px] cursor-pointer">
                    <div className="flex items-center gap-2 border border-gray-300 dark:border-[#3a2010] rounded-lg px-4 py-2 bg-white dark:bg-[#2D1206] hover:bg-gray-50 dark:hover:bg-[#3a1a08] transition-colors">
                      <Upload className="w-4 h-4 text-gray-500 dark:text-[#A89070] shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-[#D4C0A0] truncate">
                        {addFile ? addFile.name : ".xlsx / .xls auswählen"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        setAddFile(e.target.files?.[0] ?? null)
                        setAddResult(null)
                      }}
                    />
                  </label>
                  <Button
                    onClick={handleExcelAdd}
                    disabled={!addFile || addLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Upload className={`w-4 h-4 mr-2 ${addLoading ? "animate-bounce" : ""}`} />
                    {addLoading ? "Lädt hoch..." : "Hinzufügen"}
                  </Button>
                </div>

                {addResult && (
                  <div className={`mt-4 rounded-lg p-3 text-sm ${addResult.success ? "bg-blue-50 border border-blue-200" : "bg-red-50 border border-red-200"}`}>
                    {addResult.success ? (
                      <div className="space-y-1">
                        <p className="font-medium text-blue-800">Abgeschlossen ({addResult.parsed} verarbeitet)</p>
                        <div className="flex gap-4 text-blue-700 flex-wrap">
                          <span>✅ Neu: <strong>{addResult.inserted}</strong></span>
                          <span>🔄 Aktualisiert: <strong>{addResult.updated}</strong></span>
                          <span>⏭ Übersprungen: <strong>{addResult.skipped}</strong></span>
                          <span className="text-green-700">🛡 Gelöscht: <strong>0</strong></span>
                        </div>
                        {addResult.errors && addResult.errors.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-yellow-700 font-medium">
                              {addResult.errors.length} Warnungen anzeigen
                            </summary>
                            <ul className="mt-1 space-y-0.5 text-yellow-700 text-xs">
                              {addResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </details>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-700 font-medium">Fehler: {addResult.error}</p>
                    )}
                  </div>
                )}

                {/* Historial de importaciones */}
                {importHistory.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#A89070] uppercase tracking-wide mb-2">Importverlauf</p>
                    <div className="space-y-2">
                      {importHistory.map((batch) => (
                        <div key={batch.date} className="flex items-center justify-between bg-gray-50 dark:bg-[#2D1206] border border-gray-200 dark:border-[#3a2010] rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-[#FAF7F4] truncate">{batch.filename}</p>
                            <p className="text-xs text-gray-500 dark:text-[#A89070]">{batch.date} · {batch.count} Produkte</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingBatch === batch.date}
                            onClick={() => handleDeleteBatch(batch)}
                            className="ml-3 shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            {deletingBatch === batch.date ? "..." : "Löschen"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </>}

            {/* Products Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF7F4] tracking-tight">Produktverwaltung</h2>
              <div className="flex items-center space-x-2">
                <Button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true) }} variant="outline" className="border-[#8B5E3C]/40 text-[#8B5E3C] bg-white hover:bg-[#8B5E3C]/5 rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Kategorie
                </Button>
                <Button onClick={showAddProductModal} className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Produkt
                </Button>
              </div>
            </div>

            {/* Categories List */}
            {categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#A89070] uppercase tracking-wider mb-3">Vorhandene Kategorien</h3>
                <div className="space-y-2">
                  {categories.filter((c) => c.parent_id === null).map((parent) => {
                    const children = categories.filter((c) => c.parent_id === parent.id)
                    const parentCount = products.filter((p) => p.category === parent.slug).length
                    return (
                      <div key={parent.slug}>
                        {/* Categoría padre */}
                        <div className="flex items-center justify-between bg-white dark:bg-[#2D1206] border border-gray-200 dark:border-[#3a2010] rounded-xl px-4 py-3 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-[#FAF7F4] truncate">{parent.name}</p>
                            <p className="text-xs text-gray-400 dark:text-[#A89070]">{parentCount} Produkt{parentCount !== 1 ? "e" : ""} · {children.length} Unterkategorie{children.length !== 1 ? "n" : ""}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(parent); setIsCategoryModalOpen(true) }} className="text-blue-500 hover:text-blue-700 bg-white hover:bg-blue-50 p-1.5">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(parent)} disabled={parentCount > 0 || children.length > 0} title={parentCount > 0 ? `${parentCount} Produkte – zuerst löschen` : children.length > 0 ? "Zuerst Unterkategorien löschen" : "Löschen"} className="text-red-300 bg-white p-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {/* Subcategorías */}
                        {children.map((child) => {
                          const childCount = products.filter((p) => p.category === child.slug).length
                          return (
                            <div key={child.slug} className="flex items-center justify-between bg-gray-50 dark:bg-[#1a0b04] border border-gray-100 dark:border-[#3a2010] rounded-xl px-4 py-2.5 shadow-sm ml-6 mt-1.5 border-l-2 border-l-[#8B5E3C]/40">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-[#8B5E3C] text-xs">↳</span>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-700 dark:text-[#D4C0A0] text-sm truncate">{child.name}</p>
                                  <p className="text-xs text-gray-400 dark:text-[#A89070]">{childCount} Produkt{childCount !== 1 ? "e" : ""}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(child); setIsCategoryModalOpen(true) }} className="text-blue-500 hover:text-blue-700 bg-white hover:bg-blue-50 p-1.5">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(child)} disabled={childCount > 0} title={childCount > 0 ? `${childCount} Produkte – zuerst löschen` : "Löschen"} className="text-red-300 bg-white p-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Products Filters */}
            <div ref={filterCardRef}>
            <Card className="mb-4 rounded-2xl border-[#c8e6c9] dark:border-[#3a2010] shadow-sm bg-[#e8f5e9] dark:bg-[#1a0b04]">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Filter className="w-4 h-4 mr-2 text-[#8B5E3C]" />
                  Produktfilter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="product-search">Suchen</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="product-search"
                        placeholder="Produkte suchen..."
                        value={productFilters.search}
                        onChange={(e) => setProductFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="product-category">Kategorie</Label>
                    <Select
                      value={productFilters.category || "all"}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, category: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] border-gray-300">
                        <SelectValue placeholder="Alle Kategorien" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                        <SelectItem value="all">Alle Kategorien</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product-stock-status">Lagerstatus</Label>
                    <Select
                      value={productFilters.stock_status || "all"}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, stock_status: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] border-gray-300">
                        <SelectValue placeholder="Alle Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                        <SelectItem value="all">Alle Status</SelectItem>
                        <SelectItem value="in_stock">Auf Lager</SelectItem>
                        <SelectItem value="low_stock">Geringer Lagerbestand</SelectItem>
                        <SelectItem value="out_of_stock">Nicht vorrätig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product-sort">Sortieren nach</Label>
                    <Select
                      value={productFilters.sortBy}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Preis</SelectItem>
                        <SelectItem value="stock">Lagerbestand</SelectItem>
                        <SelectItem value="rating">Bewertung</SelectItem>
                        <SelectItem value="heat_level">Schärfegrad</SelectItem>
                        <SelectItem value="category">Kategorie</SelectItem>
                        <SelectItem value="created_at">Datum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setProductFilters({ search: "", category: "", stock_status: "", sortBy: "name" })
                      }}
                      className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full text-sm"
                    >
                      Filter zurücksetzen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>{/* end filterCardRef wrapper */}

            {/* Bulk action bar — sticky */}
            <div className="sticky top-16 z-20 bg-blue-200/95 dark:bg-[#2D1206] backdrop-blur-sm border border-blue-300 dark:border-[#3a2010] rounded-2xl px-3 py-2 mb-4 shadow-sm flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="text-sm"
              >
                {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0
                  ? "Alle abwählen"
                  : "Alle auswählen"}
              </Button>


              {selectedProductIds.size > 0 && (
                <>
                  <span className="text-sm text-gray-600 dark:text-[#D4C0A0] font-medium">
                    {selectedProductIds.size} ausgewählt
                  </span>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="w-48 bg-white dark:bg-[#1a0b04] border-gray-300 dark:border-[#3a2010] dark:text-[#FAF7F4] text-sm">
                      <SelectValue placeholder="Status ändern..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                      <SelectItem value="in_stock">Auf Lager</SelectItem>
                      <SelectItem value="low_stock">Geringer Bestand</SelectItem>
                      <SelectItem value="out_of_stock">Nicht vorrätig</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatus || bulkLoading}
                    className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white"
                  >
                    {bulkLoading ? "Speichern..." : "Anwenden"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProductIds(new Set())}
                  >
                    Abbrechen
                  </Button>
                </>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`rounded-2xl border-[#EBEBEB] dark:border-[#3a2010] shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    selectedProductIds.has(product.id) ? "ring-2 ring-[#8B5E3C] border-[#8B5E3C]" : "dark:bg-[#2D1206]"
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedProductIds.has(product.id)
                              ? "bg-[#8B5E3C] border-[#8B5E3C]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedProductIds.has(product.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <ProductImage
                          src={product.image_url}
                          candidates={product.image_url_candidates}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          onClick={() => showEditProductModal(product.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => showDeleteProductModal(product.id, product.name)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-[#FAF7F4]">{product.name}</h3>
                    <p className="text-gray-600 dark:text-[#D4C0A0] text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#8B5E3C]/10 text-[#8B5E3C]">{getCategoryDisplay(product.category)}</Badge>
                        <span className="font-bold text-lg text-gray-800 dark:text-[#FAF7F4]">
                          {Number.parseFloat(product.price.toString()).toFixed(2)} CHF
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStockStatusColor(product.stock_status)}>
                            {getStockStatusText(product.stock_status)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700 dark:text-[#D4C0A0]">
                            Lager: {product.stock}
                          </span>
                        </div>
                      </div>


                      {product.badge && (
                        <Badge variant="outline" className="text-xs">
                          {product.badge}
                        </Badge>
                      )}

                      {product.supplier && <p className="text-xs text-gray-500 dark:text-[#A89070]">Lieferant: {product.supplier}</p>}
                      {product.origin && <p className="text-xs text-gray-500 dark:text-[#A89070]">Hersteller: {product.origin}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 dark:text-[#A89070] mx-auto mb-4" />
                <p className="text-gray-600 dark:text-[#D4C0A0] text-lg">Keine Produkte gefunden</p>
              </div>
            )}
          </TabsContent>

          {/* ── Blog Tab ── */}
          <TabsContent value="blog">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF7F4]">Blog</h2>
                <p className="text-sm text-[#888] dark:text-[#A89070] mt-0.5">{blogPosts.length} Beiträge</p>
              </div>
              <Button onClick={() => openBlogModal()} className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> Neuer Beitrag
              </Button>
            </div>

            {blogLoading && (
              <div className="space-y-4">
                {[0,1,2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-[#2D1206] rounded-2xl animate-pulse" />)}
              </div>
            )}

            {!blogLoading && blogPosts.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-[#A89070] mx-auto mb-4" />
                <p className="text-gray-500 dark:text-[#A89070]">Noch keine Beiträge. Erstelle den ersten!</p>
              </div>
            )}

            <div className="space-y-4">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-[#2D1206] rounded-2xl border border-[#EBEBEB] dark:border-[#3a2010] shadow-sm overflow-hidden flex gap-0">
                  {post.hero_image_url && (
                    <div className="w-28 sm:w-40 flex-shrink-0 bg-[#F0F0F0] dark:bg-[#1a0b04]">
                      <img src={post.hero_image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#AAA] font-semibold mb-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString("de-CH")}
                      </div>
                      <h3 className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] truncate">{post.title}</h3>
                      <p className="text-xs text-[#888] dark:text-[#A89070] line-clamp-2 mt-1 leading-relaxed">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openBlogModal(post)} className="gap-1.5 rounded-xl text-xs h-8">
                        <Edit className="w-3.5 h-3.5" /> Bearbeiten
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteBlogId(post.id)} className="gap-1.5 rounded-xl text-xs h-8 border-red-200 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" /> Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Gallery Tab ── */}
          <TabsContent value="gallery">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF7F4]">Galerie</h2>
                <p className="text-sm text-[#888] dark:text-[#A89070] mt-0.5">{galleryImages.length} Bilder</p>
              </div>
              <Button onClick={openGalleryModal} className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> Bild hinzufügen
              </Button>
            </div>

            {galleryLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[0,1,2,3,4,5,6,7].map(i => <div key={i} className="aspect-square bg-gray-100 dark:bg-[#2D1206] rounded-2xl animate-pulse" />)}
              </div>
            )}

            {!galleryLoading && galleryImages.length === 0 && (
              <div className="text-center py-20">
                <Images className="w-16 h-16 text-gray-300 dark:text-[#A89070] mx-auto mb-4" />
                <p className="text-gray-500 dark:text-[#A89070]">Noch keine Bilder. Füge das erste hinzu!</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map(img => (
                <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-[#EBEBEB] dark:border-[#3a2010] shadow-sm bg-[#F5F5F5] dark:bg-[#2D1206]">
                  <img src={img.image_url} alt={img.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-semibold truncate">{img.title}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setDeleteGalleryId(img.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-[#8B5E3C] rounded-full" />
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-[#FAF7F4]">Zahlungseinstellungen</h2>
                  <p className="text-sm text-[#888] dark:text-[#A89070]">API-Schlüssel und Konten für Zahlungsmethoden</p>
                </div>
              </div>

              {/* PayPal */}
              <Card className={`rounded-2xl shadow-sm transition-all ${paySettings.enable_paypal ? "border-blue-300" : "border-[#EBEBEB] opacity-75"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2"><span className="text-xl">💳</span> PayPal</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-[#888]">{paySettings.enable_paypal ? "Aktiv" : "Deaktiviert"}</span>
                      <Switch checked={paySettings.enable_paypal} onCheckedChange={v => setPaySettings(p => ({ ...p, enable_paypal: v }))} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="paypal_email">PayPal E-Mail (Empfänger)</Label>
                    <Input
                      id="paypal_email"
                      type="email"
                      placeholder="shop@example.com"
                      value={paySettings.paypal_email}
                      onChange={e => setPaySettings(p => ({ ...p, paypal_email: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                      disabled={!paySettings.enable_paypal}
                    />
                    <p className="text-xs text-[#999] mt-1">E-Mail des PayPal-Kontos, das Zahlungen empfängt</p>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe */}
              <Card className={`rounded-2xl shadow-sm transition-all ${paySettings.enable_stripe ? "border-purple-300" : "border-[#EBEBEB] opacity-75"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2"><span className="text-xl">💜</span> Stripe (Kreditkarte)</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-[#888]">{paySettings.enable_stripe ? "Aktiv" : "Deaktiviert"}</span>
                      <Switch checked={paySettings.enable_stripe} onCheckedChange={v => setPaySettings(p => ({ ...p, enable_stripe: v }))} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="stripe_pub">Publishable Key (pk_...)</Label>
                    <Input id="stripe_pub" placeholder="pk_live_..." value={paySettings.stripe_publishable_key}
                      onChange={e => setPaySettings(p => ({ ...p, stripe_publishable_key: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] font-mono text-sm" disabled={!paySettings.enable_stripe} />
                  </div>
                  <div>
                    <Label htmlFor="stripe_sec">Secret Key (sk_...)</Label>
                    <Input id="stripe_sec" type="password" placeholder="sk_live_..." value={paySettings.stripe_secret_key}
                      onChange={e => setPaySettings(p => ({ ...p, stripe_secret_key: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] font-mono text-sm" disabled={!paySettings.enable_stripe} />
                  </div>
                  <div>
                    <Label htmlFor="stripe_wh">Webhook Secret (whsec_...)</Label>
                    <Input id="stripe_wh" type="password" placeholder="whsec_..." value={paySettings.stripe_webhook_secret}
                      onChange={e => setPaySettings(p => ({ ...p, stripe_webhook_secret: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] font-mono text-sm" disabled={!paySettings.enable_stripe} />
                    <p className="text-xs text-[#999] mt-1">Zu finden im Stripe Dashboard → Webhooks</p>
                  </div>
                </CardContent>
              </Card>

              {/* TWINT */}
              <Card className={`rounded-2xl shadow-sm transition-all ${paySettings.enable_twint ? "border-gray-700" : "border-[#EBEBEB] opacity-75"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2"><span className="text-xl">📱</span> TWINT</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-[#888]">{paySettings.enable_twint ? "Aktiv" : "Deaktiviert"}</span>
                      <Switch checked={paySettings.enable_twint} onCheckedChange={v => setPaySettings(p => ({ ...p, enable_twint: v }))} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="twint_phone">TWINT Telefonnummer</Label>
                    <Input id="twint_phone" placeholder="+41 79 123 45 67" value={paySettings.twint_phone}
                      onChange={e => setPaySettings(p => ({ ...p, twint_phone: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]" disabled={!paySettings.enable_twint} />
                    <p className="text-xs text-[#999] mt-1">Diese Nummer wird dem Kunden beim Checkout angezeigt</p>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice / Vorkasse */}
              <Card className={`rounded-2xl shadow-sm transition-all ${paySettings.enable_invoice ? "border-green-300" : "border-[#EBEBEB] opacity-75"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2"><span className="text-xl">📄</span> Rechnung / Vorkasse</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-[#888]">{paySettings.enable_invoice ? "Aktiv" : "Deaktiviert"}</span>
                      <Switch checked={paySettings.enable_invoice} onCheckedChange={v => setPaySettings(p => ({ ...p, enable_invoice: v }))} />
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Bank Transfer */}
              <Card className="rounded-2xl border-[#EBEBEB] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-xl">🏦</span> Banküberweisung / Vorkasse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="bank_holder">Kontoinhaber</Label>
                    <Input
                      id="bank_holder"
                      placeholder="Max Mustermann / Firmenname"
                      value={paySettings.bank_holder}
                      onChange={e => setPaySettings(p => ({ ...p, bank_holder: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank</Label>
                    <Input
                      id="bank_name"
                      placeholder="Raiffeisen / PostFinance / UBS …"
                      value={paySettings.bank_name}
                      onChange={e => setPaySettings(p => ({ ...p, bank_name: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_iban">IBAN</Label>
                    <Input
                      id="bank_iban"
                      placeholder="CH56 0483 5012 3456 7800 9"
                      value={paySettings.bank_iban}
                      onChange={e => setPaySettings(p => ({ ...p, bank_iban: e.target.value }))}
                      className="mt-1 bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] font-mono"
                    />
                    <p className="text-xs text-[#999] mt-1">Wird dem Kunden bei Kauf auf Rechnung / Vorkasse angezeigt</p>
                  </div>
                </CardContent>
              </Card>

              {/* Save button */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={savePaymentSettings}
                  disabled={isSavingSettings}
                  className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white font-bold px-8 py-2.5 rounded-xl flex items-center gap-2"
                >
                  {isSavingSettings ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Speichern…</>
                  ) : (
                    <><Save className="w-4 h-4" /> Einstellungen speichern</>
                  )}
                </Button>
                {settingsSavedMsg && (
                  <span className="text-sm font-semibold">{settingsSavedMsg}</span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Versand Tab ── */}
          <TabsContent value="versand">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-[#8B5E3C] rounded-full" />
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-[#FAF7F4]">Versandkosten</h2>
                  <p className="text-sm text-[#888] dark:text-[#A89070]">Preis pro Zone und Gewicht in CHF. 0 = kostenlos.</p>
                </div>
              </div>

              {shippingLoading ? (
                <div className="text-center py-12 text-[#888]">Laden...</div>
              ) : shippingZones.length === 0 || shippingRanges.length === 0 ? (
                <div className="text-center py-12 text-[#888]">Keine Daten. Seite neu laden.</div>
              ) : (
                <>
                  {shippingZones.map((zone, i) => (
                    <Card key={zone.id} className={`rounded-2xl shadow-sm transition-all ${zone.enabled ? "border-[#2C5F2E]/40" : "border-[#EBEBEB] opacity-50"}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <span>📦</span>
                            <span>{zone.name}</span>
                            <span className="text-xs font-normal text-[#999] font-mono">{zone.countries === "*" ? "Alle anderen Länder" : zone.countries}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#888]">{zone.enabled ? "Aktiv" : "Deaktiviert"}</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={zone.enabled}
                              onClick={async () => {
                                const newEnabled = !zone.enabled
                                setShippingZones(prev => prev.map((z, j) => j === i ? { ...z, enabled: newEnabled } : z))
                                try {
                                  await fetch(`${API_BASE}/toggle_shipping_zone.php`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: zone.id, enabled: newEnabled }),
                                  })
                                } catch (e) {
                                  setShippingZones(prev => prev.map((z, j) => j === i ? { ...z, enabled: !newEnabled } : z))
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                zone.enabled ? "bg-[#2C5F2E]" : "bg-[#ccc]"
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                zone.enabled ? "translate-x-6" : "translate-x-1"
                              }`} />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      {zone.enabled && (
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {shippingRanges.map(range => (
                              <div key={range.id} className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#555] dark:text-[#D4C0A0]">{range.label}</label>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number" step="0.01" min="0"
                                    value={getRate(zone.id, range.id)}
                                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] text-sm"
                                    onChange={e => setRate(zone.id, range.id, parseFloat(e.target.value) || 0)}
                                  />
                                  <span className="text-xs text-[#888] dark:text-[#A89070] whitespace-nowrap">CHF</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={saveShippingSettings}
                      disabled={isSavingShipping}
                      className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-6"
                    >
                      {isSavingShipping ? "Speichern..." : <><Save className="w-4 h-4 mr-2" /> Speichern</>}
                    </Button>
                    {shippingSavedMsg && <span className="text-sm font-semibold">{shippingSavedMsg}</span>}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ── Anzeigen (Announcements) Tab ── */}
          <TabsContent value="anuncios">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF7F4]">Anzeigen & Aktionen</h2>
                <p className="text-sm text-[#888] dark:text-[#A89070] mt-0.5">Anzeigen verwalten, die beim Öffnen der Website erscheinen</p>
              </div>
              <Button onClick={() => openAnnModal()} className="bg-[#8B5E3C] hover:bg-[#6B4A2F] text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                Neue Anzeige
              </Button>
            </div>

            {annLoading ? (
              <div className="text-center py-16 text-[#888]">Laden...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-10 h-10 text-[#DDD] mx-auto mb-3" />
                <p className="text-[#888] font-medium">Keine Anzeigen vorhanden</p>
                <p className="text-sm text-[#BBB] mt-1">Erstelle deine erste Anzeige oder Aktion</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white dark:bg-[#2D1206] border border-[#EBEBEB] dark:border-[#3a2010] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${ann.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {ann.type === 'product' ? 'Produkt' : 'Allgemein'}
                      </div>
                      {ann.image1_url && (
                        <img src={ann.image1_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#EBEBEB]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1A1A] dark:text-[#FAF7F4] truncate">{ann.title}</p>
                        <p className="text-xs text-[#888] dark:text-[#A89070] mt-0.5">
                          {ann.subtitle && <span className="mr-2">{ann.subtitle}</span>}
                          {ann.show_once && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium">Einmalig</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${ann.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {ann.is_active ? 'AKTIV' : 'INAKTIV'}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAnnouncement(ann.id)}
                        disabled={togglingAnnId === ann.id}
                        className={`rounded-xl text-xs h-8 ${ann.is_active ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                      >
                        {togglingAnnId === ann.id ? '...' : ann.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openAnnModal(ann)} className="rounded-xl text-xs h-8 gap-1">
                        <Edit className="w-3 h-3" /> Bearbeiten
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteAnnId(ann.id)} className="rounded-xl text-xs h-8 border-red-200 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Package className="w-6 h-6 text-gray-600" />
                  <span>{selectedOrder.order_number}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Kundeninformationen</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span> {selectedOrder.customer_first_name}{" "}
                      {selectedOrder.customer_last_name}
                    </p>
                    <p>
                      <span className="font-medium">E-Mail:</span> {selectedOrder.customer_email}
                    </p>
                    <p>
                      <span className="font-medium">Telefon:</span> {selectedOrder.customer_phone}
                    </p>
                    <p>
                      <span className="font-medium">Adresse:</span> {selectedOrder.customer_address}
                    </p>
                    <p>
                      <span className="font-medium">Stadt:</span> {selectedOrder.customer_city}
                    </p>
                    <p>
                      <span className="font-medium">Postleitzahl:</span> {selectedOrder.customer_postal_code}
                    </p>
                    <p>
                      <span className="font-medium">Kanton:</span> {selectedOrder.customer_canton}
                    </p>
                    {selectedOrder.customer_notes && (
                      <p>
                        <span className="font-medium">Notizen:</span> {selectedOrder.customer_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Bestellinformationen</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Gesamt:</span>{" "}
                      {(Number.parseFloat(selectedOrder.total_amount.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p>
                      <span className="font-medium">Versandkosten:</span>{" "}
                      {(Number.parseFloat(selectedOrder.shipping_cost.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Zahlungsmethode:</span>
                      {getPaymentChip(selectedOrder.payment_method, selectedOrder.payment_status)}
                    </div>
                    <p>
                      <span className="font-medium">Erstellungsdatum:</span> {formatDate(selectedOrder.created_at)}
                    </p>
                    <p>
                      <span className="font-medium">Letzte Aktualisierung:</span> {formatDate(selectedOrder.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-lg mb-3">Bestellpositionen</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <Card key={item.product_id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-[#D4C0A0]">
                              <span>{item.quantity}x</span>
                              <span>{Number.parseFloat(item.price.toString()).toFixed(2)} CHF</span>
                              <span className="font-semibold text-[#8B5E3C]">
                                {Number.parseFloat(item.subtotal.toString()).toFixed(2)} CHF
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t dark:border-[#3a2010] mt-4">
                <Button
                  onClick={() => downloadInvoicePDF(selectedOrder)}
                  className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-5 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Rechnung als PDF herunterladen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Product Add/Edit Modal */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="left-0 top-0 translate-x-0 translate-y-0 w-full max-w-full h-full max-h-full rounded-none flex flex-col overflow-hidden p-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-2xl sm:h-auto sm:max-h-[80vh] sm:rounded-lg bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#3a2010] shrink-0">
              <DialogTitle>{currentEditingProduct ? "Produkt bearbeiten" : "Produkt hinzufügen"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleProductSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white dark:bg-[#1a0b04]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Produktname *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={currentEditingProduct?.name || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preis (CHF) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={currentEditingProduct?.price || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight_kg">Gewicht (kg)</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    step="0.001"
                    min="0"
                    defaultValue={currentEditingProduct?.weight_kg ?? "0.500"}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                    placeholder="z.B. 0.350"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={currentEditingProduct?.description || ""}
                  className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select name="category" defaultValue={currentEditingProduct?.category || ""} required>
                    <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] border-gray-300">
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                      {categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Lagerbestand *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue={currentEditingProduct?.stock || "0"}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
            
                </div>
                <div>
                  <Label htmlFor="rating">Bewertung (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    defaultValue={currentEditingProduct?.rating || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    name="badge"
                    placeholder="z.B. Neue, Aktion"
                    defaultValue={currentEditingProduct?.badge || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
                <div>
                  <Label htmlFor="origin">Hersteller</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="z.B. Pohl Force, Walther"
                    defaultValue={currentEditingProduct?.origin || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Lieferant</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    placeholder="z.B. Airsoft, Böker"
                    defaultValue={currentEditingProduct?.supplier || ""}
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                  />
                </div>
              </div>

              <div>
                <Label>Produktbilder</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`image_${index}`}>Bild {index + 1}</Label>
                      <Input
                        id={`image_${index}`}
                        name={`image_${index}`}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange(index)}
                        className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]"
                      />
                      {imagePreviews[index] && (
                        <div className="relative">
                          <img
                            src={imagePreviews[index] || "/placeholder.svg"}
                            alt={`Vorschau ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              const newPreviews = [...imagePreviews]
                              newPreviews[index] = null
                              setImagePreviews(newPreviews)
                              if (currentEditingProduct) {
                                const newRemoved = [...removedImages]
                                newRemoved[index] = true
                                setRemovedImages(newRemoved)
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-[#3a2010] bg-white dark:bg-[#1a0b04] shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)} className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#D4C0A0] text-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a1a08]">
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-6">
                  {currentEditingProduct ? "Aktualisieren" : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Create/Edit Modal */}
        {/* Modal filtro rápido de categoría */}
        <Dialog open={showCategoryFilterModal} onOpenChange={setShowCategoryFilterModal}>
          <DialogContent className="sm:max-w-xs rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Filter className="w-4 h-4 text-blue-600" />
                Kategorie auswählen
              </DialogTitle>
            </DialogHeader>
            <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
              <button
                onClick={() => { setProductFilters(prev => ({ ...prev, category: "" })); setShowCategoryFilterModal(false) }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  !productFilters.category ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                Alle Kategorien
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setProductFilters(prev => ({ ...prev, category: cat.slug })); setShowCategoryFilterModal(false) }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    productFilters.category === cat.slug ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCategoryModalOpen} onOpenChange={(open) => { setIsCategoryModalOpen(open); if (!open) setEditingCategory(null) }}>
          <DialogContent className="left-0 top-0 translate-x-0 translate-y-0 w-full max-w-full h-full max-h-full rounded-none flex flex-col overflow-hidden p-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-md sm:h-auto sm:max-h-[80vh] sm:rounded-lg bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#3a2010] shrink-0">
              <DialogTitle>{editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <Label htmlFor="cat-name" className="text-sm font-medium">Name *</Label>
                  <Input
                    id="cat-name"
                    name="name"
                    required
                    defaultValue={editingCategory?.name || ""}
                    key={editingCategory?.id ?? "new"}
                    placeholder="z.B. Rubs & Gewürze"
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] h-12 text-base sm:h-10 sm:text-sm mt-1"
                  />
                  {!editingCategory && (
                    <p className="text-xs text-gray-400 mt-1">Der Slug wird automatisch generiert</p>
                  )}
                  {editingCategory && (
                    <p className="text-xs text-gray-400 mt-1">Slug: <span className="font-mono">{editingCategory.slug}</span> (wird nicht geändert)</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cat-parent" className="text-sm font-medium">Übergeordnete Kategorie</Label>
                  <Select
                    name="parent_id"
                    key={(editingCategory?.id ?? "new") + "-parent"}
                    defaultValue={editingCategory?.parent_id?.toString() ?? "none"}
                  >
                    <SelectTrigger className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] h-12 text-base sm:h-10 sm:text-sm mt-1">
                      <SelectValue placeholder="Keine (Hauptkategorie)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010]">
                      <SelectItem value="none">Keine (Hauptkategorie)</SelectItem>
                      {categories
                        .filter((c) => c.parent_id === null && c.id !== editingCategory?.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cat-description" className="text-sm font-medium">Beschreibung</Label>
                  <Textarea
                    id="cat-description"
                    name="description"
                    rows={4}
                    defaultValue={editingCategory?.description || ""}
                    key={(editingCategory?.id ?? "new") + "-desc"}
                    placeholder="Kurze Beschreibung der Kategorie..."
                    className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] text-base sm:text-sm mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-[#3a2010] bg-white dark:bg-[#1a0b04] shrink-0">
                <Button type="button" variant="outline" onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null) }} className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#D4C0A0] text-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a1a08]">
                  Abbrechen
                </Button>
                <Button type="submit" className="bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-full px-6">
                  {editingCategory ? "Speichern" : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Product Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader>
              <DialogTitle>Löschen bestätigen</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-600 dark:text-[#D4C0A0]">
                Sind Sie sicher, dass Sie dieses Produkt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="bg-white dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#D4C0A0] text-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a1a08]">
                Abbrechen
              </Button>
              <Button onClick={confirmDeleteProduct} className="bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Blog Post Modal ── */}
        <Dialog open={isBlogModalOpen} onOpenChange={open => { setIsBlogModalOpen(open); if (!open) setCurrentEditingPost(null) }}>
          <DialogContent className="left-0 top-0 translate-x-0 translate-y-0 w-full max-w-full h-full max-h-full rounded-none flex flex-col overflow-hidden p-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-lg bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#3a2010] shrink-0">
              <DialogTitle>{currentEditingPost ? "Beitrag bearbeiten" : "Neuer Beitrag"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Titel *</Label>
                <Input value={blogForm.title} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} placeholder="Beitragstitel..." className="rounded-xl h-12 text-base sm:h-10 sm:text-sm" />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Inhalt *</Label>
                <Textarea value={blogForm.content} onChange={e => setBlogForm(f => ({ ...f, content: e.target.value }))} placeholder="Schreibe deinen Beitrag hier..." rows={8} className="rounded-xl resize-none text-base sm:text-sm" />
              </div>

              {/* Images */}
              {["Hero-Bild", "Bild 2", "Bild 3", "Bild 4"].map((label, i) => (
                <div key={i}>
                  <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> {label}
                  </Label>

                  {/* Current preview */}
                  {(blogImagePreviews[i] && !blogRemovedImages[i]) ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#E5E5E5] mb-2">
                      <img src={blogImagePreviews[i]!} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const r = [...blogRemovedImages]; r[i] = true; setBlogRemovedImages(r)
                          const p = [...blogImagePreviews]; p[i] = null; setBlogImagePreviews(p)
                          const f = [...blogImageFiles]; f[i] = null; setBlogImageFiles(f)
                          const u = [...blogImageUrls]; u[i] = ""; setBlogImageUrls(u)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      ><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Upload file */}
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-[#D5D5D5] dark:border-[#3a2010] rounded-xl cursor-pointer hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition-colors">
                        <Upload className="w-4 h-4 text-[#AAA] dark:text-[#A89070] mb-1" />
                        <span className="text-[11px] text-[#AAA] dark:text-[#A89070]">Datei hochladen</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0]; if (!file) return
                          const files = [...blogImageFiles]; files[i] = file; setBlogImageFiles(files)
                          const previews = [...blogImagePreviews]; previews[i] = URL.createObjectURL(file); setBlogImagePreviews(previews)
                          const r = [...blogRemovedImages]; r[i] = false; setBlogRemovedImages(r)
                          const u = [...blogImageUrls]; u[i] = ""; setBlogImageUrls(u)
                        }} />
                      </label>
                      {/* URL input */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={blogImageUrls[i]}
                          onChange={e => {
                            const u = [...blogImageUrls]; u[i] = e.target.value; setBlogImageUrls(u)
                            if (e.target.value) {
                              const p = [...blogImagePreviews]; p[i] = e.target.value; setBlogImagePreviews(p)
                              const f = [...blogImageFiles]; f[i] = null; setBlogImageFiles(f)
                            }
                          }}
                          className="h-20 text-xs px-3 border border-[#D5D5D5] dark:border-[#3a2010] dark:bg-[#2D1206] dark:text-[#FAF7F4] dark:placeholder-[#A89070] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] placeholder-[#CCC]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#3a2010] bg-white dark:bg-[#1a0b04] shrink-0">
              <Button onClick={saveBlogPost} disabled={blogSaving} className="flex-1 bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-xl">
                {blogSaving ? "Speichern..." : currentEditingPost ? "Aktualisieren" : "Veröffentlichen"}
              </Button>
              <Button variant="outline" onClick={() => setIsBlogModalOpen(false)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Blog Delete Confirm ── */}
        <Dialog open={!!deleteBlogId} onOpenChange={open => { if (!open) setDeleteBlogId(null) }}>
          <DialogContent className="max-w-sm bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader><DialogTitle>Beitrag löschen?</DialogTitle></DialogHeader>
            <p className="text-sm text-[#666] dark:text-[#D4C0A0]">Dieser Beitrag wird dauerhaft gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="destructive" onClick={() => deleteBlogId && deleteBlogPost(deleteBlogId)} className="flex-1 rounded-xl">Löschen</Button>
              <Button variant="outline" onClick={() => setDeleteBlogId(null)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Gallery Add Modal ── */}
        <Dialog open={isGalleryModalOpen} onOpenChange={open => { setIsGalleryModalOpen(open) }}>
          <DialogContent className="left-0 top-0 translate-x-0 translate-y-0 w-full max-w-full h-full max-h-full rounded-none flex flex-col overflow-hidden p-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-md sm:h-auto sm:max-h-[85vh] sm:rounded-lg bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#3a2010] shrink-0">
              <DialogTitle>Bild hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Titel (optional)</Label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ title: e.target.value })}
                  placeholder="z.B. Ledertasche handgemacht..."
                  className="w-full h-12 px-3 border border-[#D5D5D5] dark:border-[#3a2010] dark:bg-[#2D1206] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070] rounded-xl text-base sm:h-10 sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Bild *
                </Label>

                {galleryImagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#E5E5E5] mb-2">
                    <img src={galleryImagePreview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setGalleryImageFile(null); setGalleryImageUrl(""); setGalleryImagePreview(null) }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    ><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#D5D5D5] rounded-xl cursor-pointer hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition-colors">
                      <Upload className="w-5 h-5 text-[#AAA] mb-1" />
                      <span className="text-[11px] text-[#AAA]">Datei hochladen</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0]; if (!file) return
                        setGalleryImageFile(file)
                        setGalleryImagePreview(URL.createObjectURL(file))
                        setGalleryImageUrl("")
                      }} />
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={galleryImageUrl}
                      onChange={e => {
                        setGalleryImageUrl(e.target.value)
                        if (e.target.value) { setGalleryImagePreview(e.target.value); setGalleryImageFile(null) }
                        else setGalleryImagePreview(null)
                      }}
                      className="h-32 text-xs px-3 border border-[#D5D5D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] placeholder-[#CCC]"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#3a2010] bg-white dark:bg-[#1a0b04] shrink-0">
              <Button onClick={saveGalleryImage} disabled={gallerySaving} className="flex-1 bg-[#8B5E3C] hover:bg-[#6B4226] text-white rounded-xl">
                {gallerySaving ? "Speichern..." : "Hinzufügen"}
              </Button>
              <Button variant="outline" onClick={() => setIsGalleryModalOpen(false)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Gallery Delete Confirm ── */}
        <Dialog open={!!deleteGalleryId} onOpenChange={open => { if (!open) setDeleteGalleryId(null) }}>
          <DialogContent className="max-w-sm bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader><DialogTitle>Bild löschen?</DialogTitle></DialogHeader>
            <p className="text-sm text-[#666] dark:text-[#D4C0A0]">Dieses Bild wird dauerhaft gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="destructive" onClick={() => deleteGalleryId && deleteGalleryImage(deleteGalleryId)} className="flex-1 rounded-xl">Löschen</Button>
              <Button variant="outline" onClick={() => setDeleteGalleryId(null)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Announcement Create/Edit Modal ── */}
        <Dialog open={isAnnModalOpen} onOpenChange={open => { setIsAnnModalOpen(open); if (!open) setEditingAnn(null) }}>
          <DialogContent className="max-w-lg bg-white dark:bg-[#1a0b04] dark:border-[#3a2010] max-h-[90vh] overflow-y-auto" onInteractOutside={e => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingAnn ? "Anzeige bearbeiten" : "Neue Anzeige erstellen"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div>
                <Label className="text-sm font-semibold mb-2 block dark:text-[#FAF7F4]">Typ</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['general', 'product'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAnnForm(f => ({ ...f, type: t }))}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold flex flex-col items-center gap-1.5 transition-all ${annForm.type === t ? 'border-[#8B5E3C] bg-[#8B5E3C]/5 text-[#8B5E3C]' : 'border-[#E5E5E5] dark:border-[#3a2010] text-[#888] dark:text-[#A89070] hover:border-[#CCC] dark:hover:border-[#5a3020]'}`}
                    >
                      {t === 'general' ? <Bell className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      {t === 'general' ? 'Allgemeine Anzeige' : 'Produktaktion'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block dark:text-[#FAF7F4]">Titel *</Label>
                <Input value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} placeholder={annForm.type === 'product' ? "z.B. NEU: Habanero Gold Sauce" : "z.B. Sommerferien – wir sind zurück!"} className="rounded-xl dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]" />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block dark:text-[#FAF7F4]">Untertitel (optional)</Label>
                <Textarea value={annForm.subtitle} onChange={e => setAnnForm(f => ({ ...f, subtitle: e.target.value }))} placeholder={annForm.type === 'product' ? "z.B. Jetzt 10% Rabatt sichern – nur für kurze Zeit!" : "z.B. Wir sind wieder da mit neuen heissen Produkten."} className="rounded-xl resize-none dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]" rows={3} />
              </div>

              {annForm.type === 'product' && (
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block dark:text-[#FAF7F4]">Produkt-URL</Label>
                  <Input value={annForm.product_url} onChange={e => setAnnForm(f => ({ ...f, product_url: e.target.value }))} placeholder="https://..." className="rounded-xl dark:bg-[#2D1206] dark:border-[#3a2010] dark:text-[#FAF7F4] dark:placeholder:text-[#A89070]" />
                  <p className="text-xs text-[#AAA] dark:text-[#A89070] mt-1">Wird als «Produkt ansehen»-Button angezeigt</p>
                </div>
              )}

              {(annForm.type === 'general' ? [0, 1] : [0]).map(i => (
                <div key={i}>
                  <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5 block dark:text-[#FAF7F4]">
                    <ImageIcon className="w-3.5 h-3.5" /> {i === 0 ? 'Bild 1' : 'Bild 2'} {i === 0 && annForm.type === 'product' ? '' : '(optional)'}
                  </Label>
                  {(annImagePreviews[i] && !annRemovedImages[i]) ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-[#3a2010]">
                      <img src={annImagePreviews[i]!} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const r: [boolean,boolean] = [...annRemovedImages] as [boolean,boolean]; r[i] = true; setAnnRemovedImages(r)
                          const p: [string|null,string|null] = [...annImagePreviews] as [string|null,string|null]; p[i] = null; setAnnImagePreviews(p)
                          const f: [File|null,File|null] = [...annImageFiles] as [File|null,File|null]; f[i] = null; setAnnImageFiles(f)
                          const u: [string,string] = [...annImageUrls] as [string,string]; u[i] = ""; setAnnImageUrls(u)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      ><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-[#D5D5D5] dark:border-[#3a2010] rounded-xl cursor-pointer hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition-colors">
                        <Upload className="w-4 h-4 text-[#AAA] dark:text-[#A89070] mb-1" />
                        <span className="text-[11px] text-[#AAA] dark:text-[#A89070]">Datei hochladen</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0]; if (!file) return
                          const files: [File|null,File|null] = [...annImageFiles] as [File|null,File|null]; files[i] = file; setAnnImageFiles(files)
                          const previews: [string|null,string|null] = [...annImagePreviews] as [string|null,string|null]; previews[i] = URL.createObjectURL(file); setAnnImagePreviews(previews)
                          const r: [boolean,boolean] = [...annRemovedImages] as [boolean,boolean]; r[i] = false; setAnnRemovedImages(r)
                          const u: [string,string] = [...annImageUrls] as [string,string]; u[i] = ""; setAnnImageUrls(u)
                        }} />
                      </label>
                      <div className="flex flex-col gap-1">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={annImageUrls[i]}
                          onChange={e => {
                            const u: [string,string] = [...annImageUrls] as [string,string]; u[i] = e.target.value; setAnnImageUrls(u)
                            if (e.target.value) {
                              const p: [string|null,string|null] = [...annImagePreviews] as [string|null,string|null]; p[i] = e.target.value; setAnnImagePreviews(p)
                              const f: [File|null,File|null] = [...annImageFiles] as [File|null,File|null]; f[i] = null; setAnnImageFiles(f)
                            }
                          }}
                          className="h-20 text-xs px-3 border border-[#D5D5D5] dark:border-[#3a2010] dark:bg-[#2D1206] dark:text-[#FAF7F4] dark:placeholder-[#A89070] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] placeholder-[#CCC]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#E5E5E5] dark:border-[#3a2010] hover:border-[#CCC] dark:hover:border-[#5a3020] transition-colors">
                <input
                  type="checkbox"
                  checked={annForm.show_once}
                  onChange={e => setAnnForm(f => ({ ...f, show_once: e.target.checked }))}
                  className="w-4 h-4 accent-[#8B5E3C]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF7F4]">Nur einmal anzeigen</p>
                  <p className="text-xs text-[#888] dark:text-[#A89070]">Nutzer sehen die Anzeige nur beim ersten Besuch</p>
                </div>
              </label>

              <div className="flex gap-3 pt-1">
                <Button onClick={saveAnnouncement} disabled={annSaving} className="flex-1 bg-[#8B5E3C] hover:bg-[#6B4A2F] text-white rounded-xl">
                  {annSaving ? "Speichern..." : editingAnn ? "Aktualisieren" : "Erstellen"}
                </Button>
                <Button variant="outline" onClick={() => setIsAnnModalOpen(false)} className="rounded-xl">Abbrechen</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Ship Confirm ── */}
        <Dialog open={!!shipConfirmOrder} onOpenChange={open => { if (!open) setShipConfirmOrder(null) }}>
          <DialogContent className="max-w-sm bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader><DialogTitle>📦 Versandbestätigung senden?</DialogTitle></DialogHeader>
            <p className="text-sm text-[#666] dark:text-[#D4C0A0]">
              Es wird eine E-Mail an <span className="font-semibold text-[#1A1A1A] dark:text-[#FAF7F4]">{shipConfirmOrder?.customer_email}</span> gesendet, um zu bestätigen, dass die Bestellung auf dem Weg ist.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => { if (shipConfirmOrder) { sendShippingNotification(shipConfirmOrder); setShipConfirmOrder(null) } }}
                className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
              >
                Ja, senden
              </Button>
              <Button variant="outline" onClick={() => setShipConfirmOrder(null)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Announcement Delete Confirm ── */}
        <Dialog open={!!deleteAnnId} onOpenChange={open => { if (!open) setDeleteAnnId(null) }}>
          <DialogContent className="max-w-sm bg-white dark:bg-[#1a0b04] dark:border-[#3a2010]">
            <DialogHeader><DialogTitle>Anzeige löschen?</DialogTitle></DialogHeader>
            <p className="text-sm text-[#666] dark:text-[#D4C0A0]">Diese Anzeige wird dauerhaft gelöscht.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="destructive" onClick={() => deleteAnnId && deleteAnnouncement(deleteAnnId)} className="flex-1 rounded-xl">Löschen</Button>
              <Button variant="outline" onClick={() => setDeleteAnnId(null)} className="rounded-xl">Abbrechen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
