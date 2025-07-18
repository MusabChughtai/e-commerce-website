"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Tag, Calendar, DollarSign, Percent, Truck, Globe, Package, Users, ArrowLeft, Plus, Edit3, Search, ChevronDown, ChevronUp, Image as ImageIcon, RotateCcw } from "lucide-react";
import { DiscountFormData } from "../hooks/useDiscounts";
import { ConfirmationModal } from "./ConfirmationModal";

interface AddEditDiscountFormProps {
  formData: DiscountFormData;
  updateFormData: (field: keyof DiscountFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  editingDiscount: any;
  categories: any[];
  products: any[];
}

export function AddEditDiscountForm({
  formData,
  updateFormData,
  onSubmit,
  onCancel,
  loading,
  editingDiscount,
  categories,
  products,
}: AddEditDiscountFormProps) {
  // State for product grid view
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    type: 'save' | 'discard';
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    type: 'save',
    title: '',
    description: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });
  
  // Helper functions for product grid
  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  const getFilteredProducts = (categoryId?: number) => {
    let filteredProducts = products;
    
    // Filter by category if specified
    if (categoryId !== undefined) {
      filteredProducts = products.filter(product => product.category_id === categoryId);
    }
    
    // Filter by search term (product name or ID)
    if (productSearchTerm.trim()) {
      const searchTerm = productSearchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => {
        const productName = product.name.toLowerCase();
        const productId = product.id.toString().toLowerCase();
        
        // Check if search term matches product name or product ID
        return productName.includes(searchTerm) || 
               productId.includes(searchTerm);
      });
    }
    
    return filteredProducts;
  };
  
  const getCategoriesWithProducts = () => {
    return categories.filter(category => {
      const categoryProducts = getFilteredProducts(category.id);
      return categoryProducts.length > 0;
    });
  };
  
  const getProductImageUrl = (product: any) => {
    // Check if product has images
    if (!product.product_images || product.product_images.length === 0) {
      return null;
    }
    
    // Find primary image first
    const primaryImage = product.product_images.find((img: any) => img.is_primary);
    if (primaryImage) {
      return primaryImage.public_url || primaryImage.image_url;
    }
    
    // Fall back to first image
    const firstImage = product.product_images[0];
    return firstImage.public_url || firstImage.image_url;
  };
  
  const discountTypeOptions = [
    { value: "percent", label: "Percentage", icon: Percent, description: "Discount as percentage (e.g., 10%)" },
    { value: "money", label: "Fixed Amount", icon: DollarSign, description: "Fixed amount in PKR (e.g., ₨100)" },
    { value: "free_shipping", label: "Free Shipping", icon: Truck, description: "Free shipping discount" },
    { value: "coupon", label: "Coupon", icon: Tag, description: "Coupon code discount" },
  ];

  const scopeOptions = [
    { value: "all_items", label: "All Items", icon: Globe, description: "Apply to all products" },
    { value: "categories", label: "Categories", icon: Users, description: "Apply to specific categories" },
    { value: "products", label: "Products", icon: Package, description: "Apply to specific products" },
    { value: "coupon", label: "Coupon", icon: Tag, description: "Coupon code based discount" },
  ];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const isValid = () => {
    if (!formData.name.trim()) return false;
    if (!formData.start_date || !formData.end_date) return false;
    if (new Date(formData.start_date) >= new Date(formData.end_date)) return false;
    if (formData.discount_type === 'coupon' && !formData.coupon_code.trim()) return false;
    if (formData.discount_type === 'coupon' && !formData.coupon_discount_type) return false;
    if (formData.discount_type === 'coupon' && formData.coupon_discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) return false;
    if (formData.discount_type === 'coupon' && formData.coupon_discount_type === 'money' && formData.discount_value < 0) return false;
    
    // Validate discount value for all items scope
    if (formData.discount_type !== 'free_shipping' && formData.discount_type !== 'coupon' && formData.scope === 'all_items') {
      if (formData.discount_value <= 0) return false;
      if (formData.discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) return false;
      if (formData.discount_type === 'money' && formData.discount_value < 0) return false;
    }
    
    if (formData.scope === 'categories' && formData.selected_categories.length === 0) return false;
    if (formData.scope === 'products' && formData.selected_products.length === 0) return false;
    
    // Validate category-specific discount values
    if (formData.scope === 'categories') {
      for (const category of formData.selected_categories) {
        if (formData.discount_type === 'percent' && (category.discount_value < 0 || category.discount_value > 100)) return false;
        if (formData.discount_type === 'money' && category.discount_value < 0) return false;
      }
    }
    
    // Validate product-specific discount values
    if (formData.scope === 'products') {
      for (const product of formData.selected_products) {
        if (formData.discount_type === 'percent' && (product.discount_value < 0 || product.discount_value > 100)) return false;
        if (formData.discount_type === 'money' && product.discount_value < 0) return false;
      }
    }
    
    return true;
  };

  const handleDiscountTypeChange = (newType: string) => {
    updateFormData("discount_type", newType);
    // Automatically set scope to 'coupon' when discount type is 'coupon'
    if (newType === 'coupon') {
      updateFormData("scope", "coupon");
    } else if (formData.scope === 'coupon') {
      // Reset scope if changing away from coupon type
      updateFormData("scope", "all_items");
    }
  };

  // Modal handlers
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) {
      onSubmit(e);
      return;
    }

    const config = {
      type: 'save' as const,
      title: editingDiscount ? 'Update Discount' : 'Create Discount',
      description: editingDiscount 
        ? 'Are you sure you want to update this discount? The changes will be applied immediately.' 
        : 'Are you sure you want to create this discount? It will be available according to the dates you specified.',
      confirmText: editingDiscount ? 'Update Discount' : 'Create Discount',
      cancelText: 'Continue Editing',
      onConfirm: async () => {
        try {
          await onSubmit(e);
          setShowConfirmModal(false);
        } catch (error) {
          console.error("Failed to save discount:", error);
          // Keep modal open on error
        }
      }
    };

    setConfirmModalConfig(config);
    setShowConfirmModal(true);
  };

  const handleCancelClick = () => {
    // Check if form has any data
    const isFormEmpty = () => {
      return !formData.name.trim() && 
             !formData.description.trim() && 
             formData.discount_type === 'percent' && 
             formData.scope === 'all_items' && 
             formData.selected_products.length === 0 && 
             formData.selected_categories.length === 0;
    };

    // If form is empty, just cancel without modal
    if (!editingDiscount && isFormEmpty()) {
      onCancel();
      return;
    }

    // Show confirmation modal for any changes
    const config = {
      type: 'discard' as const,
      title: 'Discard Changes',
      description: 'Are you sure you want to discard all your changes? This action cannot be undone and you will lose all unsaved progress.',
      confirmText: 'Discard Changes',
      cancelText: 'Continue Editing',
      onConfirm: () => {
        setShowConfirmModal(false);
        onCancel();
      }
    };

    setConfirmModalConfig(config);
    setShowConfirmModal(true);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-2xl">
              {editingDiscount ? (
                <Edit3 className="h-6 w-6 text-white" />
              ) : (
                <Plus className="h-6 w-6 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {editingDiscount ? "Edit Discount" : "Add New Discount"}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleCancelClick}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="p-8">
        <Card className="border-gray-200/50 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-[#23423d]/10 to-[#1e3b36]/10 rounded-2xl">
                <Tag className="h-5 w-5 text-[#23423d]" />
              </div>
              <CardTitle className="text-[#23423d]">Discount Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveClick} className="space-y-6">
              {/* Fixed Top Section - Always Visible */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Discount Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="e.g., Summer Sale"
                      required
                      className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      placeholder="Brief description of the discount..."
                      className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => updateFormData("start_date", e.target.value)}
                      min={getTodayDate()}
                      required
                      className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    />
                    <p className="text-xs text-gray-500">When the discount becomes active</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => updateFormData("end_date", e.target.value)}
                      min={formData.start_date || getTodayDate()}
                      required
                      className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    />
                    <p className="text-xs text-gray-500">Must be after start date</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => updateFormData("is_active", checked)}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</Label>
                </div>

                {/* Discount Type Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Discount Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {discountTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.value}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                            formData.discount_type === option.value
                              ? "border-[#23423d] bg-[#23423d]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleDiscountTypeChange(option.value)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-[#23423d]" />
                            <span className="font-medium text-gray-900">{option.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

          {/* Dynamic Section - Only shows when discount type is selected */}
          {formData.discount_type && (
            <div className="space-y-6">
              {/* Coupon Specific Fields */}
              {formData.discount_type === 'coupon' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Coupon Discount Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 border rounded-2xl cursor-pointer transition-all ${
                          formData.coupon_discount_type === 'percent'
                            ? "border-[#23423d] bg-[#23423d]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updateFormData("coupon_discount_type", "percent")}
                      >
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-[#23423d]" />
                          <span className="font-medium text-gray-900">Percentage</span>
                        </div>
                      </div>
                      <div
                        className={`p-3 border rounded-2xl cursor-pointer transition-all ${
                          formData.coupon_discount_type === 'money'
                            ? "border-[#23423d] bg-[#23423d]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updateFormData("coupon_discount_type", "money")}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#23423d]" />
                          <span className="font-medium text-gray-900">Fixed Amount</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code and Discount Value Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coupon_code" className="text-sm font-medium text-gray-700">Coupon Code</Label>
                      <Input
                        id="coupon_code"
                        value={formData.coupon_code}
                        onChange={(e) => updateFormData("coupon_code", e.target.value.toUpperCase())}
                        placeholder="e.g., SAVE10"
                        required
                        className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                      />
                    </div>

                    {formData.coupon_discount_type && (
                      <div className="space-y-2">
                        <Label htmlFor="coupon_discount_value" className="text-sm font-medium text-gray-700">
                          Discount Value {formData.coupon_discount_type === 'percent' ? '(%)' : '(₨)'}
                        </Label>
                        <Input
                          id="coupon_discount_value"
                          type="number"
                          value={formData.discount_value || ""}
                          onChange={(e) => updateFormData("discount_value", e.target.value ? parseFloat(e.target.value) : 0)}
                          placeholder={formData.coupon_discount_type === 'percent' ? "10" : "100"}
                          min="0"
                          max={formData.coupon_discount_type === 'percent' ? "100" : undefined}
                          step="1"
                          required
                          className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage_limit" className="text-sm font-medium text-gray-700">Usage Limit (Optional)</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit || ""}
                      onChange={(e) => updateFormData("usage_limit", e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="e.g., 100 (leave empty for unlimited)"
                      min="1"
                      className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    />
                    <p className="text-sm text-gray-600">Maximum number of times this coupon can be used</p>
                  </div>
                </div>
              )}

              {/* Scope Selection - Only for non-coupon types */}
              {formData.discount_type !== 'coupon' && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Apply To</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {scopeOptions.filter(option => option.value !== 'coupon').map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.value}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                            formData.scope === option.value
                              ? "border-[#23423d] bg-[#23423d]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => updateFormData("scope", option.value)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-[#23423d]" />
                            <span className="font-medium text-gray-900">{option.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Discount Value for All Items */}
                  {formData.scope === 'all_items' && formData.discount_type !== 'free_shipping' && (
                    <div className="space-y-2">
                      <Label htmlFor="all_items_discount_value" className="text-sm font-medium text-gray-700">
                        Discount Value {formData.discount_type === 'percent' ? '(%)' : '(₨)'}
                      </Label>
                      <Input
                        id="all_items_discount_value"
                        type="number"
                        value={formData.discount_value || ""}
                        onChange={(e) => updateFormData("discount_value", e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder={formData.discount_type === 'percent' ? "10" : "100"}
                        min="0"
                        max={formData.discount_type === 'percent' ? "100" : undefined}
                        step="1"
                        required
                        className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                      />
                    </div>
                  )}

                  {/* Category Selection */}
                  {formData.scope === 'categories' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Select Categories with Discount Values</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.length === 0 ? (
                          <p className="text-gray-500 text-center py-4 col-span-full">No categories available</p>
                        ) : (
                          categories.map((category) => {
                            const isSelected = formData.selected_categories.some(c => c.id === category.id);
                            const selectedCategory = formData.selected_categories.find(c => c.id === category.id);
                            
                            return (
                              <div key={category.id} className="border border-gray-200 rounded-2xl p-3 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        const defaultValue = formData.discount_type === 'free_shipping' ? 0 : formData.discount_value;
                                        updateFormData("selected_categories", [
                                          ...formData.selected_categories,
                                          { id: category.id, discount_value: defaultValue }
                                        ]);
                                      } else {
                                        updateFormData("selected_categories", 
                                          formData.selected_categories.filter(c => c.id !== category.id)
                                        );
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`category-${category.id}`} className="text-sm font-medium text-gray-900">
                                    {category.name}
                                  </Label>
                                </div>
                                
                                {isSelected && formData.discount_type !== 'free_shipping' && (
                                  <div className="ml-6 flex items-center space-x-2">
                                    <Label className="text-xs text-gray-600">
                                      Discount Value {formData.discount_type === 'percent' ? '(%)' : '(₨)'}:
                                    </Label>
                                    <Input
                                      type="number"
                                      value={selectedCategory?.discount_value || ""}
                                      onChange={(e) => {
                                        const newValue = e.target.value ? parseFloat(e.target.value) : 0;
                                        updateFormData("selected_categories", 
                                          formData.selected_categories.map(c => 
                                            c.id === category.id ? { ...c, discount_value: newValue } : c
                                          )
                                        );
                                      }}
                                      className="w-20 text-xs border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                                      min="0"
                                      max={formData.discount_type === 'percent' ? "100" : undefined}
                                      step="1"
                                    />
                                    <span className="text-xs text-gray-500">
                                      {formData.discount_type === 'percent' ? '%' : '₨'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                      {formData.selected_categories.length > 0 && formData.discount_type !== 'free_shipping' && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-gray-50 rounded-2xl">
                          <span className="text-sm font-medium text-gray-700 mr-2">Selected:</span>
                          {formData.selected_categories.map((selectedCategory) => {
                            const category = categories.find(c => c.id === selectedCategory.id);
                            return (
                              <Badge key={selectedCategory.id} variant="secondary" className="text-sm bg-[#23423d]/10 text-[#23423d] border-[#23423d]/20 px-3 py-1">
                                {category?.name}: {selectedCategory.discount_value}
                                {formData.discount_type === 'percent' ? '%' : '₨'}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Selection - Grid View */}
                  {formData.scope === 'products' && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">Select Products with Discount Values</Label>
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by product name or ID..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-10 border-gray-200 rounded-xl focus:border-[#23423d] focus:ring-[#23423d]/20"
                        />
                      </div>

                      {/* Categories and Products Grid */}
                      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-2xl">
                        {productSearchTerm.trim() ? (
                          // Show flat product grid when searching
                          <div className="p-4">
                            {getFilteredProducts().length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No products found matching your search</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {getFilteredProducts().map((product) => {
                                  const isSelected = formData.selected_products.some(p => p.id === product.id);
                                  const selectedProduct = formData.selected_products.find(p => p.id === product.id);
                                  const imageUrl = getProductImageUrl(product);
                                  
                                  return (
                                    <div key={product.id} className={`border rounded-xl p-3 transition-all ${
                                      isSelected 
                                        ? 'border-[#23423d] bg-[#23423d]/5' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                      {/* Product Image */}
                                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {imageUrl ? (
                                          <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const parent = target.parentElement;
                                              if (parent && !parent.querySelector('.fallback-icon')) {
                                                const fallback = document.createElement('div');
                                                fallback.className = 'fallback-icon w-full h-full flex items-center justify-center';
                                                fallback.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                                parent.appendChild(fallback);
                                              }
                                            }}
                                          />
                                        ) : (
                                          <ImageIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                      </div>

                                      {/* Product Info */}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <Checkbox
                                            id={`product-${product.id}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                const defaultValue = formData.discount_type === 'free_shipping' ? 0 : formData.discount_value;
                                                updateFormData("selected_products", [
                                                  ...formData.selected_products,
                                                  { id: product.id, discount_value: defaultValue }
                                                ]);
                                              } else {
                                                updateFormData("selected_products", 
                                                  formData.selected_products.filter(p => p.id !== product.id)
                                                );
                                              }
                                            }}
                                          />
                                          <Badge variant="outline" className="text-xs">
                                            ID: {product.id}
                                          </Badge>
                                        </div>
                                        
                                        <h4 className="text-sm font-medium text-gray-900 overflow-hidden" style={{
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical' as any
                                        }}>
                                          {product.name}
                                        </h4>

                                        {/* Discount Value Input */}
                                        {isSelected && formData.discount_type !== 'free_shipping' && (
                                          <div className="space-y-1">
                                            <Label className="text-xs text-gray-600">
                                              Discount {formData.discount_type === 'percent' ? '(%)' : '(₨)'}
                                            </Label>
                                            <div className="flex items-center space-x-1">
                                              <Input
                                                type="number"
                                                value={selectedProduct?.discount_value || ""}
                                                onChange={(e) => {
                                                  const newValue = e.target.value ? parseFloat(e.target.value) : 0;
                                                  updateFormData("selected_products", 
                                                    formData.selected_products.map(p => 
                                                      p.id === product.id ? { ...p, discount_value: newValue } : p
                                                    )
                                                  );
                                                }}
                                                className="text-xs border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                                                min="0"
                                                max={formData.discount_type === 'percent' ? "100" : undefined}
                                                step="1"
                                              />
                                              <span className="text-xs text-gray-500">
                                                {formData.discount_type === 'percent' ? '%' : '₨'}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Show category-organized view when not searching
                          getCategoriesWithProducts().length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No products found matching your search</p>
                            </div>
                          ) : (
                            <div className="space-y-4 p-4">
                              {getCategoriesWithProducts().map((category) => {
                                const isExpanded = expandedCategories.has(category.id);
                                const categoryProducts = getFilteredProducts(category.id);
                                
                                return (
                                  <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Category Header */}
                                    <button
                                      type="button"
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Users className="h-4 w-4 text-[#23423d]" />
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {categoryProducts.length} products
                                        </Badge>
                                      </div>
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-gray-600" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-600" />
                                      )}
                                    </button>

                                    {/* Products Grid */}
                                    {isExpanded && (
                                      <div className="p-4 bg-white">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                          {categoryProducts.map((product) => {
                                            const isSelected = formData.selected_products.some(p => p.id === product.id);
                                            const selectedProduct = formData.selected_products.find(p => p.id === product.id);
                                            const imageUrl = getProductImageUrl(product);
                                            
                                            return (
                                              <div key={product.id} className={`border rounded-xl p-3 transition-all ${
                                                isSelected 
                                                  ? 'border-[#23423d] bg-[#23423d]/5' 
                                                  : 'border-gray-200 hover:border-gray-300'
                                              }`}>
                                                {/* Product Image */}
                                                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                  {imageUrl ? (
                                                    <img
                                                      src={imageUrl}
                                                      alt={product.name}
                                                      className="w-full h-full object-cover"
                                                      onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                                          const fallback = document.createElement('div');
                                                          fallback.className = 'fallback-icon w-full h-full flex items-center justify-center';
                                                          fallback.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                                          parent.appendChild(fallback);
                                                        }
                                                      }}
                                                    />
                                                  ) : (
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                  )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <Checkbox
                                                      id={`product-${product.id}`}
                                                      checked={isSelected}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          const defaultValue = formData.discount_type === 'free_shipping' ? 0 : formData.discount_value;
                                                          updateFormData("selected_products", [
                                                            ...formData.selected_products,
                                                            { id: product.id, discount_value: defaultValue }
                                                          ]);
                                                        } else {
                                                          updateFormData("selected_products", 
                                                            formData.selected_products.filter(p => p.id !== product.id)
                                                          );
                                                        }
                                                      }}
                                                    />
                                                    <Badge variant="outline" className="text-xs">
                                                      ID: {product.id}
                                                    </Badge>
                                                  </div>
                                                  
                                                  <h4 className="text-sm font-medium text-gray-900 overflow-hidden" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical' as any
                                                  }}>
                                                    {product.name}
                                                  </h4>

                                                  {/* Discount Value Input */}
                                                  {isSelected && formData.discount_type !== 'free_shipping' && (
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-gray-600">
                                                        Discount {formData.discount_type === 'percent' ? '(%)' : '(₨)'}
                                                      </Label>
                                                      <div className="flex items-center space-x-1">
                                                        <Input
                                                          type="number"
                                                          value={selectedProduct?.discount_value || ""}
                                                          onChange={(e) => {
                                                            const newValue = e.target.value ? parseFloat(e.target.value) : 0;
                                                            updateFormData("selected_products", 
                                                              formData.selected_products.map(p => 
                                                                p.id === product.id ? { ...p, discount_value: newValue } : p
                                                              )
                                                            );
                                                          }}
                                                          className="text-xs border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                                                          min="0"
                                                          max={formData.discount_type === 'percent' ? "100" : undefined}
                                                          step="1"
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                          {formData.discount_type === 'percent' ? '%' : '₨'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )
                        )}
                      </div>

                      {/* Selected Products Summary */}
                      {formData.selected_products.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">
                              Selected Products ({formData.selected_products.length})
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateFormData("selected_products", [])}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.selected_products.map((selectedProduct) => {
                              const product = products.find(p => p.id === selectedProduct.id);
                              return (
                                <Badge 
                                  key={selectedProduct.id} 
                                  variant="secondary" 
                                  className="text-xs bg-[#23423d]/10 text-[#23423d] border-[#23423d]/20 px-3 py-1"
                                >
                                  {product?.name} (ID: {selectedProduct.id})
                                  {formData.discount_type !== 'free_shipping' && (
                                    <>: {selectedProduct.discount_value}
                                    {formData.discount_type === 'percent' ? '%' : '₨'}</>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateFormData("selected_products", 
                                        formData.selected_products.filter(p => p.id !== selectedProduct.id)
                                      );
                                    }}
                                    className="ml-2 text-[#23423d]/60 hover:text-[#23423d]"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={!isValid()}
              className="flex-1 bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {editingDiscount ? (
                <Edit3 className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {editingDiscount ? "Update Discount" : "Add Discount"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelClick}
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setShowConfirmModal(false)}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        loading={loading}
      />
</div>
  );
}
