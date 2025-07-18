"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Trash2, Package, Palette, Plus, Filter, SortAsc } from "lucide-react";
import Image from "next/image";
import { ConfirmationModal } from "./ConfirmationModal";

interface ProductsTabProps {
  products: any[];
  loading: boolean;
  deleteProduct: (id: string) => void;
  formatPrice: (price: number) => string;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  discounts?: any[]; // Add discounts prop
}

export function ProductsTab({
  products,
  loading,
  deleteProduct,
  formatPrice,
  onAddProduct,
  onEditProduct,
  discounts = [], // Default to empty array
}: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debug: Log all discounts received
  console.log('ProductsTab received discounts:', discounts);
  console.log('Number of discounts:', discounts.length);
  discounts.forEach((discount, index) => {
    console.log(`Discount ${index}:`, {
      name: discount.name,
      type: discount.discount_type,
      scope: discount.scope,
      active: discount.is_active,
      start_date: discount.start_date,
      end_date: discount.end_date
    });
  });
  
  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  
  // State for tracking selected colors for each product
  const [selectedColors, setSelectedColors] = useState<{ [productId: string]: string }>({});
  
  // Filter and sort states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  // Get unique categories from products
  const getUniqueCategories = () => {
    const categories = products.map(p => p.category_name).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  // Helper function to get numeric price value for sorting
  const getPriceValue = (product: any): number => {
    // First, try to get prices from dimensions directly
    if (product.dimensions && product.dimensions.length > 0) {
      const dimensionPrices = product.dimensions.map((d: any) => d.price).filter((p: any) => p > 0);
      if (dimensionPrices.length > 0) {
        return Math.min(...dimensionPrices);
      }
    }

    // Fallback to product_variants
    if (product.product_variants && product.product_variants.length > 0) {
      const variantPrices = product.product_variants.map((v: any) => v.price).filter((p: any) => p > 0);
      if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
      }
    }

    return 0; // Default to 0 if no price found
  };

  // Helper function to check if discount is currently active
  const isDiscountActive = (discount: any): boolean => {
    if (!discount.is_active) return false;
    
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);
    
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return now >= startDate && now <= endDate;
  };

  // Helper function to get applicable discounts for a product
  const getApplicableDiscounts = (product: any): any[] => {
    console.log('Getting applicable discounts for product:', product.name);
    console.log('Total discounts to check:', discounts.length);
    
    return discounts.filter(discount => {
      console.log('Checking discount:', discount.name);
      
      const isActive = isDiscountActive(discount);
      console.log('Is discount active?', isActive);
      
      if (!isActive) return false;
      
      // Skip coupon discounts (they need codes)
      if (discount.discount_type === 'coupon') {
        console.log('Skipping coupon discount');
        return false;
      }
      
      console.log('Discount scope:', discount.scope);
      
      switch (discount.scope) {
        case 'all_items':
          console.log('All items discount - applicable');
          return true;
        case 'categories':
          // Check if product's category matches any discount categories
          const discountCategories = discount.discount_categories || [];
          console.log('Discount categories:', discountCategories);
          console.log('Product category_id:', product.category_id);
          console.log('Product category_name:', product.category_name);
          
          const categoryMatch = discountCategories.some((dc: any) => 
            dc.category_id === product.category_id || 
            dc.categories?.name === product.category_name
          );
          console.log('Category match:', categoryMatch);
          return categoryMatch;
        case 'products':
          // Check if product matches any discount products
          const discountProducts = discount.discount_products || [];
          console.log('Discount products:', discountProducts);
          console.log('Product id:', product.id);
          
          const productMatch = discountProducts.some((dp: any) => dp.product_id === product.id);
          console.log('Product match:', productMatch);
          return productMatch;
        default:
          console.log('Unknown scope, not applicable');
          return false;
      }
    });
  };

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (originalPrice: number, discount: any, product: any): number => {
    let discountValue = 0;
    
    // Get discount value based on scope
    switch (discount.scope) {
      case 'all_items':
        const allItemsData = discount.discount_all_items;
        if (Array.isArray(allItemsData) && allItemsData.length > 0) {
          discountValue = allItemsData[0].discount_value;
        } else if (allItemsData && typeof allItemsData === 'object') {
          discountValue = allItemsData.discount_value;
        }
        break;
        
      case 'categories':
        const categoryDiscount = discount.discount_categories?.find((dc: any) => 
          dc.category_id === product.category_id || dc.categories?.name === product.category_name
        );
        if (categoryDiscount) {
          discountValue = categoryDiscount.discount_value;
        }
        break;
        
      case 'products':
        const productDiscount = discount.discount_products?.find((dp: any) => dp.product_id === product.id);
        if (productDiscount) {
          discountValue = productDiscount.discount_value;
        }
        break;
    }
    
    // Apply discount based on type
    switch (discount.discount_type) {
      case 'percent':
        return originalPrice * (1 - discountValue / 100);
      case 'money':
        return Math.max(0, originalPrice - discountValue);
      case 'free_shipping':
        return originalPrice; // Free shipping doesn't affect product price
      default:
        return originalPrice;
    }
  };

  // Helper function to get best discount for a product
  const getBestDiscount = (product: any): { discount: any; originalPrice: number; discountedPrice: number } | null => {
    console.log('Checking discounts for product:', product.name);
    console.log('Available discounts:', discounts);
    
    const applicableDiscounts = getApplicableDiscounts(product);
    console.log('Applicable discounts for', product.name, ':', applicableDiscounts);
    
    if (applicableDiscounts.length === 0) return null;
    
    const originalPrice = getPriceValue(product);
    console.log('Original price for', product.name, ':', originalPrice);
    
    if (originalPrice === 0) return null;
    
    let bestDiscount = null;
    let lowestPrice = originalPrice;
    
    // First, try to find the best price discount (percent/money discounts)
    const priceDiscounts = applicableDiscounts.filter(d => 
      d.discount_type === 'percent' || d.discount_type === 'money'
    );
    
    for (const discount of priceDiscounts) {
      const discountedPrice = calculateDiscountedPrice(originalPrice, discount, product);
      console.log('Discount', discount.name, 'would result in price:', discountedPrice);
      
      if (discountedPrice < lowestPrice) {
        lowestPrice = discountedPrice;
        bestDiscount = discount;
      }
    }
    
    // If we found a price discount, return it (prioritize over free shipping)
    if (bestDiscount && lowestPrice < originalPrice) {
      console.log('Best price discount for', product.name, ':', bestDiscount.name, 'resulting in price:', lowestPrice);
      return {
        discount: bestDiscount,
        originalPrice,
        discountedPrice: lowestPrice
      };
    }
    
    // If no price discount found, check for free shipping discount as fallback
    const freeShippingDiscount = applicableDiscounts.find(d => d.discount_type === 'free_shipping');
    if (freeShippingDiscount) {
      console.log('Found free shipping discount for', product.name, ':', freeShippingDiscount.name);
      return {
        discount: freeShippingDiscount,
        originalPrice,
        discountedPrice: originalPrice // Free shipping doesn't change product price
      };
    }
    
    return null;
  };

  const filteredProducts = products
    .filter((p) => {
      // Search filter (name, description, category, or product id)
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.category_name?.toLowerCase().includes(search) ||
        (p.id && p.id.toString().toLowerCase().includes(search));

      // Category filter
      const matchesCategory = selectedCategory === "all" || p.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "category-asc":
          return (a.category_name || "").localeCompare(b.category_name || "");
        case "category-desc":
          return (b.category_name || "").localeCompare(a.category_name || "");
        case "price-asc":
          const priceA = getPriceValue(a);
          const priceB = getPriceValue(b);
          return priceA - priceB;
        case "price-desc":
          const priceA2 = getPriceValue(a);
          const priceB2 = getPriceValue(b);
          return priceB2 - priceA2;
        default:
          return 0;
      }
    });

  const getPrimaryImage = (product: any) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "/placeholder.svg";
    }
    
    // Debug logging
    console.log('Getting image for product:', product.name);
    console.log('Selected color for this product:', selectedColors[product.id]);
    console.log('Available images:', product.product_images);
    
    // Check if a specific color is selected for this product
    const selectedColorId = selectedColors[product.id];
    if (selectedColorId) {
      // Find image for the selected color
      const colorImage = product.product_images.find((img: any) => 
        img.polish_color_id === selectedColorId
      );
      console.log('Found color image:', colorImage);
      if (colorImage) {
        return colorImage.public_url || colorImage.image_url;
      }
    }
    
    // Find primary image (regardless of color)
    const primary = product.product_images.find((img: any) => img.is_primary);
    if (primary) {
      return primary.public_url || primary.image_url;
    }
    
    // Fall back to first image
    return product.product_images[0].public_url || product.product_images[0].image_url;
  };

  const getPriceRange = (product: any) => {
    // Get best discount for this product
    const discountInfo = getBestDiscount(product);
    
    // First, try to get prices from dimensions directly
    if (product.dimensions && product.dimensions.length > 0) {
      const dimensionPrices = product.dimensions.map((d: any) => d.price).filter((p:any) => p > 0);
      if (dimensionPrices.length > 0) {
        const min = Math.min(...dimensionPrices);
        const max = Math.max(...dimensionPrices);
        
        // For free shipping, show normal price (no strikethrough or red text)
        if (discountInfo && discountInfo.discount.discount_type === 'free_shipping') {
          return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
        }
        
        // For other discounts (percent/money), show strikethrough and red price
        if (discountInfo) {
          const discountedMin = calculateDiscountedPrice(min, discountInfo.discount, product);
          const discountedMax = calculateDiscountedPrice(max, discountInfo.discount, product);
          
          if (min === max) {
            return (
              <div className="flex flex-col">
                <span className="text-xs line-through text-gray-400">{formatPrice(min)}</span>
                <span className="text-red-600 font-bold">{formatPrice(discountedMin)}</span>
              </div>
            );
          } else {
            return (
              <div className="flex flex-col">
                <span className="text-xs line-through text-gray-400">{formatPrice(min)} - {formatPrice(max)}</span>
                <span className="text-red-600 font-bold">{formatPrice(discountedMin)} - {formatPrice(discountedMax)}</span>
              </div>
            );
          }
        } else {
          return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
        }
      }
    }

    // Fallback to product_variants
    if (product.product_variants && product.product_variants.length > 0) {
      const variantPrices = product.product_variants.map((v: any) => v.price).filter((p:any) => p > 0);
      if (variantPrices.length > 0) {
        const min = Math.min(...variantPrices);
        const max = Math.max(...variantPrices);
        
        // For free shipping, show normal price (no strikethrough or red text)
        if (discountInfo && discountInfo.discount.discount_type === 'free_shipping') {
          return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
        }
        
        // For other discounts (percent/money), show strikethrough and red price
        if (discountInfo) {
          const discountedMin = calculateDiscountedPrice(min, discountInfo.discount, product);
          const discountedMax = calculateDiscountedPrice(max, discountInfo.discount, product);
          
          if (min === max) {
            return (
              <div className="flex flex-col">
                <span className="text-xs line-through text-gray-400">{formatPrice(min)}</span>
                <span className="text-red-600 font-bold">{formatPrice(discountedMin)}</span>
              </div>
            );
          } else {
            return (
              <div className="flex flex-col">
                <span className="text-xs line-through text-gray-400">{formatPrice(min)} - {formatPrice(max)}</span>
                <span className="text-red-600 font-bold">{formatPrice(discountedMin)} - {formatPrice(discountedMax)}</span>
              </div>
            );
          }
        } else {
          return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
        }
      }
    }

    // If no prices found, show "Price not set"
    return "Price not set";
  };

  const getAvailableSizes = (product: any) => {
    if (!product.dimensions || product.dimensions.length === 0) {
      return [];
    }
    
    return product.dimensions.map((dim: any) => ({
      id: dim.id,
      name: dim.name || `${dim.width}x${dim.height}${dim.depth ? 'x' + dim.depth : ''}`,
      price: dim.price
    }));
  };

  const handleAddProduct = () => {
    console.log("Add Product button clicked"); // Debug log
    onAddProduct();
  };

  const handleEditProduct = (product: any) => {
    console.log("Edit Product button clicked", product); // Debug log
    onEditProduct(product);
  };

  const handleDeleteConfirmation = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleColorSelect = (productId: string, colorId: string) => {
    console.log('Color selected:', { productId, colorId }); // Debug log
    console.log('Product images for this product:', 
      products.find(p => p.id === productId)?.product_images
    ); // Debug log
    
    setSelectedColors(prev => ({
      ...prev,
      [productId]: colorId
    }));
  };

  return (
    <div className="space-y-8">
      {/* Search bar and Add button */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top row - Search and Add button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by product ID, name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 rounded-xl h-12 bg-white shadow-sm focus:border-[#23423d] focus:ring-[#23423d]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <span className="text-sm font-medium text-gray-700">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>
          
          {/* Bottom row - Filters and Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white shadow-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#23423d] rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try different search terms." : "No products available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative bg-white/70 backdrop-blur-2xl rounded-2xl border border-gray-200/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden flex flex-col">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#23423d]/0 to-[#1e3b36]/0 group-hover:from-[#23423d]/5 group-hover:to-[#1e3b36]/5 transition-all duration-300 rounded-2xl" />
              
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                  key={`${product.id}-${selectedColors[product.id] || 'default'}`}
                  src={getPrimaryImage(product)}
                  alt={product.name || 'Product'}
                  width={400}
                  height={300}
                  className="object-contain w-full h-full transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                
                {/* Discount Labels */}
                {(() => {
                  const discountInfo = getBestDiscount(product);
                  console.log('Discount info for', product.name, ':', discountInfo);
                  
                  if (discountInfo) {
                    const badges = [];
                    console.log('Discount type:', discountInfo.discount.discount_type);
                    
                    // Free Shipping Badge
                    if (discountInfo.discount.discount_type === 'free_shipping') {
                      console.log('Adding FREE SHIPPING badge for', product.name);
                      badges.push(
                        <div key="free-shipping" className="absolute top-3 left-3 z-10">
                          <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                            FREE SHIPPING
                          </div>
                        </div>
                      );
                    } else {
                      // Regular Sale Badge for percent and money discounts
                      console.log('Adding SALE badge for', product.name);
                      badges.push(
                        <div key="sale" className="absolute top-3 left-3 z-10">
                          <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse">
                            SALE
                          </div>
                        </div>
                      );
                    }
                    
                    // Percentage Badge (only for percent discounts)
                    if (discountInfo.discount.discount_type === 'percent') {
                      let discountValue = 0;
                      switch (discountInfo.discount.scope) {
                        case 'all_items':
                          const allItemsData = discountInfo.discount.discount_all_items;
                          if (Array.isArray(allItemsData) && allItemsData.length > 0) {
                            discountValue = allItemsData[0].discount_value;
                          } else if (allItemsData && typeof allItemsData === 'object') {
                            discountValue = allItemsData.discount_value;
                          }
                          break;
                        case 'categories':
                          const categoryDiscount = discountInfo.discount.discount_categories?.find((dc: any) => 
                            dc.category_id === product.category_id || dc.categories?.name === product.category_name
                          );
                          if (categoryDiscount) {
                            discountValue = categoryDiscount.discount_value;
                          }
                          break;
                        case 'products':
                          const productDiscount = discountInfo.discount.discount_products?.find((dp: any) => dp.product_id === product.id);
                          if (productDiscount) {
                            discountValue = productDiscount.discount_value;
                          }
                          break;
                      }
                      
                      if (discountValue > 0) {
                        badges.push(
                          <div key="percentage" className="absolute top-3 right-3 z-10">
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              -{discountValue}%
                            </div>
                          </div>
                        );
                      }
                    }
                    
                    console.log('Badges to render:', badges.length);
                    return badges;
                  }
                  return null;
                })()}
                
                {/* Status overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="relative p-4 flex-shrink-0">
                {/* Header section */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-800 truncate group-hover:text-[#23423d] transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="text-xs text-gray-500 truncate mt-0.5">ID: {product.id}</div>
                  </div>
                  <span className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full text-xs font-medium shadow-sm border border-gray-200/50 ml-2">
                    {product.category_name}
                  </span>
                </div>

                {/* Available Colors */}
                {product.available_colors && product.available_colors.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-gray-100 rounded">
                      <Palette className="h-3 w-3 text-[#23423d]" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.available_colors.slice(0, 4).map((color: any, index: number) => (
                        <button
                          key={color.id || `color-${product.id}-${index}`}
                          onClick={() => handleColorSelect(product.id, color.id)}
                          className={`w-4 h-4 rounded-full border shadow-sm hover:scale-125 transition-transform duration-200 cursor-pointer ${
                            selectedColors[product.id] === color.id 
                              ? 'border-[#23423d] ring-2 ring-[#23423d]/30' 
                              : 'border-white hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.hex_code || '#ccc' }}
                          title={color.name}
                        />
                      ))}
                      {product.available_colors.length > 4 && (
                        <div key={`more-colors-${product.id}`} className="flex items-center text-xs text-gray-500 font-medium ml-1">
                          +{product.available_colors.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="text-sm font-bold bg-gradient-to-r from-[#23423d] to-[#1e3b36] bg-clip-text text-transparent">
                      {getPriceRange(product)}
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {product.product_variants?.length || 0} variant{product.product_variants?.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="group/btn border-gray-200 hover:bg-[#23423d] hover:text-white hover:border-[#23423d] rounded-lg px-2 py-1.5 transition-all duration-200 hover:shadow-lg"
                    >
                      <Edit className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-200" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfirmation(product)}
                      className="group/btn border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg px-2 py-1.5 transition-all duration-200 hover:shadow-lg"
                    >
                      <Trash2 className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Confirm Delete Permanently"
        description={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone and will remove the product, all its variants, images, and associated data from the database forever.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        type="delete"
        loading={loading}
      />
    </div>
  );
}