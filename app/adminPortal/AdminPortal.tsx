"use client";

import { useState } from "react";

import { BarChart3, Package, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "add-product" | "edit-product">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddProduct = () => {
    setActiveTab("add-product");
  };

  const handleEditProduct = (product: any) => {
    startEdit(product);
    setActiveTab("edit-product");
  };

  const handleCancelEdit = () => {
    cancelEdit();
    setActiveTab("products");
  };

  const handleProductSaved = () => {
    setActiveTab("products");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
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
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <nav className="px-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as "dashboard" | "products")}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                        activeTab === item.id || (item.id === "products" && (activeTab === "add-product" || activeTab === "edit-product"))
                          ? "bg-gradient-to-r from-[#23423d] to-[#1e3b36] text-white shadow-lg"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-[#23423d]"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 pt-16">
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <h2 className="text-lg font-semibold text-[#23423d]">Admin Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-500 hover:text-[#23423d]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4 pt-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as "dashboard" | "products");
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                        activeTab === item.id || (item.id === "products" && (activeTab === "add-product" || activeTab === "edit-product"))
                          ? "bg-gradient-to-r from-[#23423d] to-[#1e3b36] text-white shadow-lg"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-[#23423d]"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:pl-64 pt-16">
          <div className="px-6 py-8 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === "dashboard" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-2xl">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    </div>
                  </div>
                  <div className="p-8">
                    <DashboardTab products={products} formatPrice={formatPrice} />
                  </div>
                </div>
              )}

              {activeTab === "products" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-2xl">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">Products</h1>
                    </div>
                  </div>
                  <div className="p-8">
                    <ProductsTab
                      products={products}
                      loading={loading}
                      deleteProduct={deleteProduct}
                      formatPrice={formatPrice}
                      onAddProduct={handleAddProduct}
                      onEditProduct={handleEditProduct}
                    />
                  </div>
                </div>
              )}

              {(activeTab === "add-product" || activeTab === "edit-product") && (
                <AddEditProductForm
                  formData={formData}
                  setFormData={setFormData}
                  editingProduct={editingProduct}
                  addProduct={async (e: React.FormEvent) => {
                    try {
                      await addProduct(e);
                      handleProductSaved();
                    } catch (error) {
                      console.error("Failed to add product:", error);
                    }
                  }}
                  updateProduct={async (e: React.FormEvent) => {
                    try {
                      await updateProduct(e);
                      handleProductSaved();
                    } catch (error) {
                      console.error("Failed to update product:", error);
                    }
                  }}
                  cancelEdit={handleCancelEdit}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}