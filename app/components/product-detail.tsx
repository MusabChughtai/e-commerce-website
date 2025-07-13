"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, ShoppingCart, User, Plus, Minus, Search, Heart } from "lucide-react"
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

interface ProductDetailProps {
  product: Product
  onBack: () => void
  onAddToCart: () => void
  onBuyNow: () => void
  cartItems: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  updateCartQuantity: (id: string, quantity: number) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isAccountOpen: boolean
  setIsAccountOpen: (open: boolean) => void
  formatPrice: (price: number) => string
  onNavigateHome: () => void
  onNavigateProducts: () => void
  onNavigateServices: () => void
  onNavigateAdmin: () => void
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  cartItems,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  getTotalPrice,
  getTotalItems,
  isAccountOpen,
  setIsAccountOpen,
  formatPrice,
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
  onNavigateAdmin,
}: ProductDetailProps) {
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
                onClick={onBack}
                className="text-[#f4d03f] hover:text-[#f7dc6f] hover:bg-[#3d6b4a]"
              >
                <ArrowLeft className="h-5 w-5" />
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

      {/* Product Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-lg p-8 flex items-center justify-center">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={500}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-4" style={{ fontFamily: "serif" }}>
                {product.name}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.fullDescription}</p>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Dimensions</p>
                <p className="text-gray-700">{product.dimensions}</p>
              </div>
              <p className="text-3xl font-semibold text-[#4a7c59] mb-6">{formatPrice(product.price)}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-[#4a7c59] hover:bg-[#3d6b4a] text-white px-8 py-3 rounded-full"
                  onClick={onAddToCart}
                  style={{ fontFamily: "serif" }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="border-[#f4d03f] text-[#f4d03f] hover:bg-[#f4d03f]/10 px-8 py-3 rounded-full bg-transparent"
                  onClick={onBuyNow}
                  style={{ fontFamily: "serif" }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
