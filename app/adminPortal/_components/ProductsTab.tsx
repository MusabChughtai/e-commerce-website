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
    <div className="space-y-6">
      {/* Search bar and Add button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Badge>
              <Button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-[#23423d] to-[#2a4f49] hover:from-[#1f3a36] hover:to-[#25463f] text-white flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#4a7c59] rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try different search terms." : "No products available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden rounded-t-lg relative">
                <Image
                  src={getPrimaryImage(product)}
                  alt={product.name || 'Product'}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {/* Stock badge */}
                {getTotalStock(product) === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Out of Stock
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1 pr-2">
                    {product.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {product.category_name}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Available Colors */}
                {product.available_colors && product.available_colors.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {product.available_colors.slice(0, 4).map((color: any, index: number) => (
                        <div
                          key={color.id || `color-${product.id}-${index}`}
                          className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: color.hex_code || '#ccc' }}
                          title={color.name}
                        />
                      ))}
                      {product.available_colors.length > 4 && (
                        <div key={`more-colors-${product.id}`} className="text-xs text-gray-500 ml-1">
                          +{product.available_colors.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {getAvailableSizes(product).length > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    Sizes: {getAvailableSizes(product).map((size: any, index: number) => (
                      <span key={`${product.id}-size-${size.id || index}`}>
                        {size.name}
                        {index < getAvailableSizes(product).length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="outline" className="text-sm font-semibold">
                    {getPriceRange(product)}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    Stock: {getTotalStock(product)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {product.product_variants?.length || 0} variant
                    {product.product_variants?.length === 1 ? "" : "s"}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
                          deleteProduct(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}