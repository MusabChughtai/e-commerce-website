"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  dimensions: any[];
  polish_colors: any[];
  variant_options: any[];
  product_images: any[];
  product_polish_colors: any[]; // Added to fix the error
}

interface ExistingImage {
  id: string;
  image_url: string;
  public_url: string;
  polish_color_id: string;
  is_primary: boolean;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    category_id: "",
    dimensions: [],
    polish_color_ids: [],
    variants: [],
    images: { primaryIndices: {} }, // { [polishColorId]: File[], primaryIndices: { [polishColorId]: number } }
    existingImages: {}, // { [polishColorId]: ExistingImage[] }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
  setLoading(true);
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        description
      ),
      dimensions (
        id,
        name,
        width,
        height,
        depth,
        length,
        price
      ),
      product_polish_colors (
        id,
        polish_colors (
          id,
          name,
          hex_code,
          description
        )
      ),
      variant_options (
        id,
        dimension_id,
        polish_color_id,
        stock_quantity,
        dimensions (
          id,
          name,
          width,
          height,
          depth,
          length,
          price
        ),
        polish_colors (
          id,
          name,
          hex_code,
          description
        )
      ),
      product_images (
        id,
        polish_color_id,
        image_url,
        is_primary,
        polish_colors (
          id,
          name,
          hex_code
        )
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    setLoading(false);
    return;
  }

  // Transform data to match component expectations
  const transformedProducts = data?.map((product) => {
    // Get public URLs for images
    const transformedImages = product.product_images?.map((img:any) => {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(img.image_url);
      
      return {
        ...img,
        public_url: urlData?.publicUrl || img.image_url
      };
    }) || [];

    // Transform variant options to include full dimension and color info
    const transformedVariants = product.variant_options?.map((variant:any) => ({
      id: variant.id,
      dimension_id: variant.dimension_id,
      polish_color_id: variant.polish_color_id,
      stock_quantity: variant.stock_quantity,
      price: variant.dimensions?.price || 0,
      dimension_name: variant.dimensions?.name || 
        `${variant.dimensions?.width}x${variant.dimensions?.height}${variant.dimensions?.depth ? 'x' + variant.dimensions?.depth : ''}`,
      color_name: variant.polish_colors?.name || 'Unknown',
      color_hex: variant.polish_colors?.hex_code,
      width: variant.dimensions?.width,
      height: variant.dimensions?.height,
      depth: variant.dimensions?.depth
    })) || [];

    // Get available polish colors for this product
    const availableColors = product.product_polish_colors?.map((ppc:any) => ({
      id: ppc.polish_colors?.id,
      name: ppc.polish_colors?.name,
      hex_code: ppc.polish_colors?.hex_code,
      description: ppc.polish_colors?.description
    })) || [];

    return {
      ...product,
      product_images: transformedImages,
      product_variants: transformedVariants,
      available_colors: availableColors,
      category_name: product.categories?.name || 'Uncategorized'
    };
  }) || [];

  setProducts(transformedProducts);
  setLoading(false);
}

  async function uploadImages(productId: string, polishColorId: string, files: File[], primaryIndex?: number) {
    const uploaded: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const fileName = `${productId}_${polishColorId}_${Date.now()}_${i}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (!error) {
        uploaded.push({
          product_id: productId,
          polish_color_id: polishColorId,
          image_url: fileName,
          is_primary: primaryIndex !== undefined ? i === primaryIndex : i === 0, // Use specified primary or default to first
        });
      }
    }
    return uploaded;
  }

  async function deleteImagesFromStorage(fileKeys: string[]) {
    if (fileKeys.length === 0) return;
    await supabase.storage.from("product-images").remove(fileKeys);
  }

async function addProduct(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  const { name, description, category_id, dimensions, polish_color_ids, variants, images } = formData;

  // Insert Product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert([{ name, description, category_id }])
    .select()
    .single();

  if (productError) {
    console.error(productError);
    setLoading(false);
    return;
  }

  const productId = product.id;

  // Insert Dimensions and get the inserted records with IDs
  const dimensionsToInsert = dimensions.map((d: any) => ({
    product_id: productId,
    name: d.name,
    width: d.width,
    height: d.height,
    depth: d.depth,
    length: d.length,
    price: d.price,
  }));
  
  const { data: insertedDimensions, error: dimensionError } = await supabase
    .from("dimensions")
    .insert(dimensionsToInsert)
    .select();

  if (dimensionError) {
    console.error(dimensionError);
    setLoading(false);
    return;
  }

  // Link Polish Colors
  const polishLinks = polish_color_ids.map((pid: string) => ({
    product_id: productId,
    polish_color_id: pid,
  }));
  await supabase.from("product_polish_colors").insert(polishLinks);

  // Insert Variant Options with correct dimension IDs
  const variantsToInsert = variants.map((v: any) => {
    // Find the actual dimension UUID by index from inserted dimensions
    const dimensionIndex = parseInt(v.dimensionId);
    const dimensionUuid = insertedDimensions[dimensionIndex]?.id;
    
    return {
      product_id: productId,
      dimension_id: dimensionUuid,
      polish_color_id: v.polishColorId,
      stock_quantity: parseInt(v.stock),
    };
  });
  
  await supabase.from("variant_options").insert(variantsToInsert);

  // Upload Images
  for (const polishColorId of polish_color_ids) {
    const files = images[polishColorId] || [];
    const primaryIndex = images.primaryIndices?.[polishColorId];
    const uploaded = await uploadImages(productId, polishColorId, files, primaryIndex);
    if (uploaded.length > 0) {
      await supabase.from("product_images").insert(uploaded);
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

  const { name, description, category_id, dimensions, polish_color_ids, variants, images, existingImages } = formData;

  await supabase
    .from("products")
    .update({ name, description, category_id })
    .eq("id", editingProduct.id);

  // Delete old dimensions and insert new ones
  await supabase.from("dimensions").delete().eq("product_id", editingProduct.id);
  
  const dimsToInsert = dimensions.map((d: any) => ({
    product_id: editingProduct.id,
    name: d.name,
    width: d.width,
    height: d.height,
    depth: d.depth,
    length: d.length,
    price: d.price,
  }));
  
  const { data: insertedDimensions, error: dimensionError } = await supabase
    .from("dimensions")
    .insert(dimsToInsert)
    .select();

  if (dimensionError) {
    console.error(dimensionError);
    setLoading(false);
    return;
  }

  await supabase
    .from("product_polish_colors")
    .delete()
    .eq("product_id", editingProduct.id);
  
  const polishLinks = polish_color_ids.map((pid: string) => ({
    product_id: editingProduct.id,
    polish_color_id: pid,
  }));
  await supabase.from("product_polish_colors").insert(polishLinks);

  await supabase
    .from("variant_options")
    .delete()
    .eq("product_id", editingProduct.id);
  
  const variantsToInsert = variants.map((v: any) => {
    // Find the actual dimension UUID by index from inserted dimensions
    const dimensionIndex = parseInt(v.dimensionId);
    const dimensionUuid = insertedDimensions[dimensionIndex]?.id;
    
    return {
      product_id: editingProduct.id,
      dimension_id: dimensionUuid,
      polish_color_id: v.polishColorId,
      stock_quantity: parseInt(v.stock),
    };
  });
  
  await supabase.from("variant_options").insert(variantsToInsert);

  // Images: handle existing and new images separately
  const { data: oldImgs } = await supabase
    .from("product_images")
    .select("id, image_url, polish_color_id")
    .eq("product_id", editingProduct.id);

  // Get IDs of existing images that should be kept
  const keptImageIds = new Set<string>();
  const imagesToDelete: string[] = [];
  
  for (const polishColorId of polish_color_ids) {
    const existingImagesForColor = formData.existingImages[polishColorId] || [];
    existingImagesForColor.forEach((img: ExistingImage) => {
      keptImageIds.add(img.id);
    });
  }

  // Find images to delete (old images not in kept list)
  oldImgs?.forEach((img: any) => {
    if (!keptImageIds.has(img.id)) {
      imagesToDelete.push(img.image_url);
    }
  });

  // Delete removed images from storage and database
  if (imagesToDelete.length > 0) {
    await deleteImagesFromStorage(imagesToDelete);
    // Delete specific image records
    for (const imageUrl of imagesToDelete) {
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", editingProduct.id)
        .eq("image_url", imageUrl);
    }
  }

  // Update primary status for existing images
  for (const polishColorId of polish_color_ids) {
    const existingImagesForColor = existingImages[polishColorId] || [];
    for (const img of existingImagesForColor) {
      await supabase
        .from("product_images")
        .update({ is_primary: img.is_primary })
        .eq("id", img.id);
    }
  }

  // Upload and insert new images only
  for (const polishColorId of polish_color_ids) {
    const newFiles = formData.images[polishColorId] || [];
    if (newFiles.length > 0) {
      const primaryIndex = formData.images.primaryIndices?.[polishColorId];
      const uploaded = await uploadImages(editingProduct.id, polishColorId, newFiles, primaryIndex);
      if (uploaded.length > 0) {
        await supabase.from("product_images").insert(uploaded);
      }
    }
  }

  await fetchProducts();
  resetForm();
  setShowSuccessModal(true);
  setLoading(false);
}

  async function deleteProduct(id: string) {
    setLoading(true);
    const { data: imgs } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    const keys = imgs?.map((i) => i.image_url) || [];
    await deleteImagesFromStorage(keys);
    await supabase.from("products").delete().eq("id", id);

    await fetchProducts();
    setLoading(false);
  }

  function startEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      dimensions: product.dimensions || [],
      polish_color_ids: product.product_polish_colors?.map(
        (p: any) => p.polish_colors?.id || p.polish_color_id
      ) || [],
      variants: product.variant_options?.map((v: any) => {
        // Find the dimension index
        const dimensionIndex = product.dimensions?.findIndex(d => d.id === v.dimension_id) || 0;
        return {
          dimensionId: dimensionIndex.toString(),
          polishColorId: v.polish_color_id,
          stock: v.stock_quantity?.toString() || "0",
        };
      }) || [],
      images: { primaryIndices: {} }, // Reset new images and primary indices
      existingImages: {}, // Will be populated by the form component
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
      category_id: "",
      dimensions: [],
      polish_color_ids: [],
      variants: [],
      images: { primaryIndices: {} },
      existingImages: {},
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
    resetForm,
    fetchProducts,
    cancelEdit,
  };
}
