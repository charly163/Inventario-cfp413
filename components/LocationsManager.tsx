"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getLocations, addLocation, updateLocation, deleteLocation } from "@/src/lib/database";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Location {
  id: string;
  name: string;
}

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [editedLocationName, setEditedLocationName] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error("El nombre de la ubicación es requerido");
      return;
    }
    const newLocation = await addLocation(newLocationName);
    if (newLocation) {
      setLocations([...locations, newLocation]);
      setNewLocationName("");
      setIsAddDialogOpen(false);
      toast.success("Ubicación agregada correctamente");
    } else {
      toast.error("Error al agregar la ubicación");
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !editedLocationName.trim()) {
      toast.error("El nombre de la ubicación es requerido");
      return;
    }
    const updatedLocation = await updateLocation(selectedLocation.id, editedLocationName);
    if (updatedLocation) {
      setLocations(locations.map(l => l.id === updatedLocation.id ? updatedLocation : l));
      setIsEditDialogOpen(false);
      setSelectedLocation(null);
      toast.success("Ubicación actualizada correctamente");
    } else {
      toast.error("Error al actualizar la ubicación");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta ubicación?")) {
      const success = await deleteLocation(id);
      if (success) {
        setLocations(locations.filter(l => l.id !== id));
        toast.success("Ubicación eliminada correctamente");
      } else {
        toast.error("Error al eliminar la ubicación");
      }
    }
  };

  const openEditDialog = (location: Location) => {
    setSelectedLocation(location);
    setEditedLocationName(location.name);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Ubicaciones</CardTitle>
        <CardDescription>Agregar, editar y eliminar ubicaciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ubicación
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Ubicación</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Nombre de la ubicación"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddLocation}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p>Cargando ubicaciones...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(location.id)} className="text-red-500">
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
              <DialogTitle>Editar Ubicación</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nombre de la ubicación"
                value={editedLocationName}
                onChange={(e) => setEditedLocationName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateLocation}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
