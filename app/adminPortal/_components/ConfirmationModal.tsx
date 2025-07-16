"use client";

import React from "react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Save, Trash2, X, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  type: 'save' | 'discard' | 'reset' | 'delete';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  type,
  loading = false
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  
  // Use either external loading or internal loading
  const isLoading = loading || internalLoading;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };
  
  // Smooth scroll to center when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const scrollToCenter = () => {
        window.scrollTo({
          top: window.innerHeight / 2,
          behavior: 'smooth'
        });
      };
      
      // Small delay to ensure modal is rendered
      const timer = setTimeout(scrollToCenter, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'save':
        return <Save className="w-7 h-7 text-[#23423d]" strokeWidth={2.5} />;
      case 'discard':
        return <Trash2 className="w-7 h-7 text-red-600" strokeWidth={2.5} />;
      case 'reset':
        return <AlertTriangle className="w-7 h-7 text-orange-600" strokeWidth={2.5} />;
      case 'delete':
        return <Trash2 className="w-7 h-7 text-red-600" strokeWidth={2.5} />;
      default:
        return <AlertTriangle className="w-7 h-7 text-[#23423d]" strokeWidth={2.5} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'save':
        return "bg-gradient-to-r from-[#23423d] via-[#2a4d47] to-[#1e3b36] hover:from-[#1e3b36] hover:via-[#1a332e] hover:to-[#192e2a] text-white border-0";
      case 'discard':
        return "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0";
      case 'reset':
        return "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0";
      case 'delete':
        return "bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white border-0";
      default:
        return "bg-gradient-to-r from-[#23423d] via-[#2a4d47] to-[#1e3b36] hover:from-[#1e3b36] hover:via-[#1a332e] hover:to-[#192e2a] text-white border-0";
    }
  };

  const getCancelButtonColor = () => {
    switch (type) {
      case 'discard':
      case 'reset':
      case 'delete':
        return "border-2 border-red-200/80 hover:border-red-300 bg-red-50/80 hover:bg-red-100/80 text-red-700 hover:text-red-900";
      default:
        return "border-2 border-gray-200/80 hover:border-gray-300 bg-white/80 hover:bg-gray-50/80 text-gray-700 hover:text-gray-900";
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'save':
        return "bg-gradient-to-r from-[#23423d] via-[#2a5249] to-[#1e3b36]";
      case 'discard':
      case 'reset':
        return "bg-gradient-to-r from-red-500 via-red-600 to-red-700";
      case 'delete':
        return "bg-gradient-to-r from-red-600 via-red-700 to-red-800";
      default:
        return "bg-gradient-to-r from-[#23423d] via-[#2a5249] to-[#1e3b36]";
    }
  };

  const getButtonIcon = () => {
    switch (type) {
      case 'save':
        return <Save className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'discard':
        return <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'reset':
        return <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'delete':
        return <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />;
      default:
        return <Save className="w-5 h-5 text-white" strokeWidth={2.5} />;
    }
  };

  // Prevent closing the modal when loading
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-0 border-0 bg-gradient-to-br from-white via-gray-50 to-white shadow-[0_40px_80px_-12px_rgba(0,0,0,0.35)] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl overflow-hidden p-0 backdrop-blur-xl"
          )}
        >
        
        {/* Theme Header - compact luxurious design with dynamic color */}
        <div className={`${getHeaderColor()} px-6 py-5 relative rounded-t-2xl border-b ${type === 'discard' || type === 'reset' || type === 'delete' ? 'border-red-800/30' : 'border-emerald-700/30'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${type === 'discard' || type === 'reset' || type === 'delete' ? 'bg-red-200' : 'bg-emerald-300'}`}></div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide drop-shadow-lg">
                  {type === 'save' ? 'Confirm Action' : 
                   type === 'discard' ? 'Discard Changes' : 
                   type === 'delete' ? 'Confirm Action' :
                   'Reset Form'}
                </h2>
                <p className={`text-xs font-medium ${type === 'discard' || type === 'reset' || type === 'delete' ? 'text-red-100/80' : 'text-emerald-100/80'}`}>Please review your decision</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              disabled={isLoading}
              className={`group relative p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X className={`w-5 h-5 text-white transition-colors duration-300 ${type === 'discard' || type === 'reset' || type === 'delete' ? 'group-hover:text-red-100' : 'group-hover:text-emerald-100'}`} strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Main content - compact styling */}
        <div className="p-6 bg-gradient-to-b from-transparent to-gray-50/30">
          <DialogHeader className="text-center space-y-3 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900 leading-tight tracking-wide">
              {title}
            </DialogTitle>
            
            <DialogDescription className="text-gray-600 text-sm leading-relaxed font-medium">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
            {/* Cancel/Stay button - compact styling */}
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group border-2 ${getCancelButtonColor()}`}
            >
              <RotateCcw className={`w-4 h-4 mr-2 group-hover:-rotate-180 transition-transform duration-500 ${type === 'discard' || type === 'reset' || type === 'delete' ? 'text-red-700' : 'text-gray-700'}`} strokeWidth={2.5} />
              {cancelText}
            </Button>
            
            {/* Confirm/Action button - compact styling */}
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.05] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-xl group relative overflow-hidden ${getConfirmButtonColor()}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                  <span className="animate-pulse font-bold">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center relative z-10">
                  <div className="group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                    {getButtonIcon()}
                  </div>
                  <span className="ml-2">{confirmText}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </DialogFooter>
        </div>
        
        {/* Elegant border glow and decorative elements - compact */}
        <div className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-emerald-200/20 via-white/40 to-emerald-200/20 pointer-events-none"></div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-transparent to-emerald-600/10 blur-xl pointer-events-none"></div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
