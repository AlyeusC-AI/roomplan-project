"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useGetMaterialsWithCompliance,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  type CreateMaterialDto,
  type UpdateMaterialDto,
} from "@service-geek/api-client";

export default function MaterialsTable() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<{
    id: string;
    data: UpdateMaterialDto;
  } | null>(null);
  const [formData, setFormData] = useState<CreateMaterialDto>({
    name: "",
    description: "",
    image: "",
    variance: 0,
  });

  const { data: materials, isLoading } = useGetMaterialsWithCompliance();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMaterial) {
        await updateMaterial.mutateAsync({
          id: editingMaterial.id,
          data: editingMaterial.data,
        });
        toast.success("Material updated successfully");
        setEditingMaterial(null);
      } else {
        await createMaterial.mutateAsync(formData);
        toast.success("Material created successfully");
        setFormData({ name: "", description: "", image: "", variance: 0 });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to save material");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id);
      toast.success("Material deleted successfully");
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  const isDryStandardCompliant = (variance: number) => variance <= 15;

  if (isLoading) {
    return <div>Loading materials...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Materials Management</CardTitle>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='description'>Description</Label>
                  <Input
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='image'>Image URL</Label>
                  <Input
                    id='image'
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='variance'>
                    Variance (%) - Dry Standard requires ≤ 15%
                  </Label>
                  <Input
                    id='variance'
                    type='number'
                    min='0'
                    max='100'
                    step='0.1'
                    value={formData.variance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variance: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <Button type='submit' className='w-full'>
                  Create Material
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Variance (%)</TableHead>
              <TableHead>Dry Standard</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials?.map((material) => (
              <TableRow key={material.id}>
                <TableCell className='font-medium'>{material.name}</TableCell>
                <TableCell>{material.description || "-"}</TableCell>
                <TableCell>{material.variance}%</TableCell>
                <TableCell>
                  {material.isDryStandardCompliant ? (
                    <Badge variant='default' className='bg-green-500'>
                      <CheckCircle className='mr-1 h-3 w-3' />
                      Compliant
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>
                      <XCircle className='mr-1 h-3 w-3' />
                      Non-Compliant
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setEditingMaterial({ id: material.id, data: material })
                      }
                    >
                      <Edit className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
