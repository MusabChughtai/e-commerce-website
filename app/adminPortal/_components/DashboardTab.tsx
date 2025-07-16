import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Package, DollarSign, TrendingUp, Users, ShoppingCart, Star, Calendar, Activity } from "lucide-react";

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

  const stats = [
    {
      title: "Total Products",
      value: products.length.toString(),
      icon: Package,
      description: "Active products in catalog"
    },
    {
      title: "Total Inventory Value",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      description: "Combined value of all products"
    },
    {
      title: "Average Product Price",
      value: formatPrice(averagePrice),
      icon: TrendingUp,
      description: "Mean price across all products"
    },
    {
      title: "Product Categories",
      value: "4",
      icon: Users,
      description: "Different product categories"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#23423d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#23423d] to-[#1e3b36] rounded-2xl shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#23423d] mb-1">{stat.value}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.title}</h3>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Distribution */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-2xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Product Overview</h3>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-[#23423d] to-[#1e3b36] rounded-full"></div>
                  <span className="text-gray-700 font-medium">Total Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-[#23423d]">{products.length}</span>
                  <span className="text-sm text-gray-500">items</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Categories</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-600">4</span>
                  <span className="text-sm text-gray-500">types</span>
                </div>
              </div>
              {products.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Catalog Growth</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] h-3 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Quick Insights</h3>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                <div>
                  <div className="text-sm text-gray-600">Highest Priced</div>
                  <div className="font-semibold text-[#23423d]">
                    {products.length > 0 ? formatPrice(Math.max(...products.map(getProductPrice))) : formatPrice(0)}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-[#23423d]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                <div>
                  <div className="text-sm text-gray-600">Lowest Priced</div>
                  <div className="font-semibold text-[#23423d]">
                    {products.length > 0 ? formatPrice(Math.min(...products.map(getProductPrice))) : formatPrice(0)}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-[#23423d]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                <div>
                  <div className="text-sm text-gray-600">Total Categories</div>
                  <div className="font-semibold text-[#23423d]">4 Active</div>
                </div>
                <Users className="h-8 w-8 text-[#23423d]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}