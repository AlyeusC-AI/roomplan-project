"use client";

import { Button } from "@components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/roadmap-ui/table";
import { Label } from "@components/ui/label";
import { Pencil, Trash, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useCreateEquipment,
  useDeleteEquipment,
  useGetEquipment,
  useUpdateEquipment,
  Equipment,
} from "@service-geek/api-client";
import { uploadImage } from "@service-geek/api-client";
import Image from "next/image";
import { cn } from "@/lib/utils";

const newEquipmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  image: z.string().optional(),
});

type NewEquipmentValues = z.infer<typeof newEquipmentSchema>;

export function EquipmentPage() {
  const [isOpen, setIsOpen] = useState<Equipment | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [tempImage, setTempImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(
    null
  );

  const { data: equipment = [], isLoading: fetching } = useGetEquipment();
  const { mutate: createEquipment, isPending: isAddingEquipment } =
    useCreateEquipment();
  const { mutate: updateEquipment, isPending: isUpdating } =
    useUpdateEquipment();
  const { mutate: deleteEquipment, isPending: isDeleting } =
    useDeleteEquipment();

  const form = useForm<NewEquipmentValues>({
    resolver: zodResolver(newEquipmentSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      quantity: 1,
      image: "",
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const result = await uploadImage(file, {
        folder: "equipment",
        useUniqueFileName: true,
      });
      return result.url;
    } catch (error) {
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onUpdate = async () => {
    if (!tempName || tempName.length < 3 || !isOpen) {
      toast.error("Name must be at least 3 characters.");
      return;
    }

    updateEquipment(
      {
        id: isOpen.id,
        data: { name: tempName, quantity: tempQuantity, image: tempImage },
      },
      {
        onSuccess: () => {
          toast.success("Equipment updated successfully");
          setIsOpen(null);
          setTempName("");
          setTempQuantity(1);
          setTempImage("");
        },
      }
    );
  };

  const onDelete = async (e: Equipment) => {
    setEquipmentToDelete(e);
  };

  const handleDelete = async () => {
    if (!equipmentToDelete) return;

    deleteEquipment(equipmentToDelete.id, {
      onSuccess: () => {
        toast.success("Equipment deleted successfully");
        setEquipmentToDelete(null);
        setIsOpen(null);
      },
    });
  };

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: "image",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Image' />
      ),
      cell: ({ row }) => (
        <div className='relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200'>
          {row.original?.image ? (
            <Image
              src={row.original.image}
              alt={row.original.name}
              fill
              className='object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-50'>
              <ImageIcon className='h-8 w-8 text-gray-400' />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium text-gray-900'>
            {row.original?.name}
          </span>
          <span className='text-sm text-gray-500'>ID: {row.original?.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Quantity' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center'>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-sm font-medium",
              row.original?.quantity > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {row.original?.quantity}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => (
        <div className='text-sm text-gray-500'>
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(new Date(row.original?.createdAt ?? new Date()))}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-start gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setIsOpen(row.original);
              setTempName(row.original.name);
              setTempQuantity(row.original.quantity);
              setTempImage(row.original.image || "");
            }}
            className='hover:bg-gray-100'
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => onDelete(row.original)}
            disabled={isDeleting}
            className='hover:bg-red-600'
          >
            {isDeleting ? <LoadingSpinner /> : <Trash className='h-4 w-4' />}
          </Button>
        </div>
      ),
    },
  ];

  async function onSubmit(data: NewEquipmentValues) {
    createEquipment(
      {
        ...data,
        description: "",
      },
      {
        onSuccess: () => {
          toast.success("Equipment added successfully");
          form.reset();
          setIsAdding(false);
        },
      }
    );
  }

  return (
    <div className='space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Equipment Management
        </h1>
        <Button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Equipment
        </Button>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new equipment to your inventory.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Dehumidifier #001' {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for the equipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the quantity of this equipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-4'>
                        <div className='flex-1'>
                          <Input
                            type='file'
                            accept='image/*'
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const imageUrl =
                                    await handleImageUpload(file);
                                  field.onChange(imageUrl);
                                  toast.success("Image uploaded successfully");
                                } catch (error) {
                                  console.error("Upload failed:", error);
                                }
                              }
                            }}
                          />
                        </div>
                        {field.value && (
                          <div className='relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200'>
                            <Image
                              src={field.value}
                              alt='Equipment'
                              fill
                              className='object-cover'
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for the equipment (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='submit'
                  disabled={isAddingEquipment || isUploading}
                  className='w-full'
                >
                  {isAddingEquipment || isUploading ? (
                    <LoadingSpinner />
                  ) : (
                    "Add Equipment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Equipment List</CardTitle>
        </CardHeader>
        <CardContent>
          <TableProvider columns={columns} data={equipment} loading={fetching}>
            <TableHeader>
              {({ headerGroup }) => (
                <TableHeaderGroup
                  key={headerGroup.id}
                  headerGroup={headerGroup}
                >
                  {({ header }) => (
                    <TableHead key={header.id} header={header} />
                  )}
                </TableHeaderGroup>
              )}
            </TableHeader>
            <TableBody>
              {({ row }) => (
                <TableRow key={row.id} row={row}>
                  {({ cell }) => <TableCell key={cell.id} cell={cell} />}
                </TableRow>
              )}
            </TableBody>
          </TableProvider>
        </CardContent>
      </Card>

      <Dialog open={isOpen !== null} onOpenChange={() => setIsOpen(null)}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Make changes to your equipment here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-6 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='quantity'>Quantity</Label>
              <Input
                id='quantity'
                type='number'
                min={1}
                value={tempQuantity}
                onChange={(e) => setTempQuantity(Number(e.target.value))}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='image'>Image</Label>
              <div className='flex items-center gap-4'>
                <div className='flex-1'>
                  <Input
                    id='image'
                    type='file'
                    accept='image/*'
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await handleImageUpload(file);
                          setTempImage(imageUrl);
                          toast.success("Image uploaded successfully");
                        } catch (error) {
                          console.error("Upload failed:", error);
                        }
                      }
                    }}
                  />
                </div>
                {tempImage && (
                  <div className='relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200'>
                    <Image
                      src={tempImage}
                      alt='Equipment'
                      fill
                      className='object-cover'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={onUpdate}
              disabled={isUpdating || isUploading}
              className='w-full'
            >
              {isUpdating || isUploading ? <LoadingSpinner /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={equipmentToDelete !== null}
        onOpenChange={() => setEquipmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              equipment
              {equipmentToDelete && ` "${equipmentToDelete.name}"`} from your
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EquipmentPage;
