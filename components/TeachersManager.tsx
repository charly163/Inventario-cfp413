"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getTeachers, addTeacher, updateTeacher, removeTeacher } from "@/lib/database";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  is_active: boolean;
}

export default function TeachersManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  const [newTeacher, setNewTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    is_active: true,
  });

  const [editedTeacher, setEditedTeacher] = useState<Partial<Teacher>>({});

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers);
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const handleAddTeacher = async () => {
    if (!newTeacher.first_name.trim() || !newTeacher.last_name.trim()) {
      toast.error("Nombre y apellido son requeridos");
      return;
    }
    const addedTeacher = await addTeacher(newTeacher);
    if (addedTeacher) {
      setTeachers([...teachers, addedTeacher]);
      setNewTeacher({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department: "",
        is_active: true,
      });
      setIsAddDialogOpen(false);
      toast.success("Profesor agregado correctamente");
    } else {
      toast.error("Error al agregar el profesor");
    }
  };

  const handleUpdateTeacher = async () => {
    if (!selectedTeacher) return;
    const updatedTeacher = await updateTeacher(selectedTeacher.id, editedTeacher);
    if (updatedTeacher) {
      setTeachers(teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
      toast.success("Profesor actualizado correctamente");
    } else {
      toast.error("Error al actualizar el profesor");
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este profesor?")) {
      const success = await removeTeacher(id);
      if (success) {
        setTeachers(teachers.filter(t => t.id !== id));
        toast.success("Profesor eliminado correctamente");
      } else {
        toast.error("Error al eliminar el profesor");
      }
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditedTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Profesores</CardTitle>
        <CardDescription>Agregar, editar y eliminar profesores.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Profesor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Profesor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Nombre"
                  value={newTeacher.first_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                />
                <Input
                  placeholder="Apellido"
                  value={newTeacher.last_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                />
                <Input
                  placeholder="Teléfono"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                />
                <Input
                  placeholder="Departamento"
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active_add"
                    checked={newTeacher.is_active}
                    onCheckedChange={(checked) => setNewTeacher({ ...newTeacher, is_active: !!checked })}
                  />
                  <Label htmlFor="is_active_add">Activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTeacher}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p>Cargando profesores...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{`${teacher.first_name} ${teacher.last_name}`}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>{teacher.is_active ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(teacher)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-500">
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
              <DialogTitle>Editar Profesor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nombre"
                value={editedTeacher.first_name || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, first_name: e.target.value })}
              />
              <Input
                placeholder="Apellido"
                value={editedTeacher.last_name || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, last_name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={editedTeacher.email || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, email: e.target.value })}
              />
              <Input
                placeholder="Teléfono"
                value={editedTeacher.phone || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, phone: e.target.value })}
              />
              <Input
                placeholder="Departamento"
                value={editedTeacher.department || ""}
                onChange={(e) => setEditedTeacher({ ...editedTeacher, department: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active_edit"
                  checked={editedTeacher.is_active}
                  onCheckedChange={(checked) => setEditedTeacher({ ...editedTeacher, is_active: !!checked })}
                />
                <Label htmlFor="is_active_edit">Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateTeacher}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}