"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, ArrowLeft, Plus, Edit3 } from "lucide-react";

interface AddEditCategoryFormProps {
  formData: {
    name: string;
    description: string;
  };
  setFormData: (data: any) => void;
  editingCategory: any;
  addCategory: (e: React.FormEvent) => Promise<void>;
  updateCategory: (e: React.FormEvent) => Promise<void>;
  cancelEdit: () => void;
  loading: boolean;
}

export function AddEditCategoryForm({
  formData,
  setFormData,
  editingCategory,
  addCategory,
  updateCategory,
  cancelEdit,
  loading,
}: AddEditCategoryFormProps) {
  const isEdit = !!editingCategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateCategory(e);
    } else {
      await addCategory(e);
    }
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
              {isEdit ? "Edit Category" : "Add New Category"}
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
                <Tag className="h-5 w-5 text-[#23423d]" />
              </div>
              <CardTitle className="text-[#23423d]">Category Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name..."
                  required
                  className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description..."
                  rows={4}
                  className="border-gray-200 focus:border-[#23423d] focus:ring-[#23423d]/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
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
                      {isEdit ? "Update Category" : "Add Category"}
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
