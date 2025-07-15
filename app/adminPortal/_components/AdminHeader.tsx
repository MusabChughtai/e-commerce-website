import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Search, ShoppingCart, Settings, Menu } from "lucide-react";
import { AccountModal } from "../../../app/components/account-modal";

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
}: AdminHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] shadow-lg border-b border-[#2d5a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-[#f4d03f]">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={onNavigateHome} className="text-[#f4d03f] font-medium">
              HOME
            </button>
            <button onClick={onNavigateProducts} className="text-[#f4d03f] font-medium">
              SHOP
            </button>
            <button onClick={onNavigateServices} className="text-[#f4d03f] font-medium">
              SERVICES
            </button>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-[#f7dc6f]" />
              <span className="text-[#f7dc6f] font-medium">ADMIN</span>
            </div>
          </nav>

          {/* Logo */}
          <div className="flex items-center">
            <button onClick={onNavigateHome} className="text-2xl font-bold text-[#f4d03f]">
              East Crafts
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-[#f4d03f]">
              <Search className="h-5 w-5" />
            </Button>

            <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#f4d03f]">
                  <User className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AccountModal />
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" className="text-[#f4d03f]">
              <Heart className="h-5 w-5" />
            </Button>

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-[#f4d03f]">
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-[#f4d03f] text-[#4a7c59]">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
