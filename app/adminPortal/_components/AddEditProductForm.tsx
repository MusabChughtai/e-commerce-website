"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
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
  stock: string;
}

interface FormData {
  name: string;
  description: string;
  category_id: string;
  dimensions: Dimension[];
  polish_color_ids: string[];
  variants: Variant[];
  images: Record<string, File[]>;
}

interface AddEditProductFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  editingProduct: any;
  addProduct: (e: React.FormEvent) => void;
  updateProduct: (e: React.FormEvent) => void;
  cancelEdit: () => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
}

export function AddEditProductForm({
  formData,
  setFormData,
  editingProduct,
  addProduct,
  updateProduct,
  cancelEdit,
  showSuccessModal,
  setShowSuccessModal,
}: AddEditProductFormProps) {
  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>(
    {}
  );
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  // === CATEGORY ===
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name");
      setCategories(data as Category[] || []);
    }
    fetchCategories();
  }, []);

  // === POLISH COLORS ===
  const [polishColors, setPolishColors] = useState<PolishColor[]>([]);

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
      // Populate polish colors
      if (editingProduct.polish_colors && editingProduct.polish_colors.length > 0) {
        const polishColorIds = editingProduct.polish_colors.map((pc: any) => pc.id);
        setFormData(prev => ({
          ...prev,
          polish_color_ids: polishColorIds
        }));
      }

      // Populate variants
      if (editingProduct.variants && editingProduct.variants.length > 0) {
        const variants = editingProduct.variants.map((v: any) => ({
          dimensionId: v.dimension_id?.toString() || "",
          polishColorId: v.polish_color_id || "",
          stock: v.stock?.toString() || ""
        }));
        setFormData(prev => ({
          ...prev,
          variants: variants
        }));
      }

      // Populate images and image previews
      if (editingProduct.images && editingProduct.images.length > 0) {
        const imagesByPolish: Record<string, string[]> = {};
        editingProduct.images.forEach((img: any) => {
          if (img.polish_color_id && img.image_url) {
            if (!imagesByPolish[img.polish_color_id]) {
              imagesByPolish[img.polish_color_id] = [];
            }
            imagesByPolish[img.polish_color_id].push(img.image_url);
          }
        });
        setImagePreviews(imagesByPolish);
        
        // Note: We can't populate actual File objects for existing images,
        // but we can show the previews. The backend should handle this case.
        setFormData(prev => ({
          ...prev,
          images: {} // Clear file objects for existing images
        }));
      }
    }
  }, [editingProduct, polishColors, setFormData]);

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
        { dimensionId: "", polishColorId: "", stock: "" },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const vars = [...formData.variants];
    vars.splice(index, 1);
    setFormData({ ...formData, variants: vars });
  };

  // === IMAGES ===
  const handleImageUpload = (polishColorId: string, files: FileList | null) => {
    if (!files) return;

    const fileArr = Array.from(files);
    const updated = { ...formData.images };
    updated[polishColorId] = (updated[polishColorId] || []).concat(fileArr);
    setFormData({ ...formData, images: updated });

    const previews = fileArr.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => ({
      ...prev,
      [polishColorId]: [...(prev[polishColorId] || []), ...previews],
    }));
  };

  const removeImage = (polishColorId: string, imageIndex: number) => {
    const updatedImages = { ...formData.images };
    const updatedPreviews = { ...imagePreviews };
    
    if (updatedImages[polishColorId]) {
      updatedImages[polishColorId].splice(imageIndex, 1);
    }
    
    if (updatedPreviews[polishColorId]) {
      URL.revokeObjectURL(updatedPreviews[polishColorId][imageIndex]);
      updatedPreviews[polishColorId].splice(imageIndex, 1);
    }
    
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editingProduct ? updateProduct(e) : addProduct(e);
  };

  return (
    <>
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in-0">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-200/50 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-gradient-to-br from-[#23423d] to-[#1e3b36] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              {editingProduct ? "Product Updated" : "Product Added"}
            </h3>
            <p className="text-gray-600 mb-8">
              {editingProduct
                ? "Your product has been updated successfully."
                : "Your product has been added successfully."}
            </p>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white px-8 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Close
            </Button>
          </div>
        </div>
      )}

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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                    Add Dimension
                  </Button>
                </div>
                <div className="space-y-6">
                  {formData.dimensions.map((d, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="grid md:grid-cols-6 gap-4">
                        <Input
                          placeholder="Size (e.g. Small)"
                          value={d.name}
                          onChange={(e) =>
                            handleDimensionChange(i, "name", e.target.value)
                          }
                          required
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                        <Input
                          placeholder="Width (in)"
                          type="number"
                          value={d.width}
                          onChange={(e) =>
                            handleDimensionChange(i, "width", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                        <Input
                          placeholder="Height (in)"
                          type="number"
                          value={d.height}
                          onChange={(e) =>
                            handleDimensionChange(i, "height", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                        <Input
                          placeholder="Depth (in)"
                          type="number"
                          value={d.depth}
                          onChange={(e) =>
                            handleDimensionChange(i, "depth", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                        <Input
                          placeholder="Length (in)"
                          type="number"
                          value={d.length}
                          onChange={(e) =>
                            handleDimensionChange(i, "length", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                        <Input
                          placeholder="Price (RS)"
                          type="number"
                          value={d.price}
                          onChange={(e) =>
                            handleDimensionChange(i, "price", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-12 bg-white shadow-sm"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeDimension(i)}
                        className="mt-6 bg-red-500 hover:bg-red-600 rounded-xl shadow-md hover:shadow-lg transition-all"
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
                    Variants (Dimension × Polish Color × Stock)
                  </Label>
                  <Button 
                    type="button" 
                    onClick={addVariant} 
                    className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-6">Create combinations of dimensions and polish colors with their stock quantities</p>
                <div className="space-y-6">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="grid md:grid-cols-3 gap-4">
                        <select
                          value={v.dimensionId}
                          onChange={(e) =>
                            handleVariantChange(i, "dimensionId", e.target.value)
                          }
                          className="h-14 border border-gray-200 rounded-xl px-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 bg-white shadow-sm"
                        >
                          <option value="">Choose size dimension</option>
                          {formData.dimensions.map((d, idx) => (
                            <option key={idx} value={idx.toString()}>
                              {d.name || `Dimension ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                        <select
                          value={v.polishColorId}
                          onChange={(e) =>
                            handleVariantChange(i, "polishColorId", e.target.value)
                          }
                          className="h-14 border border-gray-200 rounded-xl px-4 focus:border-[#23423d] focus:ring-2 focus:ring-[#23423d]/20 bg-white shadow-sm"
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
                        <Input
                          placeholder="Stock quantity"
                          type="number"
                          value={v.stock}
                          onChange={(e) =>
                            handleVariantChange(i, "stock", e.target.value)
                          }
                          className="border-gray-200 rounded-xl h-14 bg-white shadow-sm"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeVariant(i)}
                        className="mt-6 bg-red-500 hover:bg-red-600 rounded-xl shadow-md hover:shadow-lg transition-all"
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
                    {imagePreviews[pid]?.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-[#23423d]" />
                          Uploaded Images ({imagePreviews[pid]?.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {imagePreviews[pid]?.map((url, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${i + 1} for ${polish?.name}`}
                                className="w-full h-36 object-cover rounded-2xl border border-gray-200 shadow-md group-hover:shadow-lg transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex items-center justify-center">
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
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                <span className="text-xs font-medium text-gray-800">#{i + 1}</span>
                              </div>
                            </div>
                          ))}
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
                  className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white px-12 py-6 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 hover:scale-105 min-w-[200px] group"
                >
                  <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit}
                  className="border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-12 py-6 rounded-3xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 min-w-[200px] group"
                >
                  <RotateCcw className="w-6 h-6 mr-3 group-hover:-rotate-12 transition-transform" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}