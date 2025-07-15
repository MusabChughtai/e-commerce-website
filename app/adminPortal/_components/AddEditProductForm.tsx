"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

// Type definitions
interface Category {
  id: string;
  name: string;
}

interface PolishColor {
  id: string;
  name: string;
}

interface Dimension {
  name: string;
  width: string;
  height: string;
  depth: string;
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
  setFormData: (data: FormData) => void;
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
      const { data } = await supabase.from("polish_colors").select("id, name");
      setPolishColors(data as PolishColor[] || []);
    }
    fetchPolishColors();
  }, []);

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
        { name: "", width: "", height: "", depth: "", price: "" },
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

  const clearImages = (polishColorId: string) => {
    setFormData({
      ...formData,
      images: { ...formData.images, [polishColorId]: [] },
    });
    setImagePreviews({ ...imagePreviews, [polishColorId]: [] });
    if (imageInputRefs.current[polishColorId]) {
      imageInputRefs.current[polishColorId]!.value = "";
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">
              {editingProduct ? "Product Updated" : "Product Added"}
            </h3>
            <p className="text-gray-600 mb-4">
              {editingProduct
                ? "Product was updated successfully."
                : "Product was added successfully."}
            </p>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow rounded">
        {/* NAME */}
        <div>
          <Label>Product Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* CATEGORY */}
        <div>
          <Label>Category</Label>
          <select
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: e.target.value })
            }
            className="w-full border rounded p-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* DIMENSIONS */}
        <div>
          <Label>Dimensions</Label>
          <div className="space-y-4">
            {formData.dimensions.map((d, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <Input
                  placeholder="Name"
                  value={d.name}
                  onChange={(e) =>
                    handleDimensionChange(i, "name", e.target.value)
                  }
                  required
                />
                <Input
                  placeholder="Width"
                  type="number"
                  value={d.width}
                  onChange={(e) =>
                    handleDimensionChange(i, "width", e.target.value)
                  }
                />
                <Input
                  placeholder="Height"
                  type="number"
                  value={d.height}
                  onChange={(e) =>
                    handleDimensionChange(i, "height", e.target.value)
                  }
                />
                <Input
                  placeholder="Depth"
                  type="number"
                  value={d.depth}
                  onChange={(e) =>
                    handleDimensionChange(i, "depth", e.target.value)
                  }
                />
                <Input
                  placeholder="Price"
                  type="number"
                  value={d.price}
                  onChange={(e) =>
                    handleDimensionChange(i, "price", e.target.value)
                  }
                />
                <Button type="button" variant="destructive" onClick={() => removeDimension(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addDimension} className="mt-2">
            Add Dimension
          </Button>
        </div>

        {/* POLISH COLORS */}
        <div>
          <Label>Polish Colors</Label>
          <div className="flex gap-2 flex-wrap">
            {polishColors.map((c) => (
              <label key={c.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.polish_color_ids.includes(c.id)}
                  onChange={() => togglePolishColor(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {/* VARIANTS */}
        <div>
          <Label>Variants (Dimension x Polish Color x Stock)</Label>
          <div className="space-y-4">
            {formData.variants.map((v, i) => (
              <div key={i} className="flex gap-2 flex-wrap">
                <select
                  value={v.dimensionId}
                  onChange={(e) =>
                    handleVariantChange(i, "dimensionId", e.target.value)
                  }
                >
                  <option value="">Dimension</option>
                  {formData.dimensions.map((d, idx) => (
                    <option key={idx} value={idx.toString()}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  value={v.polishColorId}
                  onChange={(e) =>
                    handleVariantChange(i, "polishColorId", e.target.value)
                  }
                >
                  <option value="">Polish</option>
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
                  placeholder="Stock"
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    handleVariantChange(i, "stock", e.target.value)
                  }
                />
                <Button type="button" variant="destructive" onClick={() => removeVariant(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addVariant} className="mt-2">
            Add Variant
          </Button>
        </div>

        {/* IMAGES PER POLISH */}
        {formData.polish_color_ids.map((pid) => {
          const polishName = polishColors.find((c) => c.id === pid)?.name;
          return (
            <div key={pid}>
              <Label>Images for {polishName}</Label>
              <Input
                type="file"
                multiple
                ref={(el) => { imageInputRefs.current[pid] = el; }}
                onChange={(e) => handleImageUpload(pid, e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => clearImages(pid)}
              >
                Clear Images
              </Button>

              <div className="flex gap-2 flex-wrap mt-2">
                {imagePreviews[pid]?.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex gap-4">
          <Button type="submit">
            {editingProduct ? "Update" : "Add"} Product
          </Button>
          {editingProduct && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </>
  );
}