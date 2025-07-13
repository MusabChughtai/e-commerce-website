"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  ShoppingCart,
  User,
  ChevronRight,
  Phone,
  MessageSquare,
  Plus,
  Minus,
  Facebook,
  Send,
  Search,
  Heart,
  Menu,
  Hammer,
  Palette,
  Ruler,
} from "lucide-react"
import { ProductsPage } from "./components/products-page"
import { ProductDetail } from "./components/product-detail"
import { CheckoutPage } from "./components/checkout-page"
import { AccountModal } from "./components/account-modal"
import { ServicesPage } from "./components/services-page"
import { AdminPortal } from "./components/admin-portal"
import { supabase, type Product } from "@/lib/supabase"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function EastCraftsWebsite() {
  const [currentView, setCurrentView] = useState<
    "home" | "products" | "product-detail" | "checkout" | "services" | "admin"
  >("home")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback to static products if Supabase fails
      setProducts([
        {
          id: "1",
          name: "Velvet Armchair",
          description: "Comfortable and stylish seating solution",
          price: 124999,
          image: "/placeholder.svg?height=200&width=200",
          full_description:
            "Experience unparalleled comfort and timeless style with our Velvet Armchair. Crafted with a solid oak frame and upholstered in premium, soft velvet that offers both luxury and durability.",
          dimensions: "Height: 85cm, Width: 65cm, Depth: 70cm",
        },
        {
          id: "2",
          name: "Oakwood Lamp",
          description: "Brighten your space with style",
          price: 32499,
          image: "/placeholder.svg?height=200&width=200",
          full_description:
            "Illuminate your space with our handcrafted Oakwood Lamp. Made from sustainably sourced oak with a warm LED bulb for perfect ambient lighting.",
          dimensions: "Height: 45cm, Base: 15cm diameter",
        },
        {
          id: "3",
          name: "Linen Sofa",
          description: "Luxury and elegant seating for your living room",
          price: 324999,
          image: "/placeholder.svg?height=200&width=200",
          full_description:
            "Our premium Linen Sofa combines comfort with sophisticated design. Features high-quality linen upholstery and solid hardwood frame.",
          dimensions: "Height: 80cm, Width: 200cm, Depth: 90cm",
        },
        {
          id: "4",
          name: "Dining Set",
          description: "Perfect for beautiful dining experiences",
          price: 224999,
          image: "/placeholder.svg?height=200&width=200",
          full_description:
            "Complete dining set including table and four chairs. Crafted from solid wood with a beautiful natural finish.",
          dimensions: "Table: 150cm x 90cm, Chair height: 85cm",
        },
      ])
    }
  }

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ]
    })
  }

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return `PKR ${price.toLocaleString()}`
  }

  // Convert Product to legacy format for compatibility
  const convertToLegacyProduct = (product: Product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    fullDescription: product.full_description,
    dimensions: product.dimensions,
  })

  if (currentView === "admin") {
    return (
      <AdminPortal
        onBack={() => setCurrentView("home")}
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        formatPrice={formatPrice}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateProducts={() => setCurrentView("products")}
        onNavigateServices={() => setCurrentView("services")}
      />
    )
  }

  if (currentView === "services") {
    return (
      <ServicesPage
        onBack={() => setCurrentView("home")}
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        formatPrice={formatPrice}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateProducts={() => setCurrentView("products")}
        onNavigateAdmin={() => setCurrentView("admin")}
      />
    )
  }

  if (currentView === "products") {
    return (
      <ProductsPage
        products={products.map(convertToLegacyProduct)}
        onBack={() => setCurrentView("home")}
        onProductSelect={(product) => {
          const dbProduct = products.find((p) => p.id === product.id)
          if (dbProduct) {
            setSelectedProduct(dbProduct)
            setCurrentView("product-detail")
          }
        }}
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        formatPrice={formatPrice}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateServices={() => setCurrentView("services")}
        onNavigateAdmin={() => setCurrentView("admin")}
      />
    )
  }

  if (currentView === "product-detail" && selectedProduct) {
    return (
      <ProductDetail
        product={convertToLegacyProduct(selectedProduct)}
        onBack={() => setCurrentView("products")}
        onAddToCart={() => addToCart(selectedProduct)}
        onBuyNow={() => setCurrentView("checkout")}
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        formatPrice={formatPrice}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateProducts={() => setCurrentView("products")}
        onNavigateServices={() => setCurrentView("services")}
        onNavigateAdmin={() => setCurrentView("admin")}
      />
    )
  }

  if (currentView === "checkout") {
    return (
      <CheckoutPage
        cartItems={cartItems}
        selectedProduct={selectedProduct ? convertToLegacyProduct(selectedProduct) : null}
        onBack={() => (selectedProduct ? setCurrentView("product-detail") : setCurrentView("products"))}
        getTotalPrice={getTotalPrice}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        getTotalItems={getTotalItems}
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        formatPrice={formatPrice}
        onNavigateHome={() => setCurrentView("home")}
        onNavigateProducts={() => setCurrentView("products")}
        onNavigateServices={() => setCurrentView("services")}
        onNavigateAdmin={() => setCurrentView("admin")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#4a7c59] shadow-sm border-b border-[#3d6b4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Left Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setCurrentView("home")}
                className="text-[#f7dc6f] font-medium"
                style={{ fontFamily: "serif" }}
              >
                HOME
              </button>
              <button
                onClick={() => setCurrentView("products")}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                SHOP
              </button>
              <button
                onClick={() => setCurrentView("services")}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                SERVICES
              </button>
              <button
                onClick={() => setCurrentView("admin")}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                ADMIN
              </button>
            </nav>

            {/* Center Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView("home")}
                className="text-2xl font-bold text-[#f4d03f] tracking-wide hover:text-[#f7dc6f] transition-colors"
                style={{ fontFamily: "serif" }}
              >
                East Crafts
              </button>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]">
                <Search className="h-5 w-5" />
              </Button>

              <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AccountModal />
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]">
                <Heart className="h-5 w-5" />
              </Button>

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#f4d03f] text-[#4a7c59] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {getTotalItems()}
                      </span>
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
                          <Button
                            className="w-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white py-3 rounded-lg font-medium"
                            onClick={() => {
                              setCurrentView("checkout")
                              setIsCartOpen(false)
                            }}
                          >
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
                setCurrentView("home")
                setIsMobileMenuOpen(false)
              }}
              className="block text-lg text-[#4a7c59] font-medium py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              HOME
            </button>
            <button
              onClick={() => {
                setCurrentView("products")
                setIsMobileMenuOpen(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              SHOP
            </button>
            <button
              onClick={() => {
                setCurrentView("services")
                setIsMobileMenuOpen(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              SERVICES
            </button>
            <button
              onClick={() => {
                setCurrentView("admin")
                setIsMobileMenuOpen(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              ADMIN
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#4a7c59] to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            <div className="bg-gradient-to-br from-[#4a7c59] to-[#3d6b4a] flex items-center justify-center p-8">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/woodworking-tools.png"
                  alt="Woodworking Tools"
                  width={500}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#4a7c59] to-black text-[#f4d03f] p-8 lg:p-16 flex items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-light mb-4 leading-tight" style={{ fontFamily: "serif" }}>
                  Crafted for
                  <br />
                  <span className="font-medium">Timeless Living</span>
                </h2>
                <p className="text-[#f7dc6f] mb-8 text-lg leading-relaxed">
                  Discover artisanal furniture that blends tradition with modern design, creating pieces that tell a
                  story.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-[#f4d03f] text-[#4a7c59] hover:bg-[#f7dc6f] px-8 py-3 rounded-full font-medium shadow-lg"
                    onClick={() => setCurrentView("products")}
                    style={{ fontFamily: "serif" }}
                  >
                    Explore Collection
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-[#f4d03f] text-[#f4d03f] hover:bg-[#3d6b4a] px-8 py-3 rounded-full font-medium bg-transparent"
                    onClick={() => setCurrentView("services")}
                    style={{ fontFamily: "serif" }}
                  >
                    Custom Services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Collection */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-16">
            <h3 className="text-3xl font-light text-gray-800 mr-4" style={{ fontFamily: "serif" }}>
              Our Store Collection
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("products")}
              className="text-[#4a7c59] hover:text-[#3d6b4a] hover:bg-[#f7dc6f] rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <Card
                key={product.id}
                className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 border-0 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="rounded-xl"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2" style={{ fontFamily: "serif" }}>
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <p className="text-xl font-semibold text-[#4a7c59] mb-4">{formatPrice(product.price)}</p>
                  <Button
                    className="w-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white rounded-xl font-medium py-2.5"
                    onClick={() => {
                      setSelectedProduct(product)
                      setCurrentView("product-detail")
                    }}
                    style={{ fontFamily: "serif" }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Furniture Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light mb-4 text-gray-800" style={{ fontFamily: "serif" }}>
              Custom Made Furniture Services
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Transform your vision into reality with our bespoke furniture crafting services. From initial design to
              final delivery, we create unique pieces tailored to your exact specifications and space requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-[#4a7c59]/10 to-[#4a7c59]/20 border-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-[#f4d03f]" />
                </div>
                <h4 className="text-xl font-semibold text-[#4a7c59] mb-3" style={{ fontFamily: "serif" }}>
                  Design Consultation
                </h4>
                <p className="text-[#4a7c59]">
                  Work with our expert designers to create furniture that perfectly matches your style and space
                  requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#f4d03f]/10 to-[#f4d03f]/20 border-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#f4d03f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hammer className="h-8 w-8 text-[#4a7c59]" />
                </div>
                <h4 className="text-xl font-semibold text-[#f4d03f] mb-3" style={{ fontFamily: "serif" }}>
                  Expert Craftsmanship
                </h4>
                <p className="text-[#f4d03f]">
                  Our skilled artisans use traditional techniques combined with modern tools to create exceptional
                  furniture pieces.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "serif" }}>
                  Perfect Fit
                </h4>
                <p className="text-gray-700">
                  Every piece is measured and crafted to fit your space perfectly, ensuring optimal functionality and
                  aesthetics.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h4 className="text-2xl font-light mb-6 text-gray-800" style={{ fontFamily: "serif" }}>
              Ready to Create Your Dream Furniture?
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-medium shadow-lg"
                style={{ fontFamily: "serif" }}
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Consultation
              </Button>
              <Button
                variant="outline"
                className="border-2 border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59]/10 px-8 py-3 rounded-full flex items-center gap-2 font-medium bg-transparent"
                style={{ fontFamily: "serif" }}
              >
                <Phone className="h-4 w-4" />
                Schedule Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#4a7c59] to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h5 className="text-2xl font-bold text-[#f4d03f] mb-4" style={{ fontFamily: "serif" }}>
                East Crafts
              </h5>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Crafting beautiful, sustainable furniture for modern homes. Quality craftsmanship meets timeless design.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <strong className="text-white">Address:</strong> Near Liaqat chowk Kamahan - Lidher Rd, Gulshan Yaseen
                  Colony, Lahore, 54000, Pakistan
                </p>
                <p>
                  <strong className="text-white">Email:</strong> eastcraftpk@gmail.com
                </p>
                <p>
                  <strong className="text-white">Phone:</strong> +92 322 7176433
                </p>
              </div>
            </div>

            {/* Info Section */}
            <div>
              <h6
                className="font-semibold text-white mb-4 text-sm uppercase tracking-wider"
                style={{ fontFamily: "serif" }}
              >
                INFO
              </h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Custom Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    F.A.Q's
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Order Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Services Section */}
            <div>
              <h6
                className="font-semibold text-white mb-4 text-sm uppercase tracking-wider"
                style={{ fontFamily: "serif" }}
              >
                SERVICES
              </h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Your Account
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Delivery Information
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us Section */}
            <div>
              <h6
                className="font-semibold text-white mb-4 text-sm uppercase tracking-wider"
                style={{ fontFamily: "serif" }}
              >
                CONTACT US
              </h6>
              <p className="text-gray-300 text-sm mb-4">Join 40.00+ Subscribers and get a new discount coupon</p>
              <div className="flex mb-6">
                <Input
                  placeholder="Your email address..."
                  className="rounded-r-none border-r-0 focus:ring-0 focus:border-[#f4d03f] bg-[#3d6b4a] border-[#4a7c59] text-white placeholder-gray-400"
                />
                <Button className="bg-[#f4d03f] hover:bg-[#f7dc6f] text-[#4a7c59] rounded-l-none px-4">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-600 hover:bg-[#3d6b4a] bg-transparent text-gray-300 hover:text-white hover:border-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-600 hover:bg-[#3d6b4a] bg-transparent text-gray-300 hover:text-white hover:border-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-600 hover:bg-[#3d6b4a] bg-transparent text-gray-300 hover:text-white hover:border-white"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-600 hover:bg-[#3d6b4a] bg-transparent text-gray-300 hover:text-white hover:border-white"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-300 mb-4 md:mb-0">
                © Copyright 2025 |{" "}
                <span className="text-[#f4d03f]" style={{ fontFamily: "serif" }}>
                  East Crafts
                </span>
              </div>
              <div className="flex space-x-4">
                <div className="h-8 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div className="h-8 w-12 bg-gradient-to-r from-red-600 to-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  MC
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
