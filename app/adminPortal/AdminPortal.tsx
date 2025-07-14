"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package, Plus } from "lucide-react";

import { useProducts } from "./hooks/useProducts";
import { DashboardTab } from "./_components/DashboardTab";
import { ProductsTab } from "./_components/ProductsTab";
import { AddEditProductForm } from "./_components/AddEditProductForm";
import { AdminHeader } from "./_components/AdminHeader";
import { MobileMenu } from "./_components/MobileMenu";
import { CartSheet } from "./_components/CartSheet";

import { AdminPortalProps } from "./types";

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
  const {
    products,
    loading,
    editingProduct,
    formData,
    setFormData,
    addProduct,
    updateProduct,
    deleteProduct,
    startEdit,
    cancelEdit,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "add">("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <AdminHeader
        isAccountOpen={isAccountOpen}
        setIsAccountOpen={setIsAccountOpen}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        getTotalItems={getTotalItems}
        onNavigateHome={onNavigateHome}
        onNavigateProducts={onNavigateProducts}
        onNavigateServices={onNavigateServices}
        setIsMobileMenuOpen={(open) => setIsMobileMenuOpen?.(open)}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={!!isMobileMenuOpen}
        setIsOpen={(open) => setIsMobileMenuOpen?.(open)}
        onNavigateHome={onNavigateHome}
        onNavigateProducts={onNavigateProducts}
        onNavigateServices={onNavigateServices}
      />

      {/* Cart Sidebar */}
      <CartSheet
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        cartItems={cartItems}
        updateCartQuantity={updateCartQuantity}
        getTotalPrice={getTotalPrice}
        formatPrice={formatPrice}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white shadow-lg rounded-xl p-1 border border-gray-200">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{editingProduct ? "Edit" : "Add"}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab products={products} formatPrice={formatPrice} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab
              products={products}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              startEdit={(product) => {
                startEdit(product);
                setActiveTab("add");
              }}
              deleteProduct={deleteProduct}
              formatPrice={formatPrice}
            />
          </TabsContent>

          <TabsContent value="add">
            <AddEditProductForm
              formData={formData}
              setFormData={setFormData}
              editingProduct={editingProduct}
              addProduct={addProduct}
              updateProduct={updateProduct}
              cancelEdit={cancelEdit}
              showSuccessModal={false}
              setShowSuccessModal={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
