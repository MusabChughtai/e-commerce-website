"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Plus, 
  Calendar, 
  DollarSign, 
  Percent, 
  Truck, 
  Globe, 
  Users, 
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { useDiscounts } from "../hooks/useDiscounts";
import { Discount } from "../types";

interface DiscountsTabProps {
  onAddDiscount: () => void;
  onEditDiscount: (discount: any) => void;
}

export function DiscountsTab({ onAddDiscount, onEditDiscount }: DiscountsTabProps) {
  const {
    discounts,
    loading,
    deleteDiscount,
    toggleDiscountStatus,
  } = useDiscounts();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterType, setFilterType] = useState<"all" | "percent" | "money" | "free_shipping" | "coupon">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [expandedProductLists, setExpandedProductLists] = useState<Set<string>>(new Set());

  const getCouponInfo = (discount: Discount) => {
    if (discount.discount_type === 'coupon') {
      const couponData = (discount as any).discount_coupons;
      
      let coupon = null;
      // Check if coupon data is an array
      if (Array.isArray(couponData) && couponData.length > 0) {
        coupon = couponData[0];
      }
      // Check if coupon data is a single object
      else if (couponData && typeof couponData === 'object') {
        coupon = couponData;
      }
      
      if (coupon) {
        return {
          code: coupon.coupon_code || '',
          discountType: coupon.coupon_discount_type || 'percent',
          usageLimit: coupon.usage_limit,
          usageCount: coupon.usage_count || 0
        };
      }
    }
    return null;
  };

  // Filter discounts based on search and filters
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = 
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (() => {
        const couponInfo = getCouponInfo(discount);
        return couponInfo?.code?.toLowerCase().includes(searchTerm.toLowerCase());
      })();
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && discount.is_active) ||
      (filterStatus === "inactive" && !discount.is_active);
    
    const matchesType = 
      filterType === "all" || discount.discount_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percent":
        return <Percent className="h-4 w-4" />;
      case "money":
        return <DollarSign className="h-4 w-4" />;
      case "free_shipping":
        return <Truck className="h-4 w-4" />;
      case "coupon":
        return <Tag className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "all_items":
        return <Globe className="h-4 w-4" />;
      case "categories":
        return <Users className="h-4 w-4" />;
      case "products":
        return <Package className="h-4 w-4" />;
      case "coupon":
        return <Tag className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    // Handle coupon discounts
    if (discount.discount_type === 'coupon') {
      const couponData = (discount as any).discount_coupons;
      
      // Check if coupon data is an array
      if (Array.isArray(couponData) && couponData.length > 0) {
        const coupon = couponData[0];
        if (coupon && coupon.discount_value !== undefined) {
          const value = coupon.discount_value;
          const type = coupon.coupon_discount_type;
          return type === 'percent' ? `${value}%` : `₨${value}`;
        }
      }
      // Check if coupon data is a single object
      else if (couponData && typeof couponData === 'object' && couponData.discount_value !== undefined) {
        const value = couponData.discount_value;
        const type = couponData.coupon_discount_type;
        return type === 'percent' ? `${value}%` : `₨${value}`;
      }
      
      return "No coupon data";
    }
    
    // Handle free shipping
    if (discount.discount_type === 'free_shipping') {
      return "Free Shipping";
    }
    
    // Handle all items discounts
    if (discount.scope === 'all_items') {
      const allItemsData = (discount as any).discount_all_items;
      
      // Check if it's an array with items
      if (Array.isArray(allItemsData) && allItemsData.length > 0) {
        const firstItem = allItemsData[0];
        if (firstItem && firstItem.discount_value !== undefined) {
          const value = firstItem.discount_value;
          return discount.discount_type === 'percent' ? `${value}%` : `₨${value}`;
        }
      }
      // Check if it's a single object (not array)
      else if (allItemsData && typeof allItemsData === 'object' && allItemsData.discount_value !== undefined) {
        const value = allItemsData.discount_value;
        return discount.discount_type === 'percent' ? `${value}%` : `₨${value}`;
      }
      
      // If no data found, it means the discount_all_items record is missing
      return "Missing data";
    }
    
    // Handle categories discounts
    if (discount.scope === 'categories') {
      const categoryData = (discount as any).discount_categories?.[0];
      if (categoryData && categoryData.discount_value !== undefined) {
        const value = categoryData.discount_value;
        return discount.discount_type === 'percent' ? `${value}%` : `₨${value}`;
      }
      return "Variable";
    }
    
    // Handle products discounts
    if (discount.scope === 'products') {
      const productData = (discount as any).discount_products?.[0];
      if (productData && productData.discount_value !== undefined) {
        const value = productData.discount_value;
        return discount.discount_type === 'percent' ? `${value}%` : `₨${value}`;
      }
      return "Variable";
    }
    
    return "N/A";
  };

  const getDiscountStatus = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);
    
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    if (!discount.is_active) return { label: "Inactive", color: "bg-gray-500" };
    if (now < startDate) return { label: "Scheduled", color: "bg-blue-500" };
    if (now > endDate) return { label: "Expired", color: "bg-red-500" };
    return { label: "Active", color: "bg-green-500" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (discount: Discount) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (discountToDelete) {
      await deleteDiscount(discountToDelete.id);
      setShowDeleteModal(false);
      setDiscountToDelete(null);
    }
  };

  const handleEditClick = (discount: Discount) => {
    onEditDiscount(discount);
  };

  const handleAddClick = () => {
    onAddDiscount();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleProductList = (discountId: string) => {
    const newExpanded = new Set(expandedProductLists);
    if (newExpanded.has(discountId)) {
      newExpanded.delete(discountId);
    } else {
      newExpanded.add(discountId);
    }
    setExpandedProductLists(newExpanded);
  };

  // Statistics
  const stats = {
    total: discounts.length,
    active: discounts.filter(d => {
      if (!d.is_active) return false;
      const now = new Date();
      const startDate = new Date(d.start_date);
      const endDate = new Date(d.end_date);
      
      // Set time to start of day for accurate comparison
      now.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return now >= startDate && now <= endDate;
    }).length,
    scheduled: discounts.filter(d => {
      if (!d.is_active) return false;
      const now = new Date();
      const startDate = new Date(d.start_date);
      
      // Set time to start of day for accurate comparison
      now.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
      return now < startDate;
    }).length,
    expired: discounts.filter(d => {
      const now = new Date();
      const endDate = new Date(d.end_date);
      
      // Set time to start of day for accurate comparison
      now.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return now > endDate;
    }).length,
  };

  return (
    <div className="space-y-8">
      {/* Search bar and Add button */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search discounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 rounded-xl h-12 bg-white shadow-sm focus:border-[#23423d] focus:ring-[#23423d]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {filteredDiscounts.length} discount{filteredDiscounts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full p-2 border border-gray-200 rounded-xl h-12 bg-white shadow-sm focus:border-[#23423d] focus:ring-[#23423d]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full p-2 border border-gray-200 rounded-xl h-12 bg-white shadow-sm focus:border-[#23423d] focus:ring-[#23423d]"
            >
              <option value="all">All Types</option>
              <option value="percent">Percentage</option>
              <option value="money">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="coupon">Coupon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Grid */}
      {loading ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#23423d] rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discounts...</p>
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-12 text-center">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm ? "No discounts found" : "No discounts yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Create your first discount to get started"
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscounts.map((discount) => {
            const status = getDiscountStatus(discount);
            const discountCategories = (discount as any).discount_categories || [];
            const discountProducts = (discount as any).discount_products || [];
            
            return (
              <Card key={discount.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-gray-200/60 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="p-3 bg-gradient-to-br from-[#23423d] to-[#1e3b36] rounded-2xl shadow-lg transform transition-transform group-hover:scale-105">
                            <div className="text-white">
                              {getDiscountIcon(discount.discount_type)}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-12 flex items-center justify-center">
                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-[#23423d] transition-all duration-300 tracking-tight leading-6 line-clamp-2 text-center">
                              {discount.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch
                          checked={discount.is_active}
                          onCheckedChange={(checked) => toggleDiscountStatus(discount.id, checked)}
                          disabled={loading}
                          className="data-[state=checked]:bg-[#23423d]"
                        />
                      </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="mb-4">
                      <Badge className={`${status.color} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm w-full text-center justify-center`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(discount.start_date)} - {formatDate(discount.end_date)}</span>
                    </div>

                    {/* Show remaining time for active discounts */}
                    {status.label === 'Active' && (() => {
                      const now = new Date();
                      const endDate = new Date(discount.end_date);
                      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` : 'Expires today'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Show scheduled start time */}
                    {status.label === 'Scheduled' && (() => {
                      const now = new Date();
                      const startDate = new Date(discount.start_date);
                      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {daysUntilStart > 0 ? `Starts in ${daysUntilStart} day${daysUntilStart > 1 ? 's' : ''}` : 'Starts today'}
                          </span>
                        </div>
                      );
                    })(                    )}

                    {/* Show discount value */}
                    <div className="p-3 bg-gradient-to-r from-[#23423d]/5 to-[#1e3b36]/5 rounded-lg border border-[#23423d]/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-[#23423d]">Discount Type:</p>
                        <div className="flex items-center gap-1">
                          {getDiscountIcon(discount.discount_type)}
                          <span className="text-xs text-[#23423d]/80 capitalize">
                            {discount.discount_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {discount.discount_type !== 'free_shipping' && discount.scope === 'all_items' && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-[#23423d]">
                            {formatDiscountValue(discount)}
                          </span>
                        </div>
                      )}
                      
                      {/* Show additional details based on discount type */}
                      {discount.scope === 'all_items' && discount.discount_type !== 'free_shipping' && (
                        <div className="mt-2 text-xs text-[#23423d]/80">
                          <span className="font-medium">Applies to:</span> All items in store
                        </div>
                      )}
                      
                      {discount.scope === 'categories' && discountCategories.length > 0 && discount.discount_type !== 'free_shipping' && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleProductList(discount.id)}
                            className="flex items-center justify-between w-full text-xs text-[#23423d]/80 hover:text-[#23423d] transition-colors"
                          >
                            <span className="font-medium">
                              Applies to: {discountCategories.length} categor{discountCategories.length !== 1 ? 'ies' : 'y'}
                            </span>
                            {expandedProductLists.has(discount.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          
                          {expandedProductLists.has(discount.id) && (
                            <div className="mt-2 max-h-32 overflow-y-auto border border-[#23423d]/20 rounded-lg bg-white/50">
                              {discountCategories.map((dc: any, index: number) => (
                                <div 
                                  key={dc.id || index} 
                                  className="flex items-center justify-between px-3 py-2 border-b border-[#23423d]/10 last:border-b-0 text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#23423d] truncate">
                                      {dc.categories?.name || 'Unknown Category'}
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs bg-[#23423d]/5 border-[#23423d]/30 text-[#23423d]">
                                      {discount.discount_type === 'percent' ? `${dc.discount_value}%` : `₨${dc.discount_value}`}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {discount.scope === 'products' && discountProducts.length > 0 && discount.discount_type !== 'free_shipping' && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleProductList(discount.id)}
                            className="flex items-center justify-between w-full text-xs text-[#23423d]/80 hover:text-[#23423d] transition-colors"
                          >
                            <span className="font-medium">
                              Applies to: {discountProducts.length} product{discountProducts.length !== 1 ? 's' : ''}
                            </span>
                            {expandedProductLists.has(discount.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          
                          {expandedProductLists.has(discount.id) && (
                            <div className="mt-2 max-h-32 overflow-y-auto border border-[#23423d]/20 rounded-lg bg-white/50">
                              {discountProducts.map((dp: any, index: number) => (
                                <div 
                                  key={dp.id || index} 
                                  className="flex items-center justify-between px-3 py-2 border-b border-[#23423d]/10 last:border-b-0 text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#23423d] truncate">
                                      {dp.products?.name || 'Unknown Product'}
                                    </div>
                                    <div className="text-[#23423d]/60 text-xs">
                                      ID: {dp.products?.id || dp.product_id || 'N/A'}
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs bg-[#23423d]/5 border-[#23423d]/30 text-[#23423d]">
                                      {discount.discount_type === 'percent' ? `${dp.discount_value}%` : `₨${dp.discount_value}`}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {discount.discount_type === 'free_shipping' && (
                        <div className="text-xs text-[#23423d]/80">
                          <span className="font-medium">Applies to:</span> All eligible orders
                          {discount.scope === 'categories' && discountCategories.length > 0 && (
                            <span className="block mt-1">
                              <span className="font-medium">Categories:</span> {discountCategories.map((dc: any) => dc.categories?.name).filter(Boolean).join(', ')}
                            </span>
                          )}
                          {discount.scope === 'products' && discountProducts.length > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleProductList(discount.id)}
                                className="flex items-center justify-between w-full text-xs text-[#23423d]/80 hover:text-[#23423d] transition-colors"
                              >
                                <span className="font-medium">
                                  Products: {discountProducts.length} item{discountProducts.length !== 1 ? 's' : ''}
                                </span>
                                {expandedProductLists.has(discount.id) ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                              
                              {expandedProductLists.has(discount.id) && (
                                <div className="mt-2 max-h-32 overflow-y-auto border border-[#23423d]/20 rounded-lg bg-white/50">
                                  {discountProducts.map((dp: any, index: number) => (
                                    <div 
                                      key={dp.id || index} 
                                      className="flex items-center justify-between px-3 py-2 border-b border-[#23423d]/10 last:border-b-0 text-xs"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#23423d] truncate">
                                          {dp.products?.name || 'Unknown Product'}
                                        </div>
                                        <div className="text-[#23423d]/60 text-xs">
                                          ID: {dp.products?.id || dp.product_id || 'N/A'}
                                        </div>
                                      </div>
                                      <div className="ml-2 flex-shrink-0">
                                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                          Free Shipping
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {discount.discount_type === 'coupon' && (() => {
                        const couponInfo = getCouponInfo(discount);
                        return couponInfo ? (
                          <div className="mt-2">
                            <div className="p-3 bg-white/50 rounded-lg border border-[#23423d]/10 mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-[#23423d]">Coupon Code:</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(couponInfo.code)}
                                  className="h-6 w-6 p-0 text-[#23423d] hover:text-[#23423d]/80 hover:bg-[#23423d]/10"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <Badge variant="outline" className="text-sm font-mono bg-[#23423d]/5 border-[#23423d]/30 text-[#23423d] mb-2 w-full text-center justify-center">
                                {couponInfo.code}
                              </Badge>
                              {couponInfo.usageLimit && (
                                <div className="mt-2">
                                  <div className="w-full bg-[#23423d]/20 rounded-full h-2 mb-1">
                                    <div 
                                      className="bg-[#23423d] h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${(couponInfo.usageCount / couponInfo.usageLimit) * 100}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-[#23423d]/80 text-center">
                                    Usage: {couponInfo.usageCount} / {couponInfo.usageLimit} ({Math.round((couponInfo.usageCount / couponInfo.usageLimit) * 100)}%)
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#23423d]/80 mb-2">
                              <span className="font-medium">Coupon Type:</span>
                              <span>{couponInfo.discountType === 'percent' ? 'Percentage' : 'Fixed Amount'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#23423d]/80">
                              <span className="font-medium">Coupon Value:</span>
                              <span className="font-medium">{formatDiscountValue(discount)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-[#23423d]/80">
                            <span className="font-medium">Type:</span> Coupon
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(discount)}
                        disabled={loading}
                        className="text-gray-600 hover:text-[#23423d] hover:bg-[#23423d]/5 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(discount)}
                        disabled={loading}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Discount"
        description={`Are you sure you want to delete "${discountToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        loading={loading}
      />
    </div>
  );
}
