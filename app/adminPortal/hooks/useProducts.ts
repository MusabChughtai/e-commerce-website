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
    images: {}, // { [polishColorId]: File[] }
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

  async function uploadImages(productId: string, polishColorId: string, files: File[]) {
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
          is_primary: i === 0,
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

    // Insert Dimensions
    const dimensionsToInsert = dimensions.map((d: any) => ({
      product_id: productId,
      name: d.name,
      width: d.width,
      height: d.height,
      depth: d.depth,
      price: d.price,
    }));
    await supabase.from("dimensions").insert(dimensionsToInsert);

    // Link Polish Colors
    const polishLinks = polish_color_ids.map((pid: string) => ({
      product_id: productId,
      polish_color_id: pid,
    }));
    await supabase.from("product_polish_colors").insert(polishLinks);

    // Insert Variant Options
    const variantsToInsert = variants.map((v: any) => {
  // Find the actual dimension UUID by index
  const dimensionIndex = parseInt(v.dimensionId);
  const dimensionUuid = dimensionsToInsert[dimensionIndex]?.id; // You'll need to get this from the inserted dimensions
  
  return {
    product_id: productId, // or editingProduct.id
    dimension_id: dimensionUuid,
    polish_color_id: v.polishColorId,
    stock_quantity: parseInt(v.stock),
  };
});
    await supabase.from("variant_options").insert(variantsToInsert);

    // Upload Images
    for (const polishColorId of polish_color_ids) {
      const files = images[polishColorId] || [];
      const uploaded = await uploadImages(productId, polishColorId, files);
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

    const { name, description, category_id, dimensions, polish_color_ids, variants, images } = formData;

    await supabase
      .from("products")
      .update({ name, description, category_id })
      .eq("id", editingProduct.id);

    await supabase.from("dimensions").delete().eq("product_id", editingProduct.id);
    const dimsToInsert = dimensions.map((d: any) => ({
      product_id: editingProduct.id,
      name: d.name,
      width: d.width,
      height: d.height,
      depth: d.depth,
      price: d.price,
    }));
    await supabase.from("dimensions").insert(dimsToInsert);

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
  // Find the actual dimension UUID by index
  const dimensionIndex = parseInt(v.dimensionId);
  const dimensionUuid = dimsToInsert[dimensionIndex]?.id; // You'll need to get this from the inserted dimensions
  
  return {
    product_id: editingProduct.id, // or editingProduct.id
    dimension_id: dimensionUuid,
    polish_color_id: v.polishColorId,
    stock_quantity: parseInt(v.stock),
  };
});
    await supabase.from("variant_options").insert(variantsToInsert);

    // Images: delete old from storage & DB, upload new
    const { data: oldImgs } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", editingProduct.id);

    const oldKeys = oldImgs?.map((i) => i.image_url) || [];
    await deleteImagesFromStorage(oldKeys);
    await supabase.from("product_images").delete().eq("product_id", editingProduct.id);

    for (const polishColorId of polish_color_ids) {
      const files = images[polishColorId] || [];
      const uploaded = await uploadImages(editingProduct.id, polishColorId, files);
      if (uploaded.length > 0) {
        await supabase.from("product_images").insert(uploaded);
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
      dimensions: product.dimensions,
      polish_color_ids: product.product_polish_colors.map(
        (p: any) => p.polish_color_id
      ),
      variants: product.variant_options.map((v: any) => ({
  dimensionId: v.dimension_id,
  polishColorId: v.polish_color_id,
  stock: v.stock_quantity,
})),
      images: {}, // Admin must upload fresh if needed
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
      images: {},
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
