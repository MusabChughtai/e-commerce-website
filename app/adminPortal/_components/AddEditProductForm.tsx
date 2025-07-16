"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ConfirmationModal } from "./ConfirmationModal";
import { 
  Package, 
  FileText, 
  Tag, 
  Ruler, 
  Palette, 
  Grid, 
  ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  X,
  Upload,
  Save,
  RotateCcw,
  ArrowLeft,
  Edit3
} from "lucide-react";

// Type definitions
interface Category {
  id: string;
  name: string;
}

interface PolishColor {
  id: string;
  name: string;
  hex_code?: string;
  description?: string;
}

interface Dimension {
  name: string;
  width: string;
  height: string;
  depth: string;
  length: string;
  price: string;
}

interface Variant {
  dimensionId: string;
  polishColorId: string;
}

interface FormData {
  name: string;
  description: string;
  category_id: string;
  dimensions: Dimension[];
  polish_color_ids: string[];
  variants: Variant[];
  images: Record<string, File[]> & { primaryIndices?: Record<string, number> };
  existingImages: Record<string, ExistingImage[]>;
}

interface ExistingImage {
  id: string;
  image_url: string;
  public_url: string;
  polish_color_id: string;
  is_primary: boolean;
}

interface AddEditProductFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  editingProduct: any;
  addProduct: (e: React.FormEvent) => void;
  updateProduct: (e: React.FormEvent) => void;
  cancelEdit: () => void;
  loading?: boolean;
}

