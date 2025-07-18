export interface AdminPortalProps {
  formatPrice: (price: number) => string;
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
