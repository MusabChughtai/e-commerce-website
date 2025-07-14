// app/admin/page.tsx
"use client";

import { AdminPortal } from "./AdminPortal";

export default function AdminPage() {
  // Dummy cart items for now
  const cartItems: any[] = [];

  // Dummy handlers — replace with your real logic when ready
  const handleBack = () => console.log("Back clicked");
  const handleUpdateCartQuantity = (id: string, qty: number) =>
    console.log(`Update quantity for ${id} to ${qty}`);
  const handleNavigateHome = () => console.log("Go home");
  const handleNavigateProducts = () => console.log("Go products");
  const handleNavigateServices = () => console.log("Go services");

  const getTotalPrice = () => 0; // Or sum your real cart
  const getTotalItems = () => 0; // Or count your real cart

  return (
    <AdminPortal
      onBack={handleBack}
      cartItems={cartItems}
      isCartOpen={false}
      setIsCartOpen={() => {}}
      updateCartQuantity={handleUpdateCartQuantity}
      getTotalPrice={getTotalPrice}
      getTotalItems={getTotalItems} // ✅ FUNCTION!
      isAccountOpen={false}
      setIsAccountOpen={() => {}}
      formatPrice={(price) => `PKR ${(price || 0).toFixed(2)}`}
      isMobileMenuOpen={false}
      setIsMobileMenuOpen={() => {}}
      onNavigateHome={handleNavigateHome}
      onNavigateProducts={handleNavigateProducts}
      onNavigateServices={handleNavigateServices}
    />
  );
}
