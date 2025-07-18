export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminPortalProps {
  onBack: () => void;
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  formatPrice: (price: number) => string;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateServices: () => void;
}

// Discount system types
export interface Discount {
  id: string;
  name: string;
  description: string;
  discount_type: 'percent' | 'money' | 'free_shipping' | 'coupon';
  scope: 'all_items' | 'categories' | 'products' | 'coupon';
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface DiscountAllItems {
  id: string;
  discount_id: string;
  discount_value: number;
}

export interface DiscountCategory {
  id: string;
  discount_id: string;
  category_id: string;
  discount_value: number;
  category?: {
    id: string;
    name: string;
  };
}

export interface DiscountProduct {
  id: string;
  discount_id: string;
  product_id: string;
  discount_value: number;
  product?: {
    id: string;
    name: string;
  };
}

export interface DiscountCoupon {
  id: string;
  discount_id: string;
  coupon_code: string;
  coupon_discount_type: 'percent' | 'money';
  discount_value: number;
  usage_limit?: number | null;
  usage_count: number;
}
