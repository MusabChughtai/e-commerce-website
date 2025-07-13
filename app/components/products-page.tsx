"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCart, User, Plus, Minus, Menu, Search, Heart } from "lucide-react"
import { AccountModal } from "./account-modal"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  fullDescription: string
  dimensions: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ProductsPageProps {
  products: Product[]
  onBack: () => void
  onProductSelect: (product: Product) => void
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
  onNavigateServices: () => void
  onNavigateAdmin: () => void
}

const ProductsPage = ({
  products,
  onBack,
  onProductSelect,
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
  onNavigateServices,
  onNavigateAdmin,
}: ProductsPageProps) => {
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
              <button className="text-[#f7dc6f] font-medium" style={{ fontFamily: "serif" }}>
                SHOP
              </button>
              <button
                onClick={onNavigateServices}
                className="text-[#f4d03f] hover:text-[#f7dc6f] font-medium transition-colors"
                style={{ fontFamily: "serif" }}
              >
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
              onClick={() => setIsMobileMenuOpen?.(false)}
              className="block text-lg text-[#4a7c59] font-medium py-2 w-full text-left"
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

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-800" style={{ fontFamily: "serif" }}>
            Our Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2" style={{ fontFamily: "serif" }}>
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <p className="text-xl font-semibold text-[#4a7c59] mb-4">{formatPrice(product.price)}</p>
                  <Button
                    className="w-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white rounded-full"
                    onClick={() => onProductSelect(product)}
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
    </div>
  )
}

export default ProductsPage
export { ProductsPage }
