import { Button } from "@/components/ui/button";
import { Settings, Menu, Shield } from "lucide-react";

interface AdminHeaderProps {
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getTotalItems: () => number;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateServices: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  onToggleSidebar: () => void;
}

export function AdminHeader({
  isAccountOpen,
  setIsAccountOpen,
  isCartOpen,
  setIsCartOpen,
  getTotalItems,
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
  setIsMobileMenuOpen,
  onToggleSidebar,
}: AdminHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] shadow-xl border-b border-[#1a332e] fixed top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleSidebar} 
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop spacer */}
          <div className="hidden lg:block w-12"></div>

          {/* Center Logo and Title */}
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              East Crafts Admin Portal
            </h1>
          </div>

          {/* Right spacer to balance the layout */}
          <div className="w-12"></div>
        </div>
      </div>
    </header>
  );
}
