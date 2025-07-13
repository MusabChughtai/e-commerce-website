"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  Search,
  Heart,
  Menu,
  Hammer,
  Palette,
  Ruler,
  MessageSquare,
  Phone,
} from "lucide-react"
import { AccountModal } from "./account-modal"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ServicesPageProps {
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
  onNavigateAdmin: () => void
}

const ServicesPage = ({
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
  onNavigateAdmin,
}: ServicesPageProps) => {
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
                onClick={() => setIsMobileMenuOpen?.(true)}
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Left Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={onNavigateHome}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                HOME
              </button>
              <button
                onClick={onNavigateProducts}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                SHOP
              </button>
              <button className="text-[#f7dc6f] font-medium" style={{ fontFamily: "serif" }}>
                SERVICES
              </button>
              <button
                onClick={onNavigateAdmin}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
                ADMIN
              </button>
            </nav>

            {/* Center Logo */}
            <div className="flex items-center">
              <button
                onClick={onNavigateHome}
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
              onClick={() => setIsMobileMenuOpen?.(false)}
              className="block text-lg text-[#4a7c59] font-medium py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              SERVICES
            </button>
            <button
              onClick={() => {
                onNavigateAdmin()
                setIsMobileMenuOpen?.(false)
              }}
              className="block text-lg text-gray-700 hover:text-[#4a7c59] font-medium transition-colors py-2 w-full text-left"
              style={{ fontFamily: "serif" }}
            >
              ADMIN
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Services Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light mb-4 text-gray-800" style={{ fontFamily: "serif" }}>
              Custom Made Furniture Services
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Transform your vision into reality with our bespoke furniture crafting services. From initial design to
              final delivery, we create unique pieces tailored to your exact specifications and space requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gradient-to-br from-[#4a7c59]/10 to-[#4a7c59]/20 border-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-[#f4d03f]" />
                </div>
                <h3 className="text-xl font-semibold text-[#4a7c59] mb-3" style={{ fontFamily: "serif" }}>
                  Design Consultation
                </h3>
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
                <h3 className="text-xl font-semibold text-[#f4d03f] mb-3" style={{ fontFamily: "serif" }}>
                  Expert Craftsmanship
                </h3>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "serif" }}>
                  Perfect Fit
                </h3>
                <p className="text-gray-700">
                  Every piece is measured and crafted to fit your space perfectly, ensuring optimal functionality and
                  aesthetics.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-light mb-6 text-gray-800" style={{ fontFamily: "serif" }}>
              Ready to Create Your Dream Furniture?
            </h2>
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
    </div>
  )
}

export default ServicesPage

// Provide a named export in addition to the default export
export { ServicesPage }
