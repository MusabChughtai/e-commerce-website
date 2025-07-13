"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  Search,
  Heart,
  Menu,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Upload,
  Filter,
} from "lucide-react"
import { AccountModal } from "./account-modal"
import { supabase, type Product } from "@/lib/supabase"
import Image from "next/image"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface AdminPortalProps {
  onBack: () => void
  cartItems: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  updateCartQuantity: (id: string, quantity: number) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isAccountOpen: boolean
  setIsAccountOpen: (open: boolean) => void
  formatPrice: (price: number) => string
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
  onNavigateHome: () => void
  onNavigateProducts: () => void
  onNavigateServices: () => void
}

export function AdminPortal({
  onBack,
  cartItems,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  getTotalPrice,
  getTotalItems,
  isAccountOpen,
  setIsAccountOpen,
  formatPrice,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
}: AdminPortalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "add">("dashboard")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    full_description: "",
    dimensions: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: Number.parseInt(formData.price),
            image: formData.image,
            full_description: formData.full_description,
            dimensions: formData.dimensions,
          },
        ])
        .select()

      if (error) throw error

      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        full_description: "",
        dimensions: "",
      })
      fetchProducts()
      setActiveTab("products")
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          price: Number.parseInt(formData.price),
          image: formData.image,
          full_description: formData.full_description,
          dimensions: formData.dimensions,
        })
        .eq("id", editingProduct.id)

      if (error) throw error

      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        full_description: "",
        dimensions: "",
      })
      fetchProducts()
      setActiveTab("products")
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      full_description: product.full_description,
      dimensions: product.dimensions,
    })
    setActiveTab("add")
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      full_description: "",
      dimensions: "",
    })
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevenue = products.reduce((sum, product) => sum + product.price, 0)
  const averagePrice = products.length > 0 ? totalRevenue / products.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] shadow-lg border-b border-[#2d5a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen?.(true)}
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]/50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Left Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={onNavigateHome}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "serif" }}
              >
                HOME
              </button>
              <button
                onClick={onNavigateProducts}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "serif" }}
              >
                SHOP
              </button>
              <button
                onClick={onNavigateServices}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "serif" }}
              >
                SERVICES
              </button>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-[#f7dc6f]" />
                <span className="text-[#f7dc6f] font-medium" style={{ fontFamily: "serif" }}>
                  ADMIN
                </span>
              </div>
            </nav>

            {/* Center Logo */}
            <div className="flex items-center">
              <button
                onClick={onNavigateHome}
                className="text-2xl font-bold text-[#f4d03f] tracking-wide hover:text-[#f7dc6f] transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "serif" }}
              >
                East Crafts
              </button>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]/50 transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]/50 transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AccountModal />
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]/50 transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]/50 transition-all duration-200"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-[#f4d03f] text-[#4a7c59] text-xs h-5 w-5 flex items-center justify-center p-0 border-2 border-white">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-96">
                  <SheetHeader>
                    <SheetTitle className="text-left">Shopping Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <div className="w-8 h-10 bg-[#4a7c59] rounded"></div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-[#4a7c59] font-medium">{formatPrice(item.price)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-transparent"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-transparent"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex justify-between text-lg font-semibold mb-4">
                            <span>Total:</span>
                            <span className="text-[#4a7c59]">{formatPrice(getTotalPrice())}</span>
                          </div>
                          <Button className="w-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white py-3 rounded-lg font-medium">
                            Proceed to Checkout
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-bold text-[#4a7c59]" style={{ fontFamily: "serif" }}>
              East Crafts
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-8 space-y-4">
            <button
              onClick={() => {
                onNavigateHome()
                setIsMobileMenuOpen?.(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              HOME
            </button>
            <button
              onClick={() => {
                onNavigateProducts()
                setIsMobileMenuOpen?.(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              SHOP
            </button>
            <button
              onClick={() => {
                onNavigateServices()
                setIsMobileMenuOpen?.(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              SERVICES
            </button>
            <div className="flex items-center space-x-2 py-2">
              <Settings className="h-4 w-4 text-[#4a7c59]" />
              <span className="text-lg text-[#4a7c59] font-medium" style={{ fontFamily: "serif" }}>
                ADMIN
              </span>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Admin Portal Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] rounded-xl shadow-lg">
              <Settings className="h-8 w-8 text-[#f4d03f]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "serif" }}>
                Admin Portal
              </h1>
              <p className="text-gray-600 text-lg">Manage your products, inventory, and business insights</p>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white shadow-lg rounded-xl p-1 border border-gray-200">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4a7c59] data-[state=active]:to-[#3d6b4a] data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4a7c59] data-[state=active]:to-[#3d6b4a] data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4a7c59] data-[state=active]:to-[#3d6b4a] data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{editingProduct ? "Edit" : "Add"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{products.length}</div>
                  <p className="text-xs text-blue-600 mt-1">Active inventory items</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{formatPrice(totalRevenue)}</div>
                  <p className="text-xs text-green-600 mt-1">Combined product value</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Average Price</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{formatPrice(averagePrice)}</div>
                  <p className="text-xs text-purple-600 mt-1">Per product average</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Categories</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">4</div>
                  <p className="text-xs text-orange-600 mt-1">Product categories</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Products */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "serif" }}>
                  <Eye className="h-5 w-5" />
                  <span>Recent Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4a7c59] to-[#3d6b4a] rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                        <Badge className="bg-[#4a7c59] text-white">{formatPrice(product.price)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white bg-transparent"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Badge variant="secondary" className="bg-[#4a7c59]/10 text-[#4a7c59]">
                      {filteredProducts.length} products
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c59] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-[#4a7c59] text-white">{formatPrice(product.price)}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900" style={{ fontFamily: "serif" }}>
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                          className="flex-1 border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-all duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add/Edit Product Tab */}
          <TabsContent value="add" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white max-w-4xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "serif" }}>
                    {editingProduct ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
                  </CardTitle>
                  {editingProduct && (
                    <Button variant="ghost" onClick={cancelEdit} className="text-white hover:bg-white/20">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Product Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                          Price (PKR)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Short Description
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                        placeholder="Brief product description"
                        required
                      />
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Detailed Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="full_description" className="text-sm font-medium text-gray-700">
                        Full Description
                      </Label>
                      <Textarea
                        id="full_description"
                        value={formData.full_description}
                        onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                        rows={4}
                        className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                        placeholder="Detailed product description..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700">
                          Dimensions
                        </Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                          placeholder="e.g., Height: 85cm, Width: 65cm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                          Image URL
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                            placeholder="/placeholder.svg?height=200&width=200"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white bg-transparent"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] hover:from-[#3d6b4a] hover:to-[#2d5a3a] text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
