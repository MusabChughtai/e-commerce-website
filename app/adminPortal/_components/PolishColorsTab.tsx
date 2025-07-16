"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Edit, Trash2, Palette, Plus, Paintbrush } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface PolishColorsTabProps {
  polishColors: any[];
  loading: boolean;
  deletePolishColor: (id: string) => void;
  onAddPolishColor: () => void;
  onEditPolishColor: (polishColor: any) => void;
}

export function PolishColorsTab({
  polishColors,
  loading,
  deletePolishColor,
  onAddPolishColor,
  onEditPolishColor,
}: PolishColorsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [polishColorToDelete, setPolishColorToDelete] = useState<any>(null);

  const filteredPolishColors = polishColors.filter(
    (color) =>
      color.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (polishColor: any) => {
    setPolishColorToDelete(polishColor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (polishColorToDelete) {
      await deletePolishColor(polishColorToDelete.id);
      setShowDeleteModal(false);
      setPolishColorToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPolishColorToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search bar and Add button */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search polish colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 rounded-xl h-12 bg-white shadow-sm focus:border-[#23423d] focus:ring-[#23423d]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {filteredPolishColors.length} color{filteredPolishColors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              onClick={onAddPolishColor}
              className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#192e2a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Polish Color
            </Button>
          </div>
        </div>
      </div>

      {/* Polish Colors Grid */}
      {filteredPolishColors.length === 0 ? (
        <div className="text-center py-12">
          <Paintbrush className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm ? "No polish colors found" : "No polish colors yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Create your first polish color to get started"
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={onAddPolishColor}
              className="bg-gradient-to-r from-[#23423d] to-[#1e3b36] hover:from-[#1e3b36] hover:to-[#1a332e] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Polish Color
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolishColors.map((polishColor) => (
            <Card key={polishColor.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-gray-200/60 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {polishColor.hex_code ? (
                      <div 
                        className="w-10 h-10 rounded-2xl border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: polishColor.hex_code }}
                        title={`Color: ${polishColor.hex_code}`}
                      />
                    ) : (
                      <div className="p-2 bg-gradient-to-r from-[#23423d]/10 to-[#1e3b36]/10 rounded-2xl">
                        <Palette className="h-5 w-5 text-[#23423d]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#23423d] transition-colors">
                        {polishColor.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {polishColor.hex_code && (
                  <div className="mb-3">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {polishColor.hex_code}
                    </span>
                  </div>
                )}

                {polishColor.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {polishColor.description}
                  </p>
                )}

                <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPolishColor(polishColor)}
                      className="text-gray-600 hover:text-[#23423d] hover:bg-[#23423d]/5 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(polishColor)}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Polish Color"
        description={`Are you sure you want to delete "${polishColorToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  );
}
