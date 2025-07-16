"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    
    setLoading(false);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        throw error;
      }

      setCategories([...categories, data]);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to add category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        })
        .eq("id", editingCategory.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data : cat
      ));
      
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }

      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function startEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  }

  function cancelEdit() {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  }

  return {
    categories,
    loading,
    editingCategory,
    formData,
    setFormData,
    addCategory,
    updateCategory,
    deleteCategory,
    startEdit,
    cancelEdit,
  };
}
