"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    full_description: "",
    base_price: "",
    polish_color: "",
    discount: "",
    variants: [
      {
        dimension: "",
        price: "",
      },
    ],
    images: [], // Will store File objects and existing image data
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Clean fetchProducts version
  // ✅ FINAL fetchProducts — robust version
  async function fetchProducts() {
    setLoading(true);

    try {
      const { data, error } = await supabase.from("products").select(`
      *,
      product_variants (*),
      product_images (*)
    `);

      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      const productsWithImages = data?.map((product) => {
        if (product.product_images && product.product_images.length > 0) {
          const imagesWithUrls = product.product_images.map((img: any) => {
            let publicUrl = img.image_url;

            // ✅ If it’s NOT already a full URL, then build one
            if (!img.image_url.startsWith("http")) {
              const { data: urlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(img.image_url);
              publicUrl = urlData?.publicUrl || "/placeholder.svg";
            }

            return {
              ...img,
              image_url: publicUrl,
            };
          });

          return {
            ...product,
            product_images: imagesWithUrls,
          };
        }
        return product;
      });

      console.log("Products with images:", productsWithImages);
      setProducts(productsWithImages || []);
      setLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  }





  // Helper function to upload images to Supabase storage
  // ✅ Fixed uploadImages:
  // ✅ uploadImages — version for root storage
  async function uploadImages(files: File[], productId: string) {
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      uploadedImages.push({
        url: fileName, // ✅ store only the storage key — no bucket name!
        is_primary: i === 0,
      });
    }

    return uploadedImages;
  }



  // Helper function to delete images from storage
  async function deleteImagesFromStorage(imageUrls: string[]) {
    for (const url of imageUrls) {
      // Extract filename from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      await supabase.storage
        .from('product-images')
        .remove([fileName]);
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      name,
      description,
      full_description,
      base_price,
      polish_color,
      discount,
      variants,
      images,
    } = formData;

    // Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          full_description,
          base_price: Number(base_price),
          polish_color,
          discount: Number(discount) || 0,
        },
      ])
      .select()
      .single();

    if (productError) {
      console.error(productError);
      setLoading(false);
      return;
    }

    const productId = product.id;

    // Insert variants
    const variantsToInsert = variants.map((v) => ({
      product_id: productId,
      dimension: v.dimension,
      price: Number(v.price),
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantError) {
      console.error(variantError);
      setLoading(false);
      return;
    }

    // Handle image uploads
    const imageFiles = images.filter((img: any) => img instanceof File);
    if (imageFiles.length > 0) {
      const uploadedImages = await uploadImages(imageFiles, productId);

      if (uploadedImages.length > 0) {
        const imagesToInsert = uploadedImages.map((img) => ({
          product_id: productId,
          image_url: img.url,
          is_primary: img.is_primary,
        }));

        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imagesToInsert);

        if (imageError) console.error(imageError);
      }
    }

    await fetchProducts();
    resetForm();
    setShowSuccessModal(true);
    setLoading(false);
  }

  async function updateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);

    const {
      name,
      description,
      full_description,
      base_price,
      polish_color,
      discount,
      variants,
      images,
    } = formData;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name,
        description,
        full_description,
        base_price: Number(base_price),
        polish_color,
        discount: Number(discount) || 0,
      })
      .eq("id", editingProduct.id);

    if (updateError) {
      console.error(updateError);
      setLoading(false);
      return;
    }

    // Remove old variants, insert new
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", editingProduct.id);

    const newVariants = variants.map((v) => ({
      product_id: editingProduct.id,
      dimension: v.dimension,
      price: Number(v.price),
    }));

    await supabase.from("product_variants").insert(newVariants);

    // Handle image updates
    const existingImages = editingProduct.product_images || [];
    const existingImageUrls = existingImages.map((img: any) => img.image_url);

    // Delete old images from storage
    await deleteImagesFromStorage(existingImageUrls);

    // Remove old image records
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", editingProduct.id);

    // Upload new images
    const imageFiles = images.filter((img: any) => img instanceof File);
    if (imageFiles.length > 0) {
      const uploadedImages = await uploadImages(imageFiles, editingProduct.id);

      if (uploadedImages.length > 0) {
        const imagesToInsert = uploadedImages.map((img) => ({
          product_id: editingProduct.id,
          image_url: img.url,
          is_primary: img.is_primary,
        }));

        await supabase.from("product_images").insert(imagesToInsert);
      }
    }

    await fetchProducts();
    resetForm();
    setShowSuccessModal(true);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    setLoading(true);

    // Get product images before deletion
    const { data: productImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    if (productImages && productImages.length > 0) {
      const imageUrls = productImages.map((img) => img.image_url);
      await deleteImagesFromStorage(imageUrls);
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);

    await fetchProducts();
    setLoading(false);
  }

  function startEdit(product: any) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      full_description: product.full_description,
      base_price: product.base_price,
      polish_color: product.polish_color,
      discount: product.discount,
      variants: product.product_variants || [{ dimension: "", price: "" }],
      images: [], // Reset images for editing (user will upload new ones)
    });
  }

  function cancelEdit() {
    resetForm();
  }

  function resetForm() {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      full_description: "",
      base_price: "",
      polish_color: "",
      discount: "",
      variants: [{ dimension: "", price: "" }],
      images: [],
    });
  }

  return {
    products,
    loading,
    editingProduct,
    formData,
    setFormData,
    showSuccessModal,
    setShowSuccessModal,
    addProduct,
    updateProduct,
    deleteProduct,
    startEdit,
    cancelEdit,
  };
}