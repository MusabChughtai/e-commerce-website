"use client";

import { useState } from "react";

import { BarChart3, Package, Settings, Menu, X, Tag, Palette, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { usePolishColors } from "./hooks/usePolishColors";
import { useDiscounts } from "./hooks/useDiscounts";
import { DashboardTab } from "./_components/DashboardTab";
import { ProductsTab } from "./_components/ProductsTab";
import { CategoriesTab } from "./_components/CategoriesTab";
import { PolishColorsTab } from "./_components/PolishColorsTab";
import { DiscountsTab } from "./_components/DiscountsTab";
import { AddEditProductForm } from "./_components/AddEditProductForm";
import { AddEditCategoryForm } from "./_components/AddEditCategoryForm";
import { AddEditPolishColorForm } from "./_components/AddEditPolishColorForm";
import { AddEditDiscountForm } from "./_components/AddEditDiscountForm";
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

  const {
    categories,
    loading: categoriesLoading,
    editingCategory,
    formData: categoryFormData,
    setFormData: setCategoryFormData,
    addCategory,
    updateCategory,
    deleteCategory,
    startEdit: startEditCategory,
    cancelEdit: cancelEditCategory,
  } = useCategories();

  const {
    polishColors,
    loading: polishColorsLoading,
    editingPolishColor,
    formData: polishColorFormData,
    setFormData: setPolishColorFormData,
    addPolishColor,
    updatePolishColor,
    deletePolishColor,
    startEdit: startEditPolishColor,
    cancelEdit: cancelEditPolishColor,
  } = usePolishColors();

  const {
    discounts,
    loading: discountsLoading,
    editingDiscount,
    formData: discountFormData,
    categories: discountCategories,
    products: discountProducts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    startEditing: startEditDiscount,
    resetForm: resetDiscountForm,
    updateFormData: updateDiscountFormData,
  } = useDiscounts();

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "polish-colors" | "discounts" | "add-product" | "edit-product" | "add-category" | "edit-category" | "add-polish-color" | "edit-polish-color" | "add-discount" | "edit-discount">("dashboard");
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

  // Category handlers
  const handleAddCategory = () => {
    setActiveTab("add-category");
  };

  const handleEditCategory = (category: any) => {
    startEditCategory(category);
    setActiveTab("edit-category");
  };

  const handleCancelEditCategory = () => {
    cancelEditCategory();
    setActiveTab("categories");
  };

  const handleCategorySaved = () => {
    setActiveTab("categories");
  };

  // Polish Color handlers
  const handleAddPolishColor = () => {
    setActiveTab("add-polish-color");
  };

  const handleEditPolishColor = (polishColor: any) => {
    startEditPolishColor(polishColor);
    setActiveTab("edit-polish-color");
  };

  const handleCancelEditPolishColor = () => {
    cancelEditPolishColor();
    setActiveTab("polish-colors");
  };

  const handlePolishColorSaved = () => {
    setActiveTab("polish-colors");
  };

  // Discount handlers
  const handleAddDiscount = () => {
    resetDiscountForm();
    setActiveTab("add-discount");
  };

  const handleEditDiscount = (discount: any) => {
    startEditDiscount(discount);
    setActiveTab("edit-discount");
  };

  const handleCancelEditDiscount = () => {
    resetDiscountForm();
    setActiveTab("discounts");
  };

  const handleDiscountSaved = () => {
    setActiveTab("discounts");
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
    {
      id: "categories",
      label: "Categories",
      icon: Tag,
    },
    {
      id: "polish-colors",
      label: "Polish Colors",
      icon: Palette,
    },
    {
      id: "discounts",
      label: "Discounts",
      icon: Percent,
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
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                        activeTab === item.id || 
                        (item.id === "products" && (activeTab === "add-product" || activeTab === "edit-product")) ||
                        (item.id === "categories" && (activeTab === "add-category" || activeTab === "edit-category")) ||
                        (item.id === "polish-colors" && (activeTab === "add-polish-color" || activeTab === "edit-polish-color"))
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
                        setActiveTab(item.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                        activeTab === item.id || 
                        (item.id === "products" && (activeTab === "add-product" || activeTab === "edit-product")) ||
                        (item.id === "categories" && (activeTab === "add-category" || activeTab === "edit-category")) ||
                        (item.id === "polish-colors" && (activeTab === "add-polish-color" || activeTab === "edit-polish-color"))
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

              {activeTab === "categories" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-2xl">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">Categories</h1>
                    </div>
                  </div>
                  <div className="p-8">
                    <CategoriesTab
                      categories={categories}
                      loading={categoriesLoading}
                      deleteCategory={deleteCategory}
                      onAddCategory={handleAddCategory}
                      onEditCategory={handleEditCategory}
                    />
                  </div>
                </div>
              )}

              {activeTab === "polish-colors" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-2xl">
                        <Palette className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">Polish Colors</h1>
                    </div>
                  </div>
                  <div className="p-8">
                    <PolishColorsTab
                      polishColors={polishColors}
                      loading={polishColorsLoading}
                      deletePolishColor={deletePolishColor}
                      onAddPolishColor={handleAddPolishColor}
                      onEditPolishColor={handleEditPolishColor}
                    />
                  </div>
                </div>
              )}

              {activeTab === "discounts" && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-2xl">
                        <Percent className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">Discounts</h1>
                    </div>
                  </div>
                  <div className="p-8">
                    <DiscountsTab 
                      onAddDiscount={handleAddDiscount}
                      onEditDiscount={handleEditDiscount}
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

              {(activeTab === "add-category" || activeTab === "edit-category") && (
                <AddEditCategoryForm
                  formData={categoryFormData}
                  setFormData={setCategoryFormData}
                  editingCategory={editingCategory}
                  addCategory={async (e: React.FormEvent) => {
                    try {
                      await addCategory(e);
                      handleCategorySaved();
                    } catch (error) {
                      console.error("Failed to add category:", error);
                    }
                  }}
                  updateCategory={async (e: React.FormEvent) => {
                    try {
                      await updateCategory(e);
                      handleCategorySaved();
                    } catch (error) {
                      console.error("Failed to update category:", error);
                    }
                  }}
                  cancelEdit={handleCancelEditCategory}
                  loading={categoriesLoading}
                />
              )}

              {(activeTab === "add-polish-color" || activeTab === "edit-polish-color") && (
                <AddEditPolishColorForm
                  formData={polishColorFormData}
                  setFormData={setPolishColorFormData}
                  editingPolishColor={editingPolishColor}
                  addPolishColor={async (e: React.FormEvent) => {
                    try {
                      await addPolishColor(e);
                      handlePolishColorSaved();
                    } catch (error) {
                      console.error("Failed to add polish color:", error);
                    }
                  }}
                  updatePolishColor={async (e: React.FormEvent) => {
                    try {
                      await updatePolishColor(e);
                      handlePolishColorSaved();
                    } catch (error) {
                      console.error("Failed to update polish color:", error);
                    }
                  }}
                  cancelEdit={handleCancelEditPolishColor}
                  loading={polishColorsLoading}
                />
              )}

              {(activeTab === "add-discount" || activeTab === "edit-discount") && (
                <AddEditDiscountForm
                  formData={discountFormData}
                  updateFormData={updateDiscountFormData}
                  onSubmit={async (e: React.FormEvent) => {
                    try {
                      if (editingDiscount) {
                        await updateDiscount(e);
                      } else {
                        await addDiscount(e);
                      }
                      handleDiscountSaved();
                    } catch (error) {
                      console.error("Failed to save discount:", error);
                    }
                  }}
                  onCancel={handleCancelEditDiscount}
                  loading={discountsLoading}
                  editingDiscount={editingDiscount}
                  categories={discountCategories}
                  products={discountProducts}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}