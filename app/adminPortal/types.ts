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
