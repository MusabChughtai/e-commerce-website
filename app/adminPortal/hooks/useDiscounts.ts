"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Discount, DiscountAllItems, DiscountCategory, DiscountProduct, DiscountCoupon } from "../types";

export interface DiscountFormData {
  name: string;
  description: string;
  discount_type: 'percent' | 'money' | 'free_shipping' | 'coupon';
  scope: 'all_items' | 'categories' | 'products' | 'coupon';
  discount_value: number;
  coupon_code: string;
  coupon_discount_type: 'percent' | 'money';
  usage_limit: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  selected_categories: { id: string; discount_value: number }[];
  selected_products: { id: string; discount_value: number }[];
}

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState<DiscountFormData>({
    name: "",
    description: "",
    discount_type: "percent",
    scope: "all_items",
    discount_value: 0,
    coupon_code: "",
    coupon_discount_type: "percent",
    usage_limit: null,
    start_date: "",
    end_date: "",
    is_active: true,
    selected_categories: [],
    selected_products: [],
  });

  useEffect(() => {
    fetchDiscounts();
    fetchCategories();
    fetchProducts();
  }, []);

  async function fetchDiscounts() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("discounts")
      .select(`
        *,
        discount_all_items (
          id,
          discount_value
        ),
        discount_categories (
          id,
          category_id,
          discount_value,
          categories (
            id,
            name
          )
        ),
        discount_products (
          id,
          product_id,
          discount_value,
          products (
            id,
            name
          )
        ),
        discount_coupons (
          id,
          coupon_code,
          coupon_discount_type,
          discount_value,
          usage_limit,
          usage_count
        )
      `)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching discounts:", error);
    } else {
      setDiscounts(data || []);
    }
    
    setLoading(false);
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  }

  async function addDiscount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        alert("Start date must be before end date");
        setLoading(false);
        return;
      }

      // Validate discount value
      if (formData.discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) {
        alert("Percent discount must be between 0 and 100");
        setLoading(false);
        return;
      }

      if (formData.discount_type === 'money' && formData.discount_value < 0) {
        alert("Money discount must be positive");
        setLoading(false);
        return;
      }

      // Validate coupon code for coupon discounts
      if (formData.discount_type === 'coupon' && !formData.coupon_code) {
        alert("Coupon code is required for coupon discounts");
        setLoading(false);
        return;
      }

      // Validate coupon discount type and value for coupon discounts
      if (formData.discount_type === 'coupon') {
        if (!formData.coupon_discount_type) {
          alert("Coupon discount type is required");
          setLoading(false);
          return;
        }
        if (formData.coupon_discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) {
          alert("Percent coupon discount must be between 0 and 100");
          setLoading(false);
          return;
        }
        if (formData.coupon_discount_type === 'money' && formData.discount_value < 0) {
          alert("Money coupon discount must be positive");
          setLoading(false);
          return;
        }
      }

      // Prepare discount data
      const discountData = {
        name: formData.name,
        description: formData.description,
        discount_type: formData.discount_type,
        scope: formData.scope,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      const { data: discountResult, error: discountError } = await supabase
        .from("discounts")
        .insert([discountData])
        .select()
        .single();

      if (discountError) {
        console.error("Error adding discount:", discountError);
        alert("Error adding discount: " + discountError.message);
        setLoading(false);
        return;
      }

      // Add discount value data based on scope
      if (formData.scope === 'all_items') {
        const { error: allItemsError } = await supabase
          .from("discount_all_items")
          .insert([{
            discount_id: discountResult.id,
            discount_value: formData.discount_value,
          }]);

        if (allItemsError) {
          console.error("Error adding discount all items:", allItemsError);
          alert("Error adding discount all items: " + allItemsError.message);
        }
      }

      // Add category associations with specific discount values
      if (formData.scope === 'categories' && formData.selected_categories.length > 0) {
        const categoryData = formData.selected_categories.map(category => ({
          discount_id: discountResult.id,
          category_id: category.id,
          discount_value: category.discount_value,
        }));

        const { error: categoryError } = await supabase
          .from("discount_categories")
          .insert(categoryData);

        if (categoryError) {
          console.error("Error adding discount categories:", categoryError);
          alert("Error adding discount categories: " + categoryError.message);
        }
      }

      // Add product associations with specific discount values
      if (formData.scope === 'products' && formData.selected_products.length > 0) {
        const productData = formData.selected_products.map(product => ({
          discount_id: discountResult.id,
          product_id: product.id,
          discount_value: product.discount_value,
        }));

        const { error: productError } = await supabase
          .from("discount_products")
          .insert(productData);

        if (productError) {
          console.error("Error adding discount products:", productError);
          alert("Error adding discount products: " + productError.message);
        }
      }

      // Add coupon data for coupon discounts
      if (formData.discount_type === 'coupon') {
        const { error: couponError } = await supabase
          .from("discount_coupons")
          .insert([{
            discount_id: discountResult.id,
            coupon_code: formData.coupon_code,
            coupon_discount_type: formData.coupon_discount_type,
            discount_value: formData.discount_value,
            usage_limit: formData.usage_limit,
            usage_count: 0,
          }]);

        if (couponError) {
          console.error("Error adding discount coupon:", couponError);
          alert("Error adding discount coupon: " + couponError.message);
        }
      }

      await fetchDiscounts();
      resetForm();
      alert("Discount added successfully!");
    } catch (error) {
      console.error("Error adding discount:", error);
      alert("Error adding discount");
    }
    
    setLoading(false);
  }

  async function updateDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDiscount) return;

    setLoading(true);

    try {
      // Validate dates
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        alert("Start date must be before end date");
        setLoading(false);
        return;
      }

      // Validate coupon code for coupon discounts
      if (formData.discount_type === 'coupon' && !formData.coupon_code) {
        alert("Coupon code is required for coupon discounts");
        setLoading(false);
        return;
      }

      // Validate coupon discount type and value for coupon discounts
      if (formData.discount_type === 'coupon') {
        if (!formData.coupon_discount_type) {
          alert("Coupon discount type is required");
          setLoading(false);
          return;
        }
        if (formData.coupon_discount_type === 'percent' && (formData.discount_value < 0 || formData.discount_value > 100)) {
          alert("Percent coupon discount must be between 0 and 100");
          setLoading(false);
          return;
        }
        if (formData.coupon_discount_type === 'money' && formData.discount_value < 0) {
          alert("Money coupon discount must be positive");
          setLoading(false);
          return;
        }
      }

      // Prepare discount data
      const discountData = {
        name: formData.name,
        description: formData.description,
        discount_type: formData.discount_type,
        scope: formData.scope,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      const { error: discountError } = await supabase
        .from("discounts")
        .update(discountData)
        .eq("id", editingDiscount.id);

      if (discountError) {
        console.error("Error updating discount:", discountError);
        alert("Error updating discount: " + discountError.message);
        setLoading(false);
        return;
      }

      // Clear existing discount value data
      await supabase.from("discount_all_items").delete().eq("discount_id", editingDiscount.id);
      await supabase.from("discount_categories").delete().eq("discount_id", editingDiscount.id);
      await supabase.from("discount_products").delete().eq("discount_id", editingDiscount.id);
      await supabase.from("discount_coupons").delete().eq("discount_id", editingDiscount.id);

      // Add new discount value data based on scope
      if (formData.scope === 'all_items') {
        const { error: allItemsError } = await supabase
          .from("discount_all_items")
          .insert([{
            discount_id: editingDiscount.id,
            discount_value: formData.discount_value,
          }]);

        if (allItemsError) {
          console.error("Error updating discount all items:", allItemsError);
        }
      }

      // Update category associations with specific discount values
      if (formData.scope === 'categories' && formData.selected_categories.length > 0) {
        const categoryData = formData.selected_categories.map(category => ({
          discount_id: editingDiscount.id,
          category_id: category.id,
          discount_value: category.discount_value,
        }));

        const { error: categoryError } = await supabase
          .from("discount_categories")
          .insert(categoryData);

        if (categoryError) {
          console.error("Error updating discount categories:", categoryError);
        }
      }

      // Update product associations with specific discount values
      if (formData.scope === 'products' && formData.selected_products.length > 0) {
        const productData = formData.selected_products.map(product => ({
          discount_id: editingDiscount.id,
          product_id: product.id,
          discount_value: product.discount_value,
        }));

        const { error: productError } = await supabase
          .from("discount_products")
          .insert(productData);

        if (productError) {
          console.error("Error updating discount products:", productError);
        }
      }

      // Update coupon data for coupon discounts
      if (formData.discount_type === 'coupon') {
        const { error: couponError } = await supabase
          .from("discount_coupons")
          .insert([{
            discount_id: editingDiscount.id,
            coupon_code: formData.coupon_code,
            coupon_discount_type: formData.coupon_discount_type,
            discount_value: formData.discount_value,
            usage_limit: formData.usage_limit,
            usage_count: 0, // Reset usage count on update
          }]);

        if (couponError) {
          console.error("Error updating discount coupon:", couponError);
        }
      }

      await fetchDiscounts();
      resetForm();
      setEditingDiscount(null);
      alert("Discount updated successfully!");
    } catch (error) {
      console.error("Error updating discount:", error);
      alert("Error updating discount");
    }
    
    setLoading(false);
  }

  async function deleteDiscount(id: string) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("discounts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting discount:", error);
        alert("Error deleting discount: " + error.message);
      } else {
        await fetchDiscounts();
        alert("Discount deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      alert("Error deleting discount");
    }
    
    setLoading(false);
  }

  async function toggleDiscountStatus(id: string, isActive: boolean) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("discounts")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) {
        console.error("Error updating discount status:", error);
        alert("Error updating discount status: " + error.message);
      } else {
        await fetchDiscounts();
      }
    } catch (error) {
      console.error("Error updating discount status:", error);
      alert("Error updating discount status");
    }
    
    setLoading(false);
  }

  function startEditing(discount: Discount) {
    setEditingDiscount(discount);
    
    // Get selected categories with their discount values
    const selectedCategories = (discount as any).discount_categories?.map((dc: any) => ({
      id: dc.category_id,
      discount_value: dc.discount_value
    })) || [];
    
    // Get selected products with their discount values
    const selectedProducts = (discount as any).discount_products?.map((dp: any) => ({
      id: dp.product_id,
      discount_value: dp.discount_value
    })) || [];

    // Get discount value based on scope
    let discountValue = 0;
    const allItemsData = (discount as any).discount_all_items;
    
    // Check if discount_all_items is an array with items
    if (Array.isArray(allItemsData) && allItemsData.length > 0) {
      discountValue = allItemsData[0].discount_value;
    }
    // Check if discount_all_items is a single object (not array)
    else if (allItemsData && typeof allItemsData === 'object' && allItemsData.discount_value !== undefined) {
      discountValue = allItemsData.discount_value;
    }
    // Check for coupon data
    else if ((discount as any).discount_coupons?.length > 0) {
      discountValue = (discount as any).discount_coupons[0].discount_value;
    }

    // Get coupon data
    const couponData = (discount as any).discount_coupons?.[0];

    setFormData({
      name: discount.name,
      description: discount.description,
      discount_type: discount.discount_type,
      scope: discount.scope,
      discount_value: discountValue,
      coupon_code: couponData?.coupon_code || "",
      coupon_discount_type: couponData?.coupon_discount_type || "percent",
      usage_limit: couponData?.usage_limit ?? null,
      start_date: discount.start_date.split('T')[0],
      end_date: discount.end_date.split('T')[0],
      is_active: discount.is_active,
      selected_categories: selectedCategories,
      selected_products: selectedProducts,
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      discount_type: "percent",
      scope: "all_items",
      discount_value: 0,
      coupon_code: "",
      coupon_discount_type: "percent",
      usage_limit: null,
      start_date: "",
      end_date: "",
      is_active: true,
      selected_categories: [],
      selected_products: [],
    });
    setEditingDiscount(null);
  }

  function updateFormData(field: keyof DiscountFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return {
    discounts,
    loading,
    editingDiscount,
    formData,
    categories,
    products,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    startEditing,
    resetForm,
    updateFormData,
  };
}
