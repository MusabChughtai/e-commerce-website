"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  RotateCcw
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
    console.log("Form submitted:", { editingProduct }); // Debug log
    
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
    console.log("Cancel button clicked"); // Debug log
    
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
    console.log("Reset button clicked"); // Debug log
    
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-2xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* NAME */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
                    className="h-14 border-gray-200 rounded-2xl focus:border-[#23423d] focus:ring-[#23423d] shadow-sm bg-white/50"
                    placeholder="e.g., Modern Oak Dining Table"
                  />
                </div>

                {/* CATEGORY */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
                    className="w-full h-14 border border-gray-200 rounded-2xl px-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 bg-white/50 shadow-sm"
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
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
                  className="w-full h-28 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 resize-none bg-white/50 shadow-sm"
                  placeholder="Describe your product's features, materials, and craftsmanship details..."
                />
              </div>

              {/* DIMENSIONS */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Ruler className="w-6 h-6 text-[#23423d]" />
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
              <div className="space-y-6">
                <Label className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <Palette className="w-6 h-6 text-[#23423d]" />
                  Polish Colors
                </Label>
                <p className="text-sm text-gray-600 mb-6">Select the available polish colors for this product</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Grid className="w-6 h-6 text-[#23423d]" />
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
                  <div key={pid} className="space-y-6">
                    <Label className="flex items-center gap-3 text-xl font-bold text-gray-800">
                      <ImageIcon className="w-6 h-6 text-[#23423d]" />
                      <span>Images for</span>
                      {polish?.hex_code && (
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-md"
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
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
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

              {/* Submit Buttons - Enhanced and Centered */}
              <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-gray-200 justify-center items-center">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white px-12 py-6 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 hover:scale-105 min-w-[200px] group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mr-3"></div>
                      {editingProduct ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </Button>
                {/* Only show Reset button when adding new product (not editing) */}
                {!editingProduct && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={loading}
                    className="border-2 border-orange-300 hover:border-orange-400 bg-white hover:bg-orange-50 text-orange-700 hover:text-orange-900 px-12 py-6 rounded-3xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 min-w-[200px] group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <RotateCcw className="w-6 h-6 mr-3 group-hover:-rotate-12 transition-transform" />
                    Reset Form
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-12 py-6 rounded-3xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 min-w-[200px] group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <X className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
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