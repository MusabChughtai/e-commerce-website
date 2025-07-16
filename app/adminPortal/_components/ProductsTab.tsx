"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Edit, Trash2, Package, Palette, Plus } from "lucide-react";
import Image from "next/image";
import { AddEditProductForm } from "./AddEditProductForm";

interface ProductsTabProps {
  products: any[];
  loading: boolean;
  editingProduct: any;
  formData: any;
  setFormData: (data: any) => void;
  addProduct: (e: React.FormEvent) => void;
  updateProduct: (e: React.FormEvent) => void;
  deleteProduct: (id: string) => void;
  startEdit: (product: any) => void;
  cancelEdit: () => void;
  formatPrice: (price: number) => string;
}

export function ProductsTab({
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
  formatPrice,
}: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrimaryImage = (product: any) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "/placeholder.svg";
    }
    
    // Find primary image
    const primary = product.product_images.find((img: any) => img.is_primary);
    if (primary) {
      return primary.public_url || primary.image_url;
    }
    
    // Fall back to first image
    return product.product_images[0].public_url || product.product_images[0].image_url;
  };

  const getPriceRange = (product: any) => {
    // Debug logging - remove after fixing
    console.log('Product price debug:', {
      productId: product.id,
      productName: product.name,
      dimensions: product.dimensions,
      product_variants: product.product_variants,
      variant_options: product.variant_options
    });

    // First, try to get prices from dimensions directly
    if (product.dimensions && product.dimensions.length > 0) {
      const dimensionPrices = product.dimensions.map((d: any) => d.price).filter((p:any) => p > 0);
      if (dimensionPrices.length > 0) {
        const min = Math.min(...dimensionPrices);
        const max = Math.max(...dimensionPrices);
        return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
      }
    }

    // Fallback to product_variants
    if (product.product_variants && product.product_variants.length > 0) {
      const variantPrices = product.product_variants.map((v: any) => v.price).filter((p:any) => p > 0);
      if (variantPrices.length > 0) {
        const min = Math.min(...variantPrices);
        const max = Math.max(...variantPrices);
        return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
      }
    }

    // If no prices found, show "Price not set"
    return "Price not set";
  };

  const getTotalStock = (product: any) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return 0;
    }
    return product.product_variants.reduce((total: number, variant: any) => 
      total + (variant.stock_quantity || 0), 0
    );
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
    setShowAddForm(true);
  };

  const handleEditProduct = (product: any) => {
    startEdit(product);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    cancelEdit();
    setShowAddForm(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    addProduct(e);
    setShowSuccessModal(true);
    setShowAddForm(false);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    updateProduct(e);
    setShowSuccessModal(true);
    setShowAddForm(false);
  };

  // Show form if we're adding or editing
  if (showAddForm || editingProduct) {
    return (
      <div className="space-y-6">
        <AddEditProductForm
          formData={formData}
          setFormData={setFormData}
          editingProduct={editingProduct}
          addProduct={handleAddProductSubmit}
          updateProduct={handleUpdateProductSubmit}
          cancelEdit={handleCancelEdit}
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search bar and Add button */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products, categories..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-gray-200/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] overflow-hidden">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#23423d]/0 to-[#1e3b36]/0 group-hover:from-[#23423d]/5 group-hover:to-[#1e3b36]/5 transition-all duration-300 rounded-3xl" />
              
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                  src={getPrimaryImage(product)}
                  alt={product.name || 'Product'}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {/* Enhanced stock badge */}
                {getTotalStock(product) === 0 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                    Out of Stock
                  </div>
                )}
                {/* Status overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="relative p-8">
                {/* Header section */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-gray-800 truncate flex-1 pr-3 group-hover:text-[#23423d] transition-colors duration-200">
                    {product.name}
                  </h3>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full text-xs font-medium shadow-sm border border-gray-200/50">
                    {product.category_name}
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Available Colors */}
                {product.available_colors && product.available_colors.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Palette className="h-4 w-4 text-[#23423d]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.available_colors.slice(0, 4).map((color: any, index: number) => (
                        <div
                          key={color.id || `color-${product.id}-${index}`}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: color.hex_code || '#ccc' }}
                          title={color.name}
                        />
                      ))}
                      {product.available_colors.length > 4 && (
                        <div key={`more-colors-${product.id}`} className="flex items-center text-xs text-gray-500 font-medium ml-1">
                          +{product.available_colors.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {getAvailableSizes(product).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Available Sizes:</div>
                    <div className="text-sm text-gray-600">
                      {getAvailableSizes(product).map((size: any, index: number) => (
                        <span key={`${product.id}-size-${size.id || index}`} className="inline-block">
                          {size.name}
                          {index < getAvailableSizes(product).length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price and Stock section */}
                <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/40 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Price Range</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-[#23423d] to-[#1e3b36] bg-clip-text text-transparent">
                      {getPriceRange(product)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-500 mb-1">Stock</span>
                    <span className={`text-sm font-semibold ${getTotalStock(product) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {getTotalStock(product)} units
                    </span>
                  </div>
                </div>

                {/* Variants info and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">Variants</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {product.product_variants?.length || 0} option{product.product_variants?.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="group/btn border-gray-200 hover:bg-[#23423d] hover:text-white hover:border-[#23423d] rounded-2xl px-4 py-2 transition-all duration-200 hover:shadow-lg"
                    >
                      <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="group/btn border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-2xl px-4 py-2 transition-all duration-200 hover:shadow-lg"
                    >
                      <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}