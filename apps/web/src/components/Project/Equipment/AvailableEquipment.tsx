import { useState } from "react";
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
import { Button } from "@components/ui/button";
import { Check, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import { Card } from "@components/ui/card";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Equipment,
  EquipmentProject,
  useAssignEquipment,
} from "@service-geek/api-client";

const AvailableEquipment = ({
  usedEquipment,
  availableEquipment,
}: {
  usedEquipment: EquipmentProject[];
  availableEquipment: Equipment[];
}) => {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { mutate: assignEquipment } = useAssignEquipment();

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name ?? ""}</span>
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
        }).format(new Date(row.original.createdAt ?? new Date())),
    },
    {
      id: "release",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-start gap-3'>
          <Button
            size='sm'
            variant='outline'
            disabled={
              usedEquipment.find((e) => e.equipmentId === row.original.id) !=
              null
            }
            onClick={() => onAdd(row.original)}
          >
            {isAdding === row.original.id ? (
              <LoadingSpinner />
            ) : (
              <>
                {usedEquipment.find((e) => e.equipmentId === row.original.id) !=
                null ? (
                  <>
                    Added <Check />
                  </>
                ) : (
                  <Plus />
                )}
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  const onAdd = async (equipment: Equipment) => {
    try {
      setIsAdding(equipment.id);
      assignEquipment(
        {
          equipmentId: equipment.id,
          projectId: id,
          quantity: 1,
        },
        {
          onSuccess: () => {
            toast.success("Equipment added successfully");
          },
          onError: () => {
            toast.error("An error occurred");
          },
        }
      );
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Available Equipment</h3>
        <p className='text-sm text-muted-foreground'>
          A list of all the available equipment. Select equipment that was used
          on the job. if you don&apos;t see the equipment you need,{" "}
          <Link
            href='/settings/equipment'
            className='text-primary hover:underline'
          >
            add equipment here
          </Link>
          .
        </p>
      </div>
      <Card className='w-full'>
        <TableProvider columns={columns} data={availableEquipment}>
          <TableHeader>
            {({ headerGroup }) => (
              <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
                {({ header }) => <TableHead key={header.id} header={header} />}
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
      </Card>
    </div>
  );
};

export default AvailableEquipment;
