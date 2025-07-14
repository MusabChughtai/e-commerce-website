"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";

interface AddEditProductFormProps {
  formData: any;
  setFormData: (data: any) => void;
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
  const [showDiscount, setShowDiscount] = useState(
    formData.discount && Number(formData.discount) > 0
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const polishOptions = ["Matte", "Gloss", "Natural", "Dark Oak", "Light Walnut"];

  // === Handlers ===
  const handleVariantChange = (index: number, field: string, value: string) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { dimension: "", price: "" }],
    });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index, 1);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Update form data with File objects
    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...formData.images];
    const removedImage = updatedImages.splice(index, 1)[0];
    
    // Revoke object URL if it's a File object
    if (removedImage instanceof File) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const clearImages = () => {
    // Revoke all object URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setFormData({ ...formData, images: [] });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(e);
    } else {
      addProduct(e);
    }
    // Clear form after submission
    clearImages();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {editingProduct ? 'Product Updated!' : 'Product Added!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {editingProduct ? 'Product has been updated successfully.' : 'Product has been added successfully.'}
              </p>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-[#4a7c59] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className="space-y-6 bg-white shadow p-6 rounded-lg"
      >
      {/* Name */}
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Short Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Full Description */}
      <div>
        <Label htmlFor="full_description">Full Description</Label>
        <Input
          id="full_description"
          value={formData.full_description}
          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
        />
      </div>

      {/* Base Price */}
      <div>
        <Label htmlFor="base_price">Base Price</Label>
        <Input
          id="base_price"
          type="number"
          step="0.01"
          value={formData.base_price}
          onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
          required
        />
      </div>

      {/* Polish Color */}
      <div>
        <Label htmlFor="polish_color">Polish Color</Label>
        <select
          id="polish_color"
          value={formData.polish_color}
          onChange={(e) => setFormData({ ...formData, polish_color: e.target.value })}
          className="w-full border border-gray-300 rounded p-2"
        >
          <option value="">Select Polish</option>
          {polishOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Discount */}
      <div>
        <Label>Discount</Label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDiscount}
            onChange={() => {
              if (showDiscount) {
                setFormData({ ...formData, discount: "" });
              }
              setShowDiscount(!showDiscount);
            }}
          />
          <span>Apply Discount</span>
        </div>
        {showDiscount && (
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            placeholder="Enter discount percentage"
          />
        )}
      </div>

      {/* Variants */}
      <div>
        <Label>Dimensions & Prices</Label>
        <div className="space-y-4">
          {formData.variants.map((variant: any, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Dimension (e.g. 4x6 ft)"
                value={variant.dimension}
                onChange={(e) =>
                  handleVariantChange(index, "dimension", e.target.value)
                }
                required
              />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                required
              />
              {formData.variants.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeVariant(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" onClick={addVariant} className="mt-2">
          Add Dimension
        </Button>
      </div>

      {/* Images */}
      <div>
        <Label>Product Images</Label>
        <div className="space-y-4">
          {/* File Input */}
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="flex-1"
            />
            <Button type="button" onClick={clearImages} variant="outline">
              Clear All
            </Button>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show existing images when editing */}
          {editingProduct && editingProduct.product_images?.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600">Current Images:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {editingProduct.product_images.map((img: any, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={img.image_url}
                      alt={`Current ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    {img.is_primary && (
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload new images to replace current ones
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" className="bg-[#4a7c59] text-white" disabled={formData.images.length === 0}>
          {editingProduct ? "Update Product" : "Add Product"}
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