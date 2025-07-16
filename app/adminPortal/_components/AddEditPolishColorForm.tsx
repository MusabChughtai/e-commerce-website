"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, ArrowLeft, Plus, Edit3 } from "lucide-react";

interface AddEditPolishColorFormProps {
  formData: {
    name: string;
    hex_code: string;
    description: string;
  };
  setFormData: (data: any) => void;
  editingPolishColor: any;
  addPolishColor: (e: React.FormEvent) => Promise<void>;
  updatePolishColor: (e: React.FormEvent) => Promise<void>;
  cancelEdit: () => void;
  loading: boolean;
}

export function AddEditPolishColorForm({
  formData,
  setFormData,
  editingPolishColor,
  addPolishColor,
  updatePolishColor,
  cancelEdit,
  loading,
}: AddEditPolishColorFormProps) {
  const isEdit = !!editingPolishColor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updatePolishColor(e);
    } else {
      await addPolishColor(e);
    }
  };

  // Validate hex code format
  const isValidHexCode = (hex: string) => {
    if (!hex) return true; // Allow empty hex code
    return /^#[0-9A-F]{6}$/i.test(hex);
  };

  const handleHexCodeChange = (value: string) => {
    // Auto-add # if not present
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    setFormData({ ...formData, hex_code: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-2xl">
              {isEdit ? (
                <Edit3 className="h-6 w-6 text-white" />
              ) : (
                <Plus className="h-6 w-6 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? "Edit Polish Color" : "Add New Polish Color"}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={cancelEdit}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="p-8">
        <Card className="border-gray-200/50 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-[#23423d]/10 to-[#1e3b36]/10 rounded-2xl">
                <Palette className="h-5 w-5 text-[#23423d]" />
              </div>
              <CardTitle className="text-[#23423d]">Polish Color Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Color Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter color name..."
                  required
                  className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hex_code" className="text-sm font-medium text-gray-700">
                  Hex Color Code
                </Label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      id="hex_code"
                      type="text"
                      value={formData.hex_code}
                      onChange={(e) => handleHexCodeChange(e.target.value)}
                      placeholder="#FF5733"
                      className={`border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20 ${
                        formData.hex_code && !isValidHexCode(formData.hex_code) 
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    {formData.hex_code && !isValidHexCode(formData.hex_code) && (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter a valid hex code (e.g., #FF5733)
                      </p>
                    )}
                  </div>
                  {formData.hex_code && isValidHexCode(formData.hex_code) && (
                    <div 
                      className="w-12 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: formData.hex_code }}
                      title={`Preview: ${formData.hex_code}`}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter color description..."
                  rows={4}
                  className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    loading || 
                    !formData.name.trim() || 
                    Boolean(formData.hex_code && !isValidHexCode(formData.hex_code))
                  }
                  className="flex-1 bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEdit ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <>
                      {isEdit ? (
                        <Edit3 className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isEdit ? "Update Polish Color" : "Add Polish Color"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
