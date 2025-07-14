import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface ProductsTabProps {
  products: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  startEdit: (product: any) => void;
  deleteProduct: (id: string) => void;
  formatPrice: (price: number) => string;
}

export function ProductsTab({
  products,
  loading,
  searchTerm,
  setSearchTerm,
  startEdit,
  deleteProduct,
  formatPrice,
}: ProductsTabProps) {
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get primary image or first image
  const getProductImage = (product: any) => {
    if (!product.product_images || product.product_images.length === 0) {
      return "/placeholder.svg";
    }
    
    // Find primary image first
    const primaryImage = product.product_images.find((img: any) => img.is_primary);
    if (primaryImage) {
      return primaryImage.image_url;
    }
    
    // Otherwise return first image
    return product.product_images[0].image_url;
  };

  // Helper function to get display price
  const getDisplayPrice = (product: any) => {
    // If there are variants, show range or base price
    if (product.product_variants && product.product_variants.length > 0) {
      const prices = product.product_variants.map((v: any) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      } else {
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      }
    }
    
    // Fall back to base price
    return formatPrice(product.base_price);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Badge>{filteredProducts.length} products</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#4a7c59] mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first product to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1">{product.name}</h3>
                  {product.discount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                
                {product.polish_color && (
                  <div className="text-xs text-gray-500 mb-2">
                    Polish: {product.polish_color}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    <Badge variant="outline" className="text-sm font-semibold">
                      {getDisplayPrice(product)}
                    </Badge>
                    {product.base_price && product.product_variants?.length > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        Base: {formatPrice(product.base_price)}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(product)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                {product.product_variants?.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {product.product_variants.length} variant{product.product_variants.length > 1 ? 's' : ''} available
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}