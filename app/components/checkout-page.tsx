"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, ShoppingCart, User, Plus, Minus, Search, Heart, CreditCard, Truck } from "lucide-react"
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

interface CheckoutPageProps {
  cartItems: CartItem[]
  selectedProduct?: Product | null
  onBack: () => void
  getTotalPrice: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  updateCartQuantity: (id: string, quantity: number) => void
  getTotalItems: () => number
  isAccountOpen: boolean
  setIsAccountOpen: (open: boolean) => void
  formatPrice: (price: number) => string
  onNavigateHome: () => void
  onNavigateProducts: () => void
  onNavigateServices: () => void
  onNavigateAdmin: () => void
}

const CheckoutPage = ({
  cartItems,
  selectedProduct,
  onBack,
  getTotalPrice,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  getTotalItems,
  isAccountOpen,
  setIsAccountOpen,
  formatPrice,
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
  onNavigateAdmin,
}: CheckoutPageProps) => {
  const shippingCost = 500000 // PKR 5000
  const totalWithShipping = getTotalPrice() + shippingCost

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#4a7c59] shadow-sm border-b border-[#3d6b4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Back Button */}
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

      {/* Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "serif" }}>
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: "serif" }}>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+92 300 1234567" />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main Street" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Lahore" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" placeholder="54000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: "serif" }}>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle style={{ fontFamily: "serif" }}>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Shipping</span>
                  </div>
                  <span>{formatPrice(shippingCost)}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#4a7c59]">{formatPrice(totalWithShipping)}</span>
                </div>

                <Button className="w-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white py-3 mt-6">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
export { CheckoutPage }
