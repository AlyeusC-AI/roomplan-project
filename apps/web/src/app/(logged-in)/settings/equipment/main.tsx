"use client";

import { Button } from "@components/ui/button";
import { useEffect, useState } from "react";
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
import { Card } from "@components/ui/card";
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
import { Pencil, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

const newEquipmentSchema = z.object({
  name: z.string().optional(),
});

type NewEquipmentValues = z.infer<typeof newEquipmentSchema>;

export function EquipmentPage() {
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<NewEquipmentValues>({
    resolver: zodResolver(newEquipmentSchema),
    mode: "onChange",
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isOpen, setIsOpen] = useState<Equipment | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<Equipment | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);
  const [tempName, setTempName] = useState<string>("");

  const onUpdate = async () => {
    try {
      if (!tempName || tempName.length < 3 || !isOpen) {
        toast.error("Name must be at least 3 characters.");
        return;
      }

      setIsUpdating(true);

      const res = await fetch(`/api/v1/organization/equipment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tempName, equipmentId: isOpen?.publicId }),
      });

      const { equipment: newEquipment } = await res.json();

      console.log(newEquipment);

      toast.success("Equipment updated successfully");
      setEquipment(
        equipment.map((e) =>
          e.publicId === newEquipment.publicId ? newEquipment : e
        )
      );
      setIsOpen(null);
      setTempName("");
    } catch {
      toast.error("An error occurred");
    }

    setIsUpdating(false);
  };

  const onDelete = async (e: Equipment) => {
    try {
      setIsDeleting(e);

      await fetch(`/api/v1/organization/equipment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipmentId: e.publicId }),
      });

      toast.success("Equipment deleted successfully");
      setEquipment(equipment.filter((equip) => equip.id !== e.id));
      setIsOpen(null);
    } catch {
      toast.error("An error occurred");
    }

    setIsDeleting(null);
  };

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original?.name}</span>
      ),
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original?.createdAt ?? new Date())),
    },
    {
      id: "release",
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-start gap-3'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setIsOpen(row.original);
              setTempName(row.original.name);
            }}
          >
            <Pencil />
          </Button>{" "}
          <Button
            size='sm'
            variant='destructive'
            onClick={() => onDelete(row.original)}
          >
            {isDeleting && isDeleting.publicId == row.original.publicId ? (
              <LoadingSpinner />
            ) : (
              <Trash />
            )}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setFetching(true);
    fetch("/api/v1/organization/equipment")
      .then((res) => res.json())
      .then((data) => {
        setEquipment(data.equipment);
        setFetching(false);
      });
  }, []);

  async function onSubmit(data: NewEquipmentValues) {
    try {
      setIsAdding(true);
      if (!data.name || data.name.length < 3) {
        setIsAdding(false);
        return toast.error("Name must be at least 3 characters.");
      }

      const res = await fetch("/api/v1/organization/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      toast.success("Equipment added successfully");
      form.setValue("name", "");
      setEquipment([...equipment, json.equipment]);
    } catch {
      toast.error("An error occurred");
    }

    setIsAdding(false);
  }

  return (
    <div className='space-y-6 sm:px-6 lg:col-span-9 lg:px-0'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Equipment</FormLabel>
                <FormControl>
                  <Input placeholder='Dehumidifier #001' {...field} />
                </FormControl>
                <FormDescription>
                  Add a new equipment item to your inventory. Please provide a
                  name for the equipment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>
            {isAdding ? <LoadingSpinner /> : "Add equipment"}
          </Button>
        </form>
      </Form>
      <Card className='w-full'>
        <Dialog open={isOpen !== null} onOpenChange={() => setIsOpen(null)}>
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
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Edit equipment</DialogTitle>
              <DialogDescription>
                Make changes to your equipment here. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  defaultValue='Pedro Duarte'
                  className='col-span-3'
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={onUpdate}>
                {isUpdating ? <LoadingSpinner /> : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}

export default EquipmentPage;
