"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { invoicesStore, SavedLineItem } from "@/atoms/invoices";
import {
  fetchSavedLineItems,
  createSavedLineItem,
  updateSavedLineItem,
  deleteSavedLineItem,
} from "@/lib/savedLineItems";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { LoadingPlaceholder } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function SavedLineItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedLineItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const { savedLineItems, setSavedLineItems } = invoicesStore();

  // Move useMemo hook here, right after useState hooks but before useEffect
  // Check if all displayed items are selected
  const filteredLineItems = useMemo(
    () =>
      selectedCategory
        ? savedLineItems.filter((item) => item.category === selectedCategory)
        : savedLineItems,
    [selectedCategory, savedLineItems]
  );

  const allSelected = useMemo(() => {
    return (
      filteredLineItems.length > 0 &&
      filteredLineItems.every((item) => selectedItems.includes(item.publicId))
    );
  }, [filteredLineItems, selectedItems]);

  useEffect(() => {
    const loadSavedLineItems = async () => {
      setIsLoading(true);
      try {
        const items = await fetchSavedLineItems();
        setSavedLineItems(items);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading saved line items:", error);
        toast.error("Failed to load saved line items");
        setIsLoading(false);
      }
    };

    loadSavedLineItems();
  }, [setSavedLineItems]);

  const handleSave = async () => {
    if (!description) {
      toast.error("Description is required");
      return;
    }

    if (!rate) {
      toast.error("Rate is required");
      return;
    }

    try {
      let categoryToUse = isNewCategory ? newCategory : category;
      // Convert "none" to empty string for storage
      if (categoryToUse === "none") {
        categoryToUse = "";
      }

      const newItem = await createSavedLineItem({
        description,
        rate: parseFloat(rate),
        category: categoryToUse,
      });

      setSavedLineItems([...savedLineItems, newItem]);
      resetForm();
      setShowForm(false);
      toast.success("Line item saved successfully");
    } catch (error) {
      console.error("Error saving line item:", error);
      toast.error("Failed to save line item");
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    if (!description) {
      toast.error("Description is required");
      return;
    }

    if (!rate) {
      toast.error("Rate is required");
      return;
    }

    try {
      let categoryToUse = isNewCategory ? newCategory : category;
      // Convert "none" to empty string for storage
      if (categoryToUse === "none") {
        categoryToUse = "";
      }

      const updatedItem = await updateSavedLineItem(editingItem.publicId, {
        description,
        rate: parseFloat(rate),
        category: categoryToUse,
      });

      setSavedLineItems(
        savedLineItems.map((item) =>
          item.publicId === editingItem.publicId ? updatedItem : item
        )
      );

      resetForm();
      setEditingItem(null);
      setShowForm(false);
      toast.success("Line item updated successfully");
    } catch (error) {
      console.error("Error updating line item:", error);
      toast.error("Failed to update line item");
    }
  };

  const handleDelete = async (item: SavedLineItem) => {
    try {
      await deleteSavedLineItem(item.publicId);
      setSavedLineItems(
        savedLineItems.filter((i) => i.publicId !== item.publicId)
      );
      toast.success("Line item deleted successfully");
    } catch (error) {
      console.error("Error deleting line item:", error);
      toast.error("Failed to delete line item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      await handleUpdate();
    } else {
      await handleSave();
    }
  };

  const handleEdit = (item: SavedLineItem) => {
    setEditingItem(item);
    setDescription(item.description);
    setRate(item.rate.toString());
    setCategory(item.category || "");
    setShowForm(true);
  };

  const resetForm = () => {
    setDescription("");
    setRate("");
    setCategory("");
    setNewCategory("");
    setIsNewCategory(false);
    setEditingItem(null);
    setShowForm(false);
  };

  // Toggle bulk actions display
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  if (isLoading && savedLineItems.length === 0) {
    return <LoadingPlaceholder />;
  }

  const categories = Array.from(
    new Set(savedLineItems.map((item) => item.category).filter(Boolean))
  );

  // Add select all items function
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredLineItems.map((item) => item.publicId));
    } else {
      setSelectedItems([]);
    }
  };

  // Add toggle selection function
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle bulk add to invoice
  const handleBulkAddToInvoice = () => {
    // We'll just show a toast for now - this would integrate with invoice creation in a real implementation
    const selectedItemsData = savedLineItems.filter((item) =>
      selectedItems.includes(item.publicId)
    );
    toast.success(`${selectedItemsData.length} items ready to add to invoice`);

    // Reset selection
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Saved Line Items</h1>
        <div className='flex gap-2'>
          {showBulkActions && (
            <Button onClick={handleBulkAddToInvoice} variant='secondary'>
              Add {selectedItems.length} Items to Invoice
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className='mr-2 h-4 w-4' /> Add New Line Item
          </Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className='max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Line Item" : "Add New Line Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update this line item that can be reused in your invoices."
                : "Create a new line item that can be reused in your invoices."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='e.g., Web Development - Hourly'
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='rate'>Rate</Label>
                <Input
                  id='rate'
                  type='number'
                  min='0'
                  step='0.01'
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder='0.00'
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='category'>Category</Label>
                {isNewCategory ? (
                  <div className='flex gap-2'>
                    <Input
                      id='new-category'
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder='New category name'
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsNewCategory(false);
                        setNewCategory("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className='flex gap-2'>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      className='flex-1'
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select category (optional)' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat as string} value={cat as string}>
                            {cat as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsNewCategory(true)}
                    >
                      New
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' type='button' onClick={resetForm}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {editingItem ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className='mb-4'>
        <Label htmlFor='category-filter'>Filter by Category</Label>
        <div className='mt-1 flex gap-2'>
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) =>
              setSelectedCategory(value === "all" ? null : value)
            }
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat as string} value={cat as string}>
                  {cat as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategory && (
            <Button
              variant='outline'
              onClick={() => setSelectedCategory(null)}
              size='sm'
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Your Line Items</CardTitle>
            <div className='flex items-center'>
              <Checkbox
                id='selectAll'
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor='selectAll' className='ml-2'>
                Select All
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "50px" }}></TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead style={{ width: "100px" }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedLineItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    No saved line items. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLineItems.map((item) => (
                  <TableRow key={item.publicId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.publicId)}
                        onCheckedChange={() =>
                          toggleItemSelection(item.publicId)
                        }
                      />
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.category ? (
                        <span className='rounded-md bg-foreground/10 px-2 py-1 text-xs font-medium text-foreground'>
                          {item.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(item.rate)}</TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        <Button
                          onClick={() => handleEdit(item)}
                          size='icon'
                          variant='outline'
                        >
                          <Edit2 className='size-4' />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item)}
                          size='icon'
                          variant='outline'
                          className='text-red-500 hover:text-red-700'
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
