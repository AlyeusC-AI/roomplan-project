"use client";

import { Button } from "@components/ui/button";
import { useState, useEffect } from "react";
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
} from "@components/roadmap-ui/table";
import { Label } from "@components/ui/label";
import {
  Pencil,
  Trash,
  Upload,
  Plus,
  Image as ImageIcon,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useCreateEquipment,
  useDeleteEquipment,
  useUpdateEquipment,
  Equipment,
  useEquipmentNames,
  EQUIPMENT_NAMES,
} from "@service-geek/api-client";
import { uploadImage } from "@service-geek/api-client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  useGetEquipmentCategories,
  useCreateEquipmentCategory,
  useUpdateEquipmentCategory,
  useDeleteEquipmentCategory,
} from "@service-geek/api-client/src/hooks/useEquipmentCategory";
import type { EquipmentCategory } from "@service-geek/api-client/src/services/equipmentCategory";
import { useGetEquipment } from "@service-geek/api-client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Check } from "lucide-react";

const newEquipmentSchema = z.object({
  name: z.string().min(1, "Brand and model are required"),
  image: z.string().optional(),
  namePrefix: z.string().optional(),
  repeatCount: z.number().min(1).max(100).default(1),
  startNumber: z.number().min(0).default(1),
});

type NewEquipmentValues = z.infer<typeof newEquipmentSchema>;

