"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface PolishColor {
  id: string;
  name: string;
  hex_code: string | null;
  description: string | null;
}

export function usePolishColors() {
  const [polishColors, setPolishColors] = useState<PolishColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPolishColor, setEditingPolishColor] = useState<PolishColor | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    hex_code: "",
    description: "",
  });

  useEffect(() => {
    fetchPolishColors();
  }, []);

  async function fetchPolishColors() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("polish_colors")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching polish colors:", error);
    } else {
      setPolishColors(data || []);
    }
    
    setLoading(false);
  }

  async function addPolishColor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("polish_colors")
        .insert([
          {
            name: formData.name.trim(),
            hex_code: formData.hex_code.trim() || null,
            description: formData.description.trim() || null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding polish color:", error);
        throw error;
      }

      setPolishColors([...polishColors, data]);
      setFormData({ name: "", hex_code: "", description: "" });
    } catch (error) {
      console.error("Failed to add polish color:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updatePolishColor(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPolishColor) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("polish_colors")
        .update({
          name: formData.name.trim(),
          hex_code: formData.hex_code.trim() || null,
          description: formData.description.trim() || null,
        })
        .eq("id", editingPolishColor.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating polish color:", error);
        throw error;
      }

      setPolishColors(polishColors.map(color => 
        color.id === editingPolishColor.id ? data : color
      ));
      
      setEditingPolishColor(null);
      setFormData({ name: "", hex_code: "", description: "" });
    } catch (error) {
      console.error("Failed to update polish color:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function deletePolishColor(id: string) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("polish_colors")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting polish color:", error);
        throw error;
      }

      setPolishColors(polishColors.filter(color => color.id !== id));
    } catch (error) {
      console.error("Failed to delete polish color:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function startEdit(polishColor: PolishColor) {
    setEditingPolishColor(polishColor);
    setFormData({
      name: polishColor.name,
      hex_code: polishColor.hex_code || "",
      description: polishColor.description || "",
    });
  }

  function cancelEdit() {
    setEditingPolishColor(null);
    setFormData({ name: "", hex_code: "", description: "" });
  }

  return {
    polishColors,
    loading,
    editingPolishColor,
    formData,
    setFormData,
    addPolishColor,
    updatePolishColor,
    deletePolishColor,
    startEdit,
    cancelEdit,
  };
}
