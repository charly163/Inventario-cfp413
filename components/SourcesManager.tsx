"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getSources, addSource, updateSource, deleteSource } from "@/src/lib/database";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Source {
  id: string;
  name: string;
}

export default function SourcesManager() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [newSourceName, setNewSourceName] = useState("");
  const [editedSourceName, setEditedSourceName] = useState("");

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      const fetchedSources = await getSources();
      setSources(fetchedSources);
      setLoading(false);
    };
    fetchSources();
  }, []);

  const handleAddSource = async () => {
    if (!newSourceName.trim()) {
      toast.error("El nombre de la fuente es requerido");
      return;
    }
    const newSource = await addSource(newSourceName);
    if (newSource) {
      setSources([...sources, newSource]);
      setNewSourceName("");
      setIsAddDialogOpen(false);
      toast.success("Fuente agregada correctamente");
    } else {
      toast.error("Error al agregar la fuente");
    }
  };

  const handleUpdateSource = async () => {
    if (!selectedSource || !editedSourceName.trim()) {
      toast.error("El nombre de la fuente es requerido");
      return;
    }
    const updatedSource = await updateSource(selectedSource.id, editedSourceName);
    if (updatedSource) {
      setSources(sources.map(s => s.id === updatedSource.id ? updatedSource : s));
      setIsEditDialogOpen(false);
      setSelectedSource(null);
      toast.success("Fuente actualizada correctamente");
    } else {
      toast.error("Error al actualizar la fuente");
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta fuente?")) {
      const success = await deleteSource(id);
      if (success) {
        setSources(sources.filter(s => s.id !== id));
        toast.success("Fuente eliminada correctamente");
      } else {
        toast.error("Error al eliminar la fuente");
      }
    }
  };

  const openEditDialog = (source: Source) => {
    setSelectedSource(source);
    setEditedSourceName(source.name);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Fuentes</CardTitle>
        <CardDescription>Agregar, editar y eliminar fuentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Fuente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Fuente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Nombre de la fuente"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddSource}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p>Cargando fuentes...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>{source.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(source)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(source.id)} className="text-red-500">
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
              <DialogTitle>Editar Fuente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nombre de la fuente"
                value={editedSourceName}
                onChange={(e) => setEditedSourceName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSource}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
