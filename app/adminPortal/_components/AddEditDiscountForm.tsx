"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Tag, Calendar, DollarSign, Percent, Truck, Globe, Package, Users, ArrowLeft, Plus, Edit3 } from "lucide-react";
import { DiscountFormData } from "../hooks/useDiscounts";

interface AddEditDiscountFormProps {
  formData: DiscountFormData;
  updateFormData: (field: keyof DiscountFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
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
            onClick={onCancel}
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
            <form onSubmit={onSubmit} className="space-y-6">
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

                  {/* Product Selection */}
                  {formData.scope === 'products' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Select Products with Discount Values</Label>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-2xl p-4">
                        {products.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No products available</p>
                        ) : (
                          <div className="space-y-3">
                            {products.map((product) => {
                              const isSelected = formData.selected_products.some(p => p.id === product.id);
                              const selectedProduct = formData.selected_products.find(p => p.id === product.id);
                              
                              return (
                                <div key={product.id} className="border border-gray-200 rounded-2xl p-3 space-y-2">
                                  <div className="flex items-center space-x-2">
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
                                    <Label htmlFor={`product-${product.id}`} className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </Label>
                                  </div>
                                  
                                  {isSelected && formData.discount_type !== 'free_shipping' && (
                                    <div className="ml-6 flex items-center space-x-2">
                                      <Label className="text-xs text-gray-600">
                                        Discount Value {formData.discount_type === 'percent' ? '(%)' : '(₨)'}:
                                      </Label>
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
                            })}
                          </div>
                        )}
                      </div>
                      {formData.selected_products.length > 0 && formData.discount_type !== 'free_shipping' && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-gray-50 rounded-2xl">
                          <span className="text-sm font-medium text-gray-700 mr-2">Selected:</span>
                          {formData.selected_products.map((selectedProduct) => {
                            const product = products.find(p => p.id === selectedProduct.id);
                            return (
                              <Badge key={selectedProduct.id} variant="secondary" className="text-sm bg-[#23423d]/10 text-[#23423d] border-[#23423d]/20 px-3 py-1">
                                {product?.name}: {selectedProduct.discount_value}
                                {formData.discount_type === 'percent' ? '%' : '₨'}
                              </Badge>
                            );
                          })}
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
              disabled={loading || !isValid()}
              className="flex-1 bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingDiscount ? "Updating..." : "Adding..."}
                </div>
              ) : (
                <>
                  {editingDiscount ? (
                    <Edit3 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingDiscount ? "Update Discount" : "Add Discount"}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
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
</div>
  );
}
