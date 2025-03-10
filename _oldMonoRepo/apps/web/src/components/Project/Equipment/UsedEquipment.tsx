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
import { Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import { Card } from "@components/ui/card";
import { useParams } from "next/navigation";

// const UsedEquipmentRow = ({ equipment }: { equipment: ProjectEquipment }) => {
//   const router = useRouter();
//   const utils = trpc.useContext();

//   const addUsedEquipment = trpc.equipment.setQuantityUsed.useMutation({
//     onSettled(d, a) {
//       // Sync with server once mutation has settled
//       utils.equipment.getAllUsed.invalidate();
//     },
//   });
//   const removeUsedEquipment = trpc.equipment.removeUsedItem.useMutation({
//     async onMutate({ projectPublicId, usedItemPublicId }) {
//       await utils.equipment.getAllUsed.cancel();
//       const prevData = utils.equipment.getAllUsed.getData();
//       utils.equipment.getAllUsed.setData({ projectPublicId }, (old) =>
//         produce(old, (draft) => {
//           const index = old?.findIndex((p) => p.publicId === usedItemPublicId);
//           if (index !== undefined && index >= 0) draft?.splice(index, 1);
//         })
//       );
//       return { prevData };
//     },
//     onError(err, { projectPublicId }, ctx) {
//       // If the mutation fails, use the context-value from onMutate
//       if (ctx?.prevData)
//         utils.equipment.getAllUsed.setData({ projectPublicId }, ctx.prevData);
//     },
//     onSettled(d, a) {
//       utils.equipment.getAllUsed.invalidate();
//     },
//   });
//   const [isRemoving, setIsRemoving] = useState(false);

//   const onRemove = async () => {
//     setIsRemoving(true);
//     if (equipment.publicId.indexOf("temporary") === -1) {
//       try {
//         await removeUsedEquipment.mutateAsync({
//           projectPublicId: router.query.id as string,
//           usedItemPublicId: equipment.publicId,
//         });
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     setIsRemoving(false);
//   };

//   return (
//     <TableRow key={equipment.publicId}>
//       <TableData important>{equipment.Equipment?.name ?? ""}</TableData>
//       <TableData noClass>
//         <TertiaryButton onClick={() => onRemove()} loading={isRemoving}>
//           Remove
//         </TertiaryButton>
//       </TableData>
//     </TableRow>
//   );
// };

const UsedEquipment = ({
  usedEquipment,
  setUsedEquipment,
  setAvailableEquipment,
}: {
  usedEquipment: ProjectEquipment[];
  setUsedEquipment: React.Dispatch<React.SetStateAction<ProjectEquipment[]>>;
  setAvailableEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
}) => {
  const [isDeleting, setIsDeleting] = useState<ProjectEquipment | null>(null);

  const columns: ColumnDef<ProjectEquipment>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>
          {row.original.Equipment?.name ?? ""}
        </span>
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
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-start gap-3'>
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

  const { id } = useParams<{ id: string }>();

  const onDelete = async (e: ProjectEquipment) => {
    try {
      setIsDeleting(e);

      await fetch(`/api/v1/projects/${id}/equipment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ equipmentId: e.id }),
      });

      setUsedEquipment(usedEquipment.filter((i) => i.publicId !== e.publicId));
      setAvailableEquipment((prev) => [...prev, e.Equipment]);
      toast.success("Equipment deleted successfully");
    } catch {
      toast.error("An error occurred");
    }

    setIsDeleting(null);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Used Equipment</h3>
        <p className='text-sm text-muted-foreground'>
          A list of all the equipment used on the job.
        </p>
      </div>
      <Card className='w-full'>
        <TableProvider columns={columns} data={usedEquipment}>
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

export default UsedEquipment;