export function AddEditProductForm({
  formData,
  setFormData,
  editingProduct,
  addProduct,
  updateProduct,
  cancelEdit,
  loading = false,
}: AddEditProductFormProps) {
  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>(
    {}
  );
  const [existingImagePreviews, setExistingImagePreviews] = useState<Record<string, ExistingImage[]>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [primaryIndices, setPrimaryIndices] = useState<Record<string, number>>({});

  // Categories and Polish Colors data
  const [categories, setCategories] = useState<Category[]>([]);
  const [polishColors, setPolishColors] = useState<PolishColor[]>([]);

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    type: 'save' | 'discard' | 'reset';
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    type: 'save',
    title: '',
    description: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  // Load existing images when editing a product
  useEffect(() => {
    if (editingProduct && editingProduct.product_images) {
      const existingImages: Record<string, ExistingImage[]> = {};
      
      editingProduct.product_images.forEach((img: any) => {
        const polishColorId = img.polish_color_id;
        if (!existingImages[polishColorId]) {
          existingImages[polishColorId] = [];
        }
        existingImages[polishColorId].push({
          id: img.id,
          image_url: img.image_url,
          public_url: img.public_url,
          polish_color_id: img.polish_color_id,
          is_primary: img.is_primary
        });
      });
      
      setExistingImagePreviews(existingImages);
    } else {
      setExistingImagePreviews({});
    }
  }, [editingProduct]);

  // Sync existing images and primary indices with form data
  useEffect(() => {
    setFormData((prev: FormData) => ({
      ...prev,
      existingImages: existingImagePreviews,
      images: {
        ...prev.images,
        primaryIndices
      } as Record<string, File[]> & { primaryIndices?: Record<string, number> }
    }));
  }, [existingImagePreviews, primaryIndices, setFormData]);

  // === CATEGORY ===
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name");
      setCategories(data as Category[] || []);
    }
    fetchCategories();
  }, []);

  // === POLISH COLORS ===
  useEffect(() => {
    async function fetchPolishColors() {
      const { data } = await supabase.from("polish_colors").select("id, name, hex_code, description");
      setPolishColors(data as PolishColor[] || []);
    }
    fetchPolishColors();
  }, []);

  // === POPULATE FORM WHEN EDITING ===
  useEffect(() => {
    if (editingProduct && polishColors.length > 0) {
      // Populate polish colors from available_colors
      if (editingProduct.available_colors && editingProduct.available_colors.length > 0) {
        const polishColorIds = editingProduct.available_colors.map((pc: any) => pc.id);
        setFormData(prev => ({
          ...prev,
          polish_color_ids: polishColorIds
        }));
      }

      // Populate variants from product_variants
      if (editingProduct.product_variants && editingProduct.product_variants.length > 0) {
        const variants = editingProduct.product_variants.map((v: any, index: number) => ({
          dimensionId: index.toString(), // Use index since we're mapping to dimension array index
          polishColorId: v.polish_color_id || ""
        }));
        setFormData(prev => ({
          ...prev,
          variants: variants
        }));
      }

      // Populate images and image previews from product_images
      if (editingProduct.product_images && editingProduct.product_images.length > 0) {
        const existingImagesByPolish: Record<string, ExistingImage[]> = {};
        editingProduct.product_images.forEach((img: any) => {
          if (img.polish_color_id && img.public_url) {
            if (!existingImagesByPolish[img.polish_color_id]) {
              existingImagesByPolish[img.polish_color_id] = [];
            }
            existingImagesByPolish[img.polish_color_id].push({
              id: img.id,
              image_url: img.image_url,
              public_url: img.public_url,
              polish_color_id: img.polish_color_id,
              is_primary: img.is_primary
            });
          }
        });
        setExistingImagePreviews(existingImagesByPolish);
        
        // Set existing images in form data
        const newImages = { primaryIndices: {} } as Record<string, File[]> & { primaryIndices?: Record<string, number> };
        setFormData(prev => ({
          ...prev,
          existingImages: existingImagesByPolish,
          images: newImages
        }));
        
        // Clear new image previews when editing
        setImagePreviews({});
      } else {
        // If no existing images, still initialize the tracking
        const newImages = { primaryIndices: {} } as Record<string, File[]> & { primaryIndices?: Record<string, number> };
        setFormData(prev => ({
          ...prev,
          existingImages: {},
          images: newImages
        }));
      }
    }
  }, [editingProduct, polishColors]); // Removed setFormData from dependencies

  // === ENSURE MINIMUM DIMENSIONS AND VARIANTS ===
  useEffect(() => {
    // Ensure there's always at least one dimension
    if (formData.dimensions.length === 0) {
      setFormData(prev => ({
        ...prev,
        dimensions: [{ name: "", width: "", height: "", depth: "", length: "", price: "" }]
      }));
    }
    
    // Ensure there's always at least one variant
    if (formData.variants.length === 0) {
      setFormData(prev => ({
        ...prev,
        variants: [{ dimensionId: "", polishColorId: "" }]
      }));
    }
  }, [formData.dimensions.length, formData.variants.length, setFormData]);

  // Helper function to check if form is essentially empty (for new products)
  const isFormEmpty = () => {
    const hasName = formData.name?.trim();
    const hasDescription = formData.description?.trim();
    const hasCategory = formData.category_id;
    const hasValidDimensions = formData.dimensions.some(d => 
      d.name?.toString().trim() || d.width?.toString().trim() || d.height?.toString().trim() || d.depth?.toString().trim() || d.length?.toString().trim() || d.price?.toString().trim()
    );
    const hasPolishColors = formData.polish_color_ids.length > 0;
    const hasValidVariants = formData.variants.some(v => v.dimensionId || v.polishColorId);
    const hasImages = Object.keys(formData.images).some(key => 
      key !== 'primaryIndices' && formData.images[key]?.length > 0
    );

    return !hasName && !hasDescription && !hasCategory && !hasValidDimensions && 
           !hasPolishColors && !hasValidVariants && !hasImages;
  };

  // Helper function to check if form has changes (for editing)
  const hasFormChanges = () => {
    if (!editingProduct) return false;

    // Check basic fields
    if (formData.name?.trim() !== editingProduct.name?.trim()) return true;
    if (formData.description?.trim() !== editingProduct.description?.trim()) return true;
    if (formData.category_id !== editingProduct.category_id) return true;

    // Check dimensions changes
    if (editingProduct.product_variants && editingProduct.product_variants.length > 0) {
      const originalDimensions = editingProduct.product_variants.map((v: any) => ({
        name: v.dimension_name || "",
        width: v.width?.toString() || "",
        height: v.height?.toString() || "",
        depth: v.depth?.toString() || "",
        length: v.length?.toString() || "",
        price: v.price?.toString() || ""
      }));

      if (formData.dimensions.length !== originalDimensions.length) return true;
      
      for (let i = 0; i < formData.dimensions.length; i++) {
        const current = formData.dimensions[i];
        const original = originalDimensions[i] || { name: "", width: "", height: "", depth: "", length: "", price: "" };
        
        if (current.name?.toString().trim() !== original.name?.toString().trim()) return true;
        if (current.width?.toString().trim() !== original.width?.toString().trim()) return true;
        if (current.height?.toString().trim() !== original.height?.toString().trim()) return true;
        if (current.depth?.toString().trim() !== original.depth?.toString().trim()) return true;
        if (current.length?.toString().trim() !== original.length?.toString().trim()) return true;
        if (current.price?.toString().trim() !== original.price?.toString().trim()) return true;
      }
    } else if (formData.dimensions.some(d => 
      d.name?.toString().trim() || d.width?.toString().trim() || d.height?.toString().trim() || d.depth?.toString().trim() || d.length?.toString().trim() || d.price?.toString().trim()
    )) {
      return true;
    }

    // Check polish colors changes
    const originalPolishColorIds = editingProduct.available_colors?.map((c: any) => c.id) || [];
    const currentPolishColorIds = [...formData.polish_color_ids].sort();
    const originalPolishColorIdsSorted = [...originalPolishColorIds].sort();
    
    if (currentPolishColorIds.length !== originalPolishColorIdsSorted.length) return true;
    if (!currentPolishColorIds.every((id, index) => id === originalPolishColorIdsSorted[index])) return true;

    // Check variants changes
    if (editingProduct.product_variants && editingProduct.product_variants.length > 0) {
      const originalVariants = editingProduct.product_variants.map((v: any, index: number) => ({
        dimensionId: index.toString(),
        polishColorId: v.polish_color_id || ""
      }));

      if (formData.variants.length !== originalVariants.length) return true;
      
      for (let i = 0; i < formData.variants.length; i++) {
        const current = formData.variants[i];
        const original = originalVariants[i] || { dimensionId: "", polishColorId: "" };
        
        if (current.dimensionId !== original.dimensionId) return true;
        if (current.polishColorId !== original.polishColorId) return true;
      }
    } else if (formData.variants.some(v => v.dimensionId || v.polishColorId)) {
      return true;
    }

    // Check if any new images were added
    const hasNewImages = Object.keys(formData.images).some(key => 
      key !== 'primaryIndices' && formData.images[key]?.length > 0
    );
    if (hasNewImages) return true;

    // Check if any existing images were removed or primary status changed
    if (editingProduct.product_images) {
      const originalImageIds = editingProduct.product_images.map((img: any) => img.id);
      const currentImageIds = Object.values(existingImagePreviews).flat().map(img => img.id);
      if (originalImageIds.length !== currentImageIds.length) return true;
      if (!originalImageIds.every((id: string) => currentImageIds.includes(id))) return true;

      // Check if primary image status changed
      for (const polishColorId of Object.keys(existingImagePreviews)) {
        const originalImages = editingProduct.product_images.filter((img: any) => img.polish_color_id === polishColorId);
        const currentImages = existingImagePreviews[polishColorId];
        
        for (let i = 0; i < currentImages.length; i++) {
          const currentImg = currentImages[i];
          const originalImg = originalImages.find((img: any) => img.id === currentImg.id);
          if (originalImg && originalImg.is_primary !== currentImg.is_primary) return true;
        }
      }
    }

    return false;
  };

  // Check if form is valid for submission (all required fields filled)
  const isFormValid = () => {
    // Basic required fields
    const hasName = formData.name?.trim();
    const hasCategory = formData.category_id;
    
    if (!hasName || !hasCategory) return false;

    // At least one dimension with all required fields filled
    const hasValidDimensions = formData.dimensions.some(d => 
      d.name?.toString().trim() && 
      d.width?.toString().trim() && 
      d.height?.toString().trim() && 
      d.depth?.toString().trim() && 
      d.length?.toString().trim() && 
      d.price?.toString().trim()
    );
    
    if (!hasValidDimensions) return false;

    // At least one polish color selected
    const hasPolishColors = formData.polish_color_ids.length > 0;
    
    if (!hasPolishColors) return false;

    // At least one valid variant
    const hasValidVariants = formData.variants.some(v => v.dimensionId && v.polishColorId);
    
    if (!hasValidVariants) return false;

    return true;
  };

  // Get form validation error message
  const getFormValidationMessage = () => {
    const missingFields = [];
    
    if (!formData.name?.trim()) missingFields.push("Product Name");
    if (!formData.category_id) missingFields.push("Category");
    
    const hasValidDimensions = formData.dimensions.some(d => 
      d.name?.toString().trim() && 
      d.width?.toString().trim() && 
      d.height?.toString().trim() && 
      d.depth?.toString().trim() && 
      d.length?.toString().trim() && 
      d.price?.toString().trim()
    );
    if (!hasValidDimensions) missingFields.push("At least one complete dimension (name, width, height, depth, length, price)");
    
    if (formData.polish_color_ids.length === 0) missingFields.push("At least one polish color");
    
    const hasValidVariants = formData.variants.some(v => v.dimensionId && v.polishColorId);
    if (!hasValidVariants) missingFields.push("At least one valid variant (dimension + polish color)");
    
    if (missingFields.length === 0) return "";
    
    if (missingFields.length === 1) {
      return `Please fill in: ${missingFields[0]}`;
    } else if (missingFields.length === 2) {
      return `Please fill in: ${missingFields[0]} and ${missingFields[1]}`;
    } else {
      return `Please fill in: ${missingFields.slice(0, -1).join(", ")}, and ${missingFields[missingFields.length - 1]}`;
    }
  };

  // === DIMENSIONS ===
  const handleDimensionChange = (index: number, field: keyof Dimension, value: string) => {
    const dims = [...formData.dimensions];
    dims[index][field] = value;
    setFormData({ ...formData, dimensions: dims });
  };

  const addDimension = () => {
    setFormData({
      ...formData,
      dimensions: [
        ...formData.dimensions,
        { name: "", width: "", height: "", depth: "", length: "", price: "" },
      ],
    });
  };

  const removeDimension = (index: number) => {
    // Prevent removing if only one dimension remains
    if (formData.dimensions.length <= 1) return;
    
    const dims = [...formData.dimensions];
    dims.splice(index, 1);
    setFormData({ ...formData, dimensions: dims });
  };

  // === POLISH COLORS ===
  const togglePolishColor = (id: string) => {
    let updated = [...formData.polish_color_ids];
    if (updated.includes(id)) {
      updated = updated.filter((pid) => pid !== id);
    } else {
      updated.push(id);
    }
    setFormData({ ...formData, polish_color_ids: updated });
  };

  // === VARIANTS ===
  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const vars = [...formData.variants];
    vars[index][field] = value;
    setFormData({ ...formData, variants: vars });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { dimensionId: "", polishColorId: "" },
      ],
    });
  };

  const removeVariant = (index: number) => {
    // Prevent removing if only one variant remains
    if (formData.variants.length <= 1) return;
    
    const vars = [...formData.variants];
    vars.splice(index, 1);
    setFormData({ ...formData, variants: vars });
  };

  // === IMAGES ===
  const handleImageUpload = (polishColorId: string, files: FileList | null) => {
    if (!files) return;

    const fileArr = Array.from(files);
    
    // Create blob URLs for the new files
    const newPreviews = fileArr.map((file) => URL.createObjectURL(file));
    
    // Update images with new files
    setFormData(prev => {
      const updatedImages = { ...prev.images };
      
      if (!updatedImages[polishColorId]) {
        updatedImages[polishColorId] = [];
      }
      
      // Add new files to images
      updatedImages[polishColorId] = [...updatedImages[polishColorId], ...fileArr];
      
      return {
        ...prev,
        images: updatedImages
      };
    });

    // Update previews separately to avoid nested state updates
    setImagePreviews(prev => {
      const updated = { ...prev };
      if (!updated[polishColorId]) {
        updated[polishColorId] = [];
      }
      updated[polishColorId] = [...updated[polishColorId], ...newPreviews];
      return updated;
    });
  };

  const removeImage = (polishColorId: string, imageIndex: number) => {
    // For new images, remove from both images array and previews
    const currentFiles = formData.images[polishColorId];
    const currentPreviews = imagePreviews[polishColorId];
    
    if (currentFiles && imageIndex < currentFiles.length) {
      // Remove from images array
      setFormData(prev => {
        const updatedImages = { ...prev.images };
        if (updatedImages[polishColorId]) {
          updatedImages[polishColorId] = updatedImages[polishColorId].filter((_, index) => index !== imageIndex);
        }
        return {
          ...prev,
          images: updatedImages
        };
      });

      // Remove from previews and revoke blob URL
      if (currentPreviews && currentPreviews[imageIndex]) {
        URL.revokeObjectURL(currentPreviews[imageIndex]);
        setImagePreviews(prev => {
          const updated = { ...prev };
          if (updated[polishColorId]) {
            updated[polishColorId] = updated[polishColorId].filter((_, index) => index !== imageIndex);
          }
          return updated;
        });
      }
    }
  };

  const removeExistingImage = (polishColorId: string, imageId: string) => {
    setExistingImagePreviews(prev => {
      const updated = { ...prev };
      if (updated[polishColorId]) {
        updated[polishColorId] = updated[polishColorId].filter(img => img.id !== imageId);
      }
      return updated;
    });
  };

  const setPrimaryImage = (polishColorId: string, imageIndex: number, isExisting: boolean) => {
    if (isExisting) {
      // Set primary for existing image
      setExistingImagePreviews(prev => {
        const updated = { ...prev };
        if (updated[polishColorId]) {
          updated[polishColorId] = updated[polishColorId].map((img, idx) => ({
            ...img,
            is_primary: idx === imageIndex
          }));
        }
        return updated;
      });
    } else {
      // Set primary for new image
      setPrimaryIndices(prev => ({
        ...prev,
        [polishColorId]: imageIndex
      }));
    }
  };

  const handleDrag = (e: React.DragEvent, polishColorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [polishColorId]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [polishColorId]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, polishColorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [polishColorId]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(polishColorId, e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = editingProduct 
      ? {
          type: 'save' as const,
          title: 'Update Product',
          description: 'Are you sure you want to update this product? This will save all your changes to the database.',
          confirmText: 'Update Product',
          cancelText: 'Continue Editing',
          onConfirm: async () => {
            try {
              await updateProduct(e);
              setShowConfirmModal(false);
            } catch (error) {
              console.error("Failed to update product:", error);
              // Keep modal open on error
            }
          }
        }
      : {
          type: 'save' as const,
          title: 'Add Product',
          description: 'Are you sure you want to add this new product? This will create a new product in the database.',
          confirmText: 'Add Product',
          cancelText: 'Continue Editing',
          onConfirm: async () => {
            try {
              await addProduct(e);
              setShowConfirmModal(false);
            } catch (error) {
              console.error("Failed to add product:", error);
              // Keep modal open on error
            }
          }
        };

    setConfirmModalConfig(config);
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    // For new products, if form is empty, just go back without confirmation
    if (!editingProduct && isFormEmpty()) {
      cancelEdit();
      return;
    }

    // Show confirmation modal for any changes (new product) or always for editing
    const config = {
      type: 'discard' as const,
      title: 'Discard Changes',
      description: 'Are you sure you want to discard all your changes? This action cannot be undone and you will lose all unsaved progress.',
      confirmText: 'Discard Changes',
      cancelText: 'Continue Editing',
      onConfirm: () => {
        setShowConfirmModal(false);
        cancelEdit();
      }
    };

    setConfirmModalConfig(config);
    setShowConfirmModal(true);
  };

  const handleReset = () => {
    const config = {
      type: 'reset' as const,
      title: 'Reset Form',
      description: 'Are you sure you want to reset the form? This will clear all your current inputs and return the form to its initial state.',
      confirmText: 'Reset Form',
      cancelText: 'Continue Editing',
      onConfirm: () => {
        setShowConfirmModal(false);
        // Reset form to initial state
        const initialImages = { primaryIndices: {} } as Record<string, File[]> & { primaryIndices?: Record<string, number> };
        
        setFormData({
          name: "",
          description: "",
          category_id: "",
          dimensions: [{ name: "", width: "", height: "", depth: "", length: "", price: "" }], // Always include one dimension
          polish_color_ids: [],
          variants: [{ dimensionId: "", polishColorId: "" }], // Always include one variant
          images: initialImages,
          existingImages: {},
        });
        setImagePreviews({});
        setExistingImagePreviews({});
        setPrimaryIndices({});
      }
    };

    setConfirmModalConfig(config);
    setShowConfirmModal(true);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-2xl">
                {editingProduct ? (
                  <Edit3 className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h1>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="p-8">
          <Card className="border-gray-200/50 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#23423d]/10 to-[#1e3b36]/10 rounded-2xl">
                  <Package className="h-5 w-5 text-[#23423d]" />
                </div>
                <CardTitle className="text-[#23423d]">Product Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* NAME */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4 text-[#23423d]" />
                    Product Name
                  </Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: e.target.value
                    }))}
                    required
                    className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                    placeholder="e.g., Modern Oak Dining Table"
                  />
                </div>

                {/* CATEGORY */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4 text-[#23423d]" />
                    Category
                  </Label>
                  <select
                    value={formData.category_id || ""}
                    onChange={(e) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        category_id: e.target.value
                      }))
                    }
                    className="w-full border border-gray-200 rounded px-3 py-2 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20"
                  >
                    <option value="">Select a category for your product</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-[#23423d]" />
                  Description
                </Label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value
                    }))
                  }
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 resize-none"
                  rows={4}
                  placeholder="Describe your product's features, materials, and craftsmanship details..."
                />
              </div>

              {/* DIMENSIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Ruler className="w-5 h-5 text-[#23423d]" />
                    Dimensions
                  </Label>
                  <Button 
                    type="button" 
                    onClick={addDimension} 
                    className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Dimension
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.dimensions.map((d, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="grid md:grid-cols-6 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Tag className="w-4 h-4 text-[#23423d]" />
                            Size Name
                          </Label>
                          <Input
                            placeholder="e.g. Small, Medium, Large"
                            value={d.name || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "name", e.target.value)
                            }
                            required
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="w-4 h-4 text-[#23423d]" />
                            Width (in)
                          </Label>
                          <Input
                            placeholder="24"
                            type="number"
                            value={d.width || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "width", e.target.value)
                            }
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="w-4 h-4 text-[#23423d]" />
                            Height (in)
                          </Label>
                          <Input
                            placeholder="30"
                            type="number"
                            value={d.height || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "height", e.target.value)
                            }
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="w-4 h-4 text-[#23423d]" />
                            Depth (in)
                          </Label>
                          <Input
                            placeholder="18"
                            type="number"
                            value={d.depth || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "depth", e.target.value)
                            }
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="w-4 h-4 text-[#23423d]" />
                            Length (in)
                          </Label>
                          <Input
                            placeholder="60"
                            type="number"
                            value={d.length || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "length", e.target.value)
                            }
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Package className="w-4 h-4 text-[#23423d]" />
                            Price (RS)
                          </Label>
                          <Input
                            placeholder="15000"
                            type="number"
                            value={d.price || ""}
                            onChange={(e) =>
                              handleDimensionChange(i, "price", e.target.value)
                            }
                            className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeDimension(i)}
                        disabled={formData.dimensions.length <= 1}
                        className={`mt-6 ${formData.dimensions.length <= 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} rounded-xl shadow-md hover:shadow-lg transition-all`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Dimension
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* POLISH COLORS */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Palette className="w-5 h-5 text-[#23423d]" />
                  Polish Colors
                </Label>
                <p className="text-sm text-gray-600 mb-4">Select the available polish colors for this product</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {polishColors.map((c) => (
                    <label 
                      key={c.id} 
                      className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                        formData.polish_color_ids.includes(c.id)
                          ? 'border-[#23423d] bg-gradient-to-br from-[#23423d]/10 to-[#23423d]/5 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.polish_color_ids.includes(c.id)}
                        onChange={() => togglePolishColor(c.id)}
                        className="w-5 h-5 text-[#23423d] rounded focus:ring-[#23423d]"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {c.hex_code && (
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-md"
                            style={{ backgroundColor: c.hex_code }}
                          />
                        )}
                        <span className="font-semibold text-gray-800">{c.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* VARIANTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Grid className="w-5 h-5 text-[#23423d]" />
                    Variants (Dimension × Polish Color)
                  </Label>
                  <Button 
                    type="button" 
                    onClick={addVariant} 
                    className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Variant
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-6">Create combinations of dimensions and polish colors</p>
                <div className="space-y-6">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="w-4 h-4 text-[#23423d]" />
                            Size Dimension
                          </Label>
                          <select
                            value={v.dimensionId || ""}
                            onChange={(e) =>
                              handleVariantChange(i, "dimensionId", e.target.value)
                            }
                            className="w-full h-14 border border-gray-200 rounded-xl px-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 bg-white shadow-sm"
                          >
                            <option value="">Choose size dimension</option>
                            {formData.dimensions.map((d, idx) => (
                              <option key={idx} value={idx.toString()}>
                                {d.name || `Dimension ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Palette className="w-4 h-4 text-[#23423d]" />
                            Polish Color
                          </Label>
                          <select
                            value={v.polishColorId || ""}
                            onChange={(e) =>
                              handleVariantChange(i, "polishColorId", e.target.value)
                            }
                            className="w-full h-14 border border-gray-200 rounded-xl px-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 bg-white shadow-sm"
                          >
                            <option value="">Choose polish color</option>
                            {formData.polish_color_ids.map((pid) => {
                              const p = polishColors.find((c) => c.id === pid);
                              return (
                                <option key={pid} value={pid}>
                                  {p?.name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeVariant(i)}
                        disabled={formData.variants.length <= 1}
                        className={`mt-6 ${formData.variants.length <= 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} rounded-xl shadow-md hover:shadow-lg transition-all`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Variant
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMAGES PER POLISH */}
              {formData.polish_color_ids.map((pid) => {
                const polish = polishColors.find((c) => c.id === pid);
                return (
                  <div key={pid} className="space-y-4">
                    <Label className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                      <ImageIcon className="w-5 h-5 text-[#23423d]" />
                      <span>Images for</span>
                      {polish?.hex_code && (
                        <div 
                          className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-md"
                          style={{ backgroundColor: polish.hex_code }}
                        />
                      )}
                      <span className="text-[#23423d]">{polish?.name}</span>
                    </Label>
                    
                    <div 
                      className={`bg-gradient-to-br from-gray-50 to-gray-100/50 p-12 rounded-3xl border-2 border-dashed transition-all shadow-sm cursor-pointer ${
                        dragActive[pid] 
                          ? 'border-[#23423d] bg-[#23423d]/5' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={(e) => handleDrag(e, pid)}
                      onDragLeave={(e) => handleDrag(e, pid)}
                      onDragOver={(e) => handleDrag(e, pid)}
                      onDrop={(e) => handleDrop(e, pid)}
                      onClick={() => imageInputRefs.current[pid]?.click()}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-white rounded-3xl shadow-lg mb-8">
                          <Upload className="w-16 h-16 text-[#23423d]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Upload images for {polish?.name} finish
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Drag and drop your files here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, WebP up to 10MB each
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          ref={(el) => { imageInputRefs.current[pid] = el; }}
                          onChange={(e) => handleImageUpload(pid, e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Image Previews - Outside upload area */}
                    {(imagePreviews[pid]?.length > 0 || existingImagePreviews[pid]?.length > 0) && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-[#23423d]" />
                          Images ({(imagePreviews[pid]?.length || 0) + (existingImagePreviews[pid]?.length || 0)})
                          {editingProduct && (
                            <span className="text-sm text-gray-500 font-normal">
                              - Existing: {existingImagePreviews[pid]?.length || 0}, 
                              New: {imagePreviews[pid]?.length || 0}
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {/* Display existing images */}
                          {existingImagePreviews[pid]?.map((img, i) => (
                            <div key={`existing-${img.id}`} className="relative group">
                              <img
                                src={img.public_url}
                                alt={`Existing ${i + 1} for ${polish?.name}`}
                                className={`w-full h-36 object-cover rounded-2xl border shadow-md group-hover:shadow-lg transition-all ${
                                  img.is_primary ? 'border-green-500 border-2' : 'border-gray-200'
                                }`}
                              />
                              {img.is_primary && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  Primary
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex items-center justify-center">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImage(pid, i, true)}
                                    className="bg-yellow-400 hover:bg-yellow-500 rounded-full w-10 h-10 p-0 shadow-lg transition-all transform hover:scale-110 flex items-center justify-center"
                                  >
                                    <Check className="w-5 h-5 text-white font-bold" strokeWidth={3} />
                                  </button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeExistingImage(pid, img.id)}
                                    className="bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 p-0 shadow-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                <span className="text-xs font-medium text-gray-800">Existing #{i + 1}</span>
                              </div>
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white">
                                Existing
                              </div>
                            </div>
                          ))}
                          
                          {/* Display new images */}
                          {imagePreviews[pid]?.map((url, i) => {
                            const isPrimary = primaryIndices[pid] === i;
                            
                            return (
                              <div key={`new-${i}`} className="relative group">
                                <img
                                  src={url}
                                  alt={`Preview ${i + 1} for ${polish?.name}`}
                                  className={`w-full h-36 object-cover rounded-2xl border shadow-md group-hover:shadow-lg transition-all ${
                                    isPrimary ? 'border-green-500 border-2' : 'border-gray-200'
                                  }`}
                                />
                                {isPrimary && (
                                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Primary
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex items-center justify-center">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryImage(pid, i, false)}
                                      className="bg-yellow-400 hover:bg-yellow-500 rounded-full w-10 h-10 p-0 shadow-lg transition-all transform hover:scale-110 flex items-center justify-center"
                                    >
                                      <Check className="w-5 h-5 text-white font-bold" strokeWidth={3} />
                                    </button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeImage(pid, i)}
                                      className="bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 p-0 shadow-lg"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                  <span className="text-xs font-medium text-gray-800">#{i + 1}</span>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium bg-green-500 text-white">
                                  New
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="flex-1 bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingProduct ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <>
                      {editingProduct ? (
                        <Edit3 className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {editingProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setShowConfirmModal(false)}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        loading={loading}
      />
    </>
  );
}