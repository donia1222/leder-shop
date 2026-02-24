"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  X,
  AlertTriangle,
  Package2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Interfaces para Orders
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

// Interfaces para Products
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
  image_url: string
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

interface AdminProps {
  onClose: () => void
}

export default function AdminPage() {
  return <Admin onClose={() => window.history.back()} />
}

export function Admin({ onClose }: AdminProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("orders")

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [totalOrderPages, setTotalOrderPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

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
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Filtros Orders
  const [orderFilters, setOrderFilters] = useState({
    search: "",
    status: "all",
    email: "",
  })

  // Filtros Products
  const [productFilters, setProductFilters] = useState({
    search: "",
    category: "",
    stock_status: "",
    sortBy: "name",
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders()
    } else if (activeTab === "products") {
      loadProducts()
    }
  }, [activeTab, currentOrderPage, orderFilters])

  useEffect(() => {
    if (activeTab === "products") {
      filterProducts()
    }
  }, [products, productFilters])

  // Orders Functions
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
        setOrdersError("Error al cargar los pedidos")
      }
    } catch (err) {
      setOrdersError("Error de conexión")
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

      const response = await fetch(`${API_BASE_URL}/get_products.php?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setProductStats(data.stats)
      } else {
        setProductsError("Error al cargar productos")
      }
    } catch (err) {
      setProductsError("Error de conexión")
      console.error("Error loading products:", err)
    } finally {
      setProductsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filtro de búsqueda
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

    // Filtro de categoría
    if (productFilters.category) {
      filtered = filtered.filter((product) => product.category === productFilters.category)
    }

    // Filtro de estado de stock
    if (productFilters.stock_status) {
      filtered = filtered.filter((product) => product.stock_status === productFilters.stock_status)
    }

    // Ordenamiento
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
    setImagePreview(null)
    setIsProductModalOpen(true)
  }

  const showEditProductModal = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_products.php?id=${id}`)
      const data = await response.json()

      if (data.success) {
        setCurrentEditingProduct(data.product)
        setImagePreview(data.product.image_url)
        setIsProductModalOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar producto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast({
        title: "Error",
        description: "Error al cargar producto",
        variant: "destructive",
      })
    }
  }

  const showDeleteProductModal = (id: number, name: string) => {
    setDeleteProductId(id)
    setIsDeleteModalOpen(true)
  }

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const isEditing = currentEditingProduct !== null

    if (isEditing) {
      formData.append("id", currentEditingProduct.id.toString())
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
          title: "Éxito",
          description: isEditing ? "Producto actualizado exitosamente" : "Producto añadido exitosamente",
        })
        setIsProductModalOpen(false)
        loadProducts()
      } else {
        throw new Error(data.error || "Error al guardar producto")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Error al guardar producto",
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
          title: "Éxito",
          description: "Producto eliminado exitosamente",
        })
        setIsDeleteModalOpen(false)
        setDeleteProductId(null)
        loadProducts()
      } else {
        throw new Error(data.error || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Error al eliminar producto",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Utility Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "En Stock"
      case "low_stock":
        return "Stock Bajo"
      case "out_of_stock":
        return "Sin Stock"
      default:
        return status
    }
  }

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case "hot-sauce":
        return "🌶️ Hot Sauce"
      case "bbq-sauce":
        return "🔥 BBQ Sauce"
      default:
        return "❓ Sin categoría"
    }
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
    return new Date(dateString).toLocaleDateString("es-ES", {
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando panel de administración...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">FEUER KÖNIGREICH</h1>
                <p className="text-gray-600">Panel de Administración</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={activeTab === "orders" ? loadOrders : loadProducts}
                disabled={ordersLoading || productsLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading || productsLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button onClick={onClose} variant="outline" className="border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border border-gray-200">
            <TabsTrigger
              value="orders"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
            >
              <Package className="w-4 h-4" />
              <span>Productos</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {/* Orders Stats Cards */}
            {orderStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Pedidos</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {Number.parseInt(orderStats.total_orders.toString()) || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(Number.parseFloat(orderStats.total_revenue.toString()) || 0).toFixed(2)} CHF
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Completados</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Number.parseInt(orderStats.completed_orders.toString()) || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {Number.parseInt(orderStats.pending_orders.toString()) || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-orange-600" />
                  Filtros de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="order-search">Buscar</Label>
                    <Input
                      id="order-search"
                      placeholder="Nombre, email, número..."
                      value={orderFilters.search}
                      onChange={(e) => handleOrderFilterChange("search", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="order-status">Estado</Label>
                    <Select
                      value={orderFilters.status}
                      onValueChange={(value) => handleOrderFilterChange("status", value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="order-email">Email</Label>
                    <Input
                      id="order-email"
                      type="email"
                      placeholder="cliente@email.com"
                      value={orderFilters.email}
                      onChange={(e) => handleOrderFilterChange("email", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setOrderFilters({ search: "", status: "all", email: "" })
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-6 h-6 text-gray-600" />
                        <span>{order.order_number}</span>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Cliente</p>
                        <p className="text-lg font-bold text-gray-800">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-gray-600 text-sm">Email: {order.customer_email}</p>
                        <p className="text-gray-600 text-sm">Teléfono: {order.customer_phone}</p>
                        <p className="text-gray-600 text-sm">Dirección: {order.customer_address}</p>
                        <p className="text-gray-600 text-sm">Ciudad: {order.customer_city}</p>
                        <p className="text-gray-600 text-sm">Canton: {order.customer_canton}</p>
                        {order.customer_notes && <p className="text-gray-600 text-sm">Notas: {order.customer_notes}</p>}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Total</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {(Number.parseFloat(order.total_amount.toString()) || 0).toFixed(2)} CHF
                        </p>
                        <p className="text-gray-600 text-sm">Costo de Envío</p>
                        <p className="text-lg font-bold text-gray-800">
                          {(Number.parseFloat(order.shipping_cost.toString()) || 0).toFixed(2)} CHF
                        </p>
                        <p className="text-gray-600 text-sm">Fecha de Creación</p>
                        <p className="text-gray-600 text-sm">{formatDate(order.created_at)}</p>
                        <p className="text-gray-600 text-sm">Fecha de Actualización</p>
                        <p className="text-gray-600 text-sm">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => showOrderDetail(order)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Orders Pagination */}
            <div className="flex items-center justify-center mt-8">
              <Button
                onClick={() => setCurrentOrderPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentOrderPage === 1}
                className="bg-orange-500 hover:bg-orange-600 text-white mr-2"
              >
                Anterior
              </Button>
              <span className="text-gray-600">
                Página {currentOrderPage} de {totalOrderPages}
              </span>
              <Button
                onClick={() => setCurrentOrderPage((prev) => Math.min(prev + 1, totalOrderPages))}
                disabled={currentOrderPage === totalOrderPages}
                className="bg-orange-500 hover:bg-orange-600 text-white ml-2"
              >
                Siguiente
              </Button>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            {/* Products Stats Cards */}
            {productStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Productos</p>
                        <p className="text-2xl font-bold text-gray-800">{productStats.total_products}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Stock Total</p>
                        <p className="text-2xl font-bold text-green-600">{productStats.total_stock}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package2 className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Stock Bajo</p>
                        <p className="text-2xl font-bold text-yellow-600">{productStats.low_stock}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Sin Stock</p>
                        <p className="text-2xl font-bold text-red-600">{productStats.out_of_stock}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <X className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Gestión de Productos</h2>
              <Button onClick={showAddProductModal} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Producto
              </Button>
            </div>

            {/* Products Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-orange-600" />
                  Filtros de Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="product-search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="product-search"
                        placeholder="Buscar productos..."
                        value={productFilters.search}
                        onChange={(e) => setProductFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="bg-white pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="product-category">Categoría</Label>
                    <Select
                      value={productFilters.category || "all"}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, category: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="hot-sauce">Hot Sauce</SelectItem>
                        <SelectItem value="bbq-sauce">BBQ Sauce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product-stock-status">Estado Stock</Label>
                    <Select
                      value={productFilters.stock_status || "all"}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, stock_status: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="in_stock">En Stock</SelectItem>
                        <SelectItem value="low_stock">Stock Bajo</SelectItem>
                        <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product-sort">Ordenar por</Label>
                    <Select
                      value={productFilters.sortBy}
                      onValueChange={(value) => setProductFilters((prev) => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="price">Precio</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="heat_level">Nivel de Picante</SelectItem>
                        <SelectItem value="category">Categoría</SelectItem>
                        <SelectItem value="created_at">Fecha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setProductFilters({ search: "", category: "", stock_status: "", sortBy: "name" })
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={product.image_url || "/placeholder.svg?height=80&width=80"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex space-x-2">
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

                    <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-orange-100 text-orange-800">{getCategoryDisplay(product.category)}</Badge>
                        <span className="font-bold text-lg text-gray-800">
                          {Number.parseFloat(product.price.toString()).toFixed(2)} CHF
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStockStatusColor(product.stock_status)}>
                            {getStockStatusText(product.stock_status)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">Picante:</span>
                          <div className="flex space-x-1">{generateHeatIcons(product.heat_level)}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">{generateStarIcons(product.rating)}</div>
                          <span className="text-sm text-gray-600">
                            {Number.parseFloat(product.rating.toString()).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {product.badge && (
                        <Badge variant="outline" className="text-xs">
                          {product.badge}
                        </Badge>
                      )}

                      {product.origin && <p className="text-xs text-gray-500">Origen: {product.origin}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 h-6 text-gray-600" />
                    <span>{selectedOrder.order_number}</span>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Información del Cliente</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Nombre:</span> {selectedOrder.customer_first_name}{" "}
                      {selectedOrder.customer_last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedOrder.customer_email}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span> {selectedOrder.customer_phone}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span> {selectedOrder.customer_address}
                    </p>
                    <p>
                      <span className="font-medium">Ciudad:</span> {selectedOrder.customer_city}
                    </p>
                    <p>
                      <span className="font-medium">Código Postal:</span> {selectedOrder.customer_postal_code}
                    </p>
                    <p>
                      <span className="font-medium">Cantón:</span> {selectedOrder.customer_canton}
                    </p>
                    {selectedOrder.customer_notes && (
                      <p>
                        <span className="font-medium">Notas:</span> {selectedOrder.customer_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Información del Pedido</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Total:</span>{" "}
                      {(Number.parseFloat(selectedOrder.total_amount.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p>
                      <span className="font-medium">Costo de Envío:</span>{" "}
                      {(Number.parseFloat(selectedOrder.shipping_cost.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p>
                      <span className="font-medium">Método de Pago:</span> {selectedOrder.payment_method}
                    </p>
                    <p>
                      <span className="font-medium">Estado de Pago:</span> {selectedOrder.payment_status}
                    </p>
                    <p>
                      <span className="font-medium">Fecha de Creación:</span> {formatDate(selectedOrder.created_at)}
                    </p>
                    <p>
                      <span className="font-medium">Última Actualización:</span> {formatDate(selectedOrder.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-lg mb-3">Items del Pedido</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <Card key={item.product_id}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={item.product_image || "/placeholder.svg?height=60&width=60"}
                              alt={item.product_name}
                              className="w-15 h-15 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product_name}</h4>
                              <p className="text-sm text-gray-600">{item.product_description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm">Cantidad: {item.quantity}</span>
                                <span className="text-sm">
                                  Precio: {Number.parseFloat(item.price.toString()).toFixed(2)} CHF
                                </span>
                                <span className="text-sm font-medium">
                                  Subtotal: {Number.parseFloat(item.subtotal.toString()).toFixed(2)} CHF
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Picante:</span>
                                  <div className="flex space-x-1">{generateHeatIcons(item.heat_level)}</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="flex space-x-1">{generateStarIcons(item.rating)}</div>
                                  <span className="text-xs text-gray-500">
                                    {Number.parseFloat(item.rating.toString()).toFixed(1)}
                                  </span>
                                </div>
                                {item.badge && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                                {item.origin && <span className="text-xs text-gray-500">Origen: {item.origin}</span>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Product Add/Edit Modal */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{currentEditingProduct ? "Editar Producto" : "Añadir Producto"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleProductSubmit} className="space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={currentEditingProduct?.name || ""}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio (CHF) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={currentEditingProduct?.price || ""}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={currentEditingProduct?.description || ""}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select name="category" defaultValue={currentEditingProduct?.category || ""} required>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="hot-sauce">🌶️ Hot Sauce</SelectItem>
                      <SelectItem value="bbq-sauce">🔥 BBQ Sauce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue={currentEditingProduct?.stock || "0"}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heat_level">Nivel de Picante (1-5)</Label>
                  <Select name="heat_level" defaultValue={currentEditingProduct?.heat_level?.toString() || "1"}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1 - Mild</SelectItem>
                      <SelectItem value="2">2 - Leicht scharf</SelectItem>
                      <SelectItem value="3">3 - Mittel</SelectItem>
                      <SelectItem value="4">4 - Scharf</SelectItem>
                      <SelectItem value="5">5 - Sehr scharf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    defaultValue={currentEditingProduct?.rating || ""}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    name="badge"
                    placeholder="Ej: Sonnig, Scharf"
                    defaultValue={currentEditingProduct?.badge || ""}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="origin">Origen</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="Ej: USA, Mexiko"
                    defaultValue={currentEditingProduct?.origin || ""}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Imagen del Producto</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-white"
                />
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {currentEditingProduct ? "Actualizar" : "Crear"} Producto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Product Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-600">
                ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmDeleteProduct} className="bg-red-500 hover:bg-red-600 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}