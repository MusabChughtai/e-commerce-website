import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Package, DollarSign, TrendingUp, Users } from "lucide-react";

interface DashboardTabProps {
  products: any[];
  formatPrice: (price: number) => string;
}

export function DashboardTab({ products, formatPrice }: DashboardTabProps) {
  // Helper function to get the display price for a product
  const getProductPrice = (product: any) => {
    // Use base_price if available, otherwise try to get from variants
    if (product.base_price) {
      return product.base_price;
    }
    
    // If no base_price, try to get the first variant's price
    if (product.product_variants && product.product_variants.length > 0) {
      return product.product_variants[0].price;
    }
    
    // Fallback to 0 if no price found
    return 0;
  };

  const totalRevenue = products.reduce((sum, p) => sum + getProductPrice(p), 0);
  const averagePrice = products.length > 0 ? totalRevenue / products.length : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>{products.length}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>{formatPrice(totalRevenue)}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle>Average Price</CardTitle>
          </CardHeader>
          <CardContent>{formatPrice(averagePrice)}</CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>4</CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between py-2">
              <span>{p.name}</span>
              <Badge>{formatPrice(getProductPrice(p))}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}