export function EquipmentPage() {
  const [isOpen, setIsOpen] = useState<Equipment | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [tempImage, setTempImage] = useState<string>("");
  const [tempCategoryId, setTempCategoryId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] =
    useState<EquipmentCategory | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [categoryEdit, setCategoryEdit] = useState<string | null>(null);
  const [categoryEditName, setCategoryEditName] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] =
    useState<EquipmentCategory | null>(null);
  const [equipmentNameOpen, setEquipmentNameOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { data: categories = [], isLoading: loadingCategories } =
    useGetEquipmentCategories();
  const { getEquipmentBrandsByCategory, getEquipmentModelsByCategoryAndBrand } =
    useEquipmentNames();
  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateEquipmentCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } =
    useUpdateEquipmentCategory();
  const { mutate: deleteCategory, isPending: isDeletingCategory } =
    useDeleteEquipmentCategory();

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0] as EquipmentCategory);
    } else if (
      selectedCategory &&
      !categories.some(
        (c: EquipmentCategory) => c.id === selectedCategory.id
      ) &&
      categories.length > 0
    ) {
      setSelectedCategory(categories[0] as EquipmentCategory);
    }
  }, [categories, selectedCategory]);

  const { data: equipment = [], isLoading: fetching } = useGetEquipment({
    categoryId: selectedCategory?.id || undefined,
  });
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
      image: "",
      namePrefix: "",
      repeatCount: 1,
      startNumber: 1,
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
    if (!tempCategoryId) {
      toast.error("Category is required.");
      return;
    }
    updateEquipment(
      {
        id: isOpen.id,
        data: {
          name: tempName,
          quantity: tempQuantity,
          image: tempImage,
          categoryId: tempCategoryId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Equipment updated successfully");
          setIsOpen(null);
          setTempName("");
          setTempQuantity(1);
          setTempImage("");
          setTempCategoryId("");
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
              setTempImage(row.original.image || "");
              setTempCategoryId(row.original.categoryId);
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
    const repeat = data.repeatCount || 1;
    const prefix = data.namePrefix || "";
    const start = data.startNumber || 1;

    for (let i = 0; i < repeat; i++) {
      const number = start + i;
      createEquipment({
        image: data.image,
        name: `${data.name} ${prefix}${number}`,
        description: "",
        categoryId: selectedCategory?.id || "",
        quantity: 1, // required by API
      });
    }

    try {
      toast.success(
        `${repeat} equipment item${repeat > 1 ? "s" : ""} added successfully`
      );
      form.reset();
      setIsAdding(false);
      setEquipmentNameOpen(false);
    } catch {
      toast.error("Failed to add all equipment items");
    }
  }

  // Category Management Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory(newCategoryName, {
      onSuccess: () => {
        toast.success("Category added");
        setNewCategoryName("");
      },
    });
  };
  const handleEditCategory = (cat: EquipmentCategory) => {
    setCategoryEdit(cat.id);
    setCategoryEditName(cat.name);
  };
  const handleSaveEditCategory = (cat: EquipmentCategory) => {
    if (!categoryEditName.trim()) return;
    updateCategory(
      { id: cat.id, name: categoryEditName },
      {
        onSuccess: () => {
          toast.success("Category updated");
          setCategoryEdit(null);
          setCategoryEditName("");
        },
      }
    );
  };
  const handleDeleteCategory = (cat: EquipmentCategory) => {
    setCategoryToDelete(cat);
  };
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id, {
      onSuccess: () => {
        toast.success("Category deleted");
        setCategoryToDelete(null);
      },
    });
  };

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
          <Plus className='h-4 w-4' /> Add Equipment
        </Button>
      </div>

      {/* Category Tabs */}
      <div className='mb-4 flex gap-2'>
        {categories.map((cat: EquipmentCategory) => (
          <Button
            key={cat.id}
            variant={selectedCategory?.id === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.name}
          </Button>
        ))}
        <Button variant='ghost' onClick={() => setManageCategoriesOpen(true)}>
          Manage
        </Button>
      </div>

      {/* Add Equipment Dialog */}
      <Dialog
        open={isAdding}
        onOpenChange={(open) => {
          setIsAdding(open);
          if (!open) {
            form.reset();
            setEquipmentNameOpen(false);
          }
        }}
      >
        <DialogContent className='flex max-h-[90vh] flex-col p-0 sm:max-w-[700px]'>
          <DialogHeader className='px-6 pb-2 pt-6'>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new equipment to your inventory.
            </DialogDescription>
          </DialogHeader>
          {/* Category summary */}
          <div className='mb-2 flex items-center gap-2 rounded bg-blue-50 px-6 py-2 text-blue-800'>
            <span className='font-semibold'>Category:</span>
            <span className='truncate font-medium'>
              {selectedCategory?.name}
            </span>
          </div>
          <div className='flex-1 overflow-y-auto px-6 pb-6 pt-2'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                {/* Basic Info Section */}
                <div>
                  <div className='mb-2 border-b pb-1 text-base font-semibold text-gray-700'>
                    Basic Info
                  </div>
                  <div className='space-y-4'>
                    {/* Brand & Model Select */}
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => {
                        const brands = selectedCategory
                          ? getEquipmentBrandsByCategory(selectedCategory.name)
                          : [];
                        const models =
                          selectedCategory && selectedBrand
                            ? getEquipmentModelsByCategoryAndBrand(
                                selectedCategory.name,
                                selectedBrand
                              )
                            : [];
                        return (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <div>
                                {brands.length > 0 && (
                                  <div className='flex gap-2'>
                                    <select
                                      className='w-1/2 rounded border px-2 py-1'
                                      value={selectedBrand}
                                      onChange={(e) => {
                                        setSelectedBrand(e.target.value);
                                        setSelectedModel("");
                                        field.onChange(""); // clear name when brand changes
                                      }}
                                    >
                                      <option value=''>Select brand</option>
                                      {brands.map((brand) => (
                                        <option key={brand} value={brand}>
                                          {brand}
                                        </option>
                                      ))}
                                    </select>
                                    {models.length > 0 && (
                                      <select
                                        className='w-1/2 rounded border px-2 py-1'
                                        value={selectedModel}
                                        onChange={(e) => {
                                          setSelectedModel(e.target.value);
                                          if (selectedBrand && e.target.value) {
                                            field.onChange(
                                              `${selectedBrand} ${e.target.value}`
                                            );
                                          } else {
                                            field.onChange("");
                                          }
                                        }}
                                        disabled={!selectedBrand}
                                      >
                                        <option value=''>Select model</option>
                                        {models.map((model) => (
                                          <option key={model} value={model}>
                                            {model}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                )}
                                <Input
                                  className='mt-2'
                                  placeholder='Enter equipment name'
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    {/* Quantity, Image, etc. remain unchanged */}
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
                                        toast.success(
                                          "Image uploaded successfully"
                                        );
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
                  </div>
                </div>
                {/* Divider */}
                <div className='my-2 border-t' />
                {/* Multi-Add Section */}
                <div>
                  <div className='mb-2 flex items-center gap-2 border-b pb-1 text-base font-semibold text-gray-700'>
                    <span>Multi-Add</span>
                  </div>
                  <div className='flex gap-4'>
                    <FormField
                      control={form.control}
                      name='repeatCount'
                      render={({ field }) => (
                        <FormItem className='w-1/3'>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='namePrefix'
                      render={({ field }) => (
                        <FormItem className='w-1/3'>
                          <FormLabel>Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g. Dehu-' {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='startNumber'
                      render={({ field }) => (
                        <FormItem className='w-1/3'>
                          <FormLabel>Start #</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter className='pt-4'>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Equipment Table */}
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

      {/* Edit Equipment Dialog */}
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
              {tempCategoryId &&
              getEquipmentBrandsByCategory(
                categories.find((cat) => cat.id === tempCategoryId)?.name || ""
              ).length > 0 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'
                    >
                      {tempName || "Select equipment name..."}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search equipment names...' />
                      <CommandList>
                        <CommandEmpty>No equipment name found.</CommandEmpty>
                        <CommandGroup>
                          {getEquipmentBrandsByCategory(
                            categories.find((cat) => cat.id === tempCategoryId)
                              ?.name || ""
                          ).map((name) => (
                            <CommandItem
                              key={name}
                              value={name}
                              onSelect={(currentValue) => {
                                setTempName(currentValue);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tempName === name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  placeholder='Enter equipment name manually'
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              )}
            </div>
            {/* Remove Quantity field from edit dialog */}
            <div className='grid gap-2'>
              <Label htmlFor='category'>Category</Label>
              <select
                id='category'
                className='w-full rounded border px-2 py-1'
                value={tempCategoryId}
                onChange={(e) => setTempCategoryId(e.target.value)}
                required
              >
                <option value=''>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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

      {/* Delete Equipment Alert */}
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

      {/* Category Management Modal */}
      <Dialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      >
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Manage Equipment Categories</DialogTitle>
            <DialogDescription>
              Add, rename, or delete equipment categories for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='New category name'
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
              />
              <Button onClick={handleAddCategory} disabled={isCreatingCategory}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            <div className='divide-y rounded border'>
              {categories.map((cat) => (
                <div key={cat.id} className='flex items-center gap-2 px-2 py-2'>
                  {categoryEdit === cat.id ? (
                    <>
                      <Input
                        value={categoryEditName}
                        onChange={(e) => setCategoryEditName(e.target.value)}
                        className='flex-1'
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEditCategory(cat);
                        }}
                      />
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => handleSaveEditCategory(cat)}
                        disabled={isUpdatingCategory}
                      >
                        <Check className='h-4 w-4' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => setCategoryEdit(null)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className='flex-1'>{cat.name}</span>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      {!cat.isDefault && (
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={isDeletingCategory}
                        >
                          <Trash2 className='h-4 w-4 text-red-600' />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirm Delete Category Dialog */}
      <AlertDialog
        open={categoryToDelete !== null}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category
              {categoryToDelete && ` "${categoryToDelete.name}"`} and all
              equipment in it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className='bg-red-600 hover:bg-red-700'
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? <LoadingSpinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EquipmentPage;
