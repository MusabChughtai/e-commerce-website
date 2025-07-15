"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateServices: () => void;
}

export function MobileMenu({
  isOpen,
  setIsOpen,
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
}: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold text-[#4a7c59]">
            East Crafts
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 space-y-4">
          <button
            onClick={() => {
              onNavigateHome();
              setIsOpen(false);
            }}
            className="block text-lg text-gray-700"
          >
            HOME
          </button>
          <button
            onClick={() => {
              onNavigateProducts();
              setIsOpen(false);
            }}
            className="block text-lg text-gray-700"
          >
            SHOP
          </button>
          <button
            onClick={() => {
              onNavigateServices();
              setIsOpen(false);
            }}
            className="block text-lg text-gray-700"
          >
            SERVICES
          </button>
          <div className="flex items-center space-x-2 py-2">
            <Settings className="h-4 w-4 text-[#4a7c59]" />
            <span className="text-lg text-[#4a7c59] font-medium">ADMIN</span>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
