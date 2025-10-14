"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getConditions, addCondition, updateCondition, deleteCondition } from "@/src/lib/database";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Condition {
  id: string;
  name: string;
}

export default function ConditionsManager() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [newConditionName, setNewConditionName] = useState("");
  const [editedConditionName, setEditedConditionName] = useState("");

  useEffect(() => {
    const fetchConditions = async () => {
      setLoading(true);
      const fetchedConditions = await getConditions();
      setConditions(fetchedConditions);
      setLoading(false);
    };
    fetchConditions();
  }, []);

  const handleAddCondition = async () => {
    if (!newConditionName.trim()) {
      toast.error("El nombre de la condición es requerido");
      return;
    }
    const newCondition = await addCondition(newConditionName);
    if (newCondition) {
      setConditions([...conditions, newCondition]);
      setNewConditionName("");
      setIsAddDialogOpen(false);
      toast.success("Condición agregada correctamente");
    } else {
      toast.error("Error al agregar la condición");
    }
  };

  const handleUpdateCondition = async () => {
    if (!selectedCondition || !editedConditionName.trim()) {
      toast.error("El nombre de la condición es requerido");
      return;
    }
    const updatedCondition = await updateCondition(selectedCondition.id, editedConditionName);
    if (updatedCondition) {
      setConditions(conditions.map(c => c.id === updatedCondition.id ? updatedCondition : c));
      setIsEditDialogOpen(false);
      setSelectedCondition(null);
      toast.success("Condición actualizada correctamente");
    } else {
      toast.error("Error al actualizar la condición");
    }
  };

  const handleDeleteCondition = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta condición?")) {
      const success = await deleteCondition(id);
      if (success) {
        setConditions(conditions.filter(c => c.id !== id));
        toast.success("Condición eliminada correctamente");
      } else {
        toast.error("Error al eliminar la condición");
      }
    }
  };

  const openEditDialog = (condition: Condition) => {
    setSelectedCondition(condition);
    setEditedConditionName(condition.name);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Condiciones</CardTitle>
        <CardDescription>Agregar, editar y eliminar condiciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Condición
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Condición</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Nombre de la condición"
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddCondition}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p>Cargando condiciones...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map((condition) => (
                <TableRow key={condition.id}>
                  <TableCell>{condition.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(condition)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCondition(condition.id)} className="text-red-500">
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
              <DialogTitle>Editar Condición</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nombre de la condición"
                value={editedConditionName}
                onChange={(e) => setEditedConditionName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCondition}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
