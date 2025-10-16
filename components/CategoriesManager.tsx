"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/database";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editedCategoryName, setEditedCategoryName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }
    const newCategory = await addCategory(newCategoryName);
    if (newCategory) {
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddDialogOpen(false);
      toast.success("Categoría agregada correctamente");
    } else {
      toast.error("Error al agregar la categoría");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editedCategoryName.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }
    const updatedCategory = await updateCategory(selectedCategory.id, editedCategoryName);
    if (updatedCategory) {
      setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast.success("Categoría actualizada correctamente");
    } else {
      toast.error("Error al actualizar la categoría");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      const success = await deleteCategory(id);
      if (success) {
        setCategories(categories.filter(c => c.id !== id));
        toast.success("Categoría eliminada correctamente");
      } else {
        toast.error("Error al eliminar la categoría");
      }
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditedCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Categorías</CardTitle>
        <CardDescription>Agregar, editar y eliminar categorías.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Nombre de la categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddCategory}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p>Cargando categorías...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nombre de la categoría"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCategory}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
