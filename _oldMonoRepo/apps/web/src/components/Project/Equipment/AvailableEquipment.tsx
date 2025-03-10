// import { useState } from "react";
// import Table from "@components/DesignSystem/Table/Table";
// import TableBody from "@components/DesignSystem/Table/TableBody";
// import TableData from "@components/DesignSystem/Table/TableData";
// import TableHead from "@components/DesignSystem/Table/TableHead";
// import TableHeader from "@components/DesignSystem/Table/TableHeader";
// import TableRow from "@components/DesignSystem/Table/TableRow";
// import clsx from "clsx";
// import Link from "next/link";
// import { v4 } from "uuid";
// import { Button } from "react-day-picker";
// import { useParams } from "next/navigation";

// const AvailableEquipmentRow = ({
//   equipment,
//   isUsed,
// }: {
//   equipment: Equipment;
//   isUsed: boolean;
// }) => {
//   const { id } = useParams<{ id: string }>();
//   const utils = trpc.useUtils();
//   const addUsedEquipment = trpc.equipment.setQuantityUsed.useMutation({
//     async onMutate({ equipmentPublicId, projectPublicId }) {
//       await utils.equipment.getAllUsed.cancel();
//       const prevData = utils.equipment.getAllUsed.getData();
//       const availableData = utils.equipment.getAll.getData();

//       const temporaryId = v4();

//       utils.equipment.getAllUsed.setData({ projectPublicId }, (old) => {
//         const existingEquipment = availableData?.find(
//           (e) => e.publicId === equipmentPublicId
//         );
//         if (!existingEquipment) return old;
//         const newData = {
//           publicId: `temporary-id-${temporaryId}`,
//           quantity: 1,
//           equipment: existingEquipment,
//         };
//         if (!old) {
//           return [newData];
//         }
//         return [...old, newData];
//       });
//       return { prevData, temporaryId };
//     },
//     onError(err, { projectPublicId }, ctx) {
//       if (ctx?.prevData)
//         utils.equipment.getAllUsed.setData({ projectPublicId }, ctx.prevData);
//     },
//     onSettled() {
//       utils.equipment.getAllUsed.invalidate();
//     },
//   });
//   const [isAdding, setIsAdding] = useState(false);

//   const addEquipment = async () => {
//     setIsAdding(true);
//     try {
//       await addUsedEquipment.mutateAsync({
//         projectPublicId: id,
//         equipmentPublicId: equipment.publicId,
//         quantity: 1,
//       });
//     } catch (e) {
//       console.error(e);
//     }
//     setIsAdding(false);
//   };

//   return (
//     <TableRow
//       key={equipment.publicId}
//       className={clsx(isUsed && "bg-neutral-100")}
//     >
//       <TableData important>{equipment.name}</TableData>
//       <TableData noClass>
//         {/* {!isUsed && (
//           <Button disabled={isAdding} onClick={addEquipment}>
//             Add
//           </Button>
//         )} */}
//       </TableData>
//     </TableRow>
//   );
// };

// const AvailableEquipment = ({
//   usedEquipment,
//   allEquipment,
// }: {
//   usedEquipment: ProjectEquipment[];
//   allEquipment: Equipment[];
// }) => {
//   // const availableEquipment = trpc.equipment.getAll.useQuery(undefined, {
//   //   initialData: intialOrganizationEquipment,
//   // });

//   return (
//     <Table
//       header='Available Equipment'
//       subtitle={
//         <p>
//           A list of all the available equipment. Select equipment that was used
//           on the job.
//           <br /> if you don&apos;t see the equipment you need,{" "}
//           <Link
//             href='/settings/equipment'
//             className='text-primary hover:underline'
//           >
//             Add Equipment
//           </Link>
//           .
//         </p>
//       }
//     >
//       <TableHead>
//         <TableHeader title='Name' leading />
//       </TableHead>
//       <TableBody>
//         {allEquipment.map((equipment) => (
//           <AvailableEquipmentRow
//             key={equipment.publicId}
//             equipment={equipment}
//             isUsed={
//               !!usedEquipment?.find(
//                 (e) => e.Equipment?.publicId === equipment.publicId
//               )
//             }
//           />
//         ))}
//       </TableBody>
//     </Table>
//   );
// };

// export default AvailableEquipment;
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
import { projectStore } from "@atoms/project";
import Link from "next/link";

const AvaliableEquipment = ({
  usedEquipment,
  availableEquipment,
  setUsedEquipment,
  setAvailableEquipment,
}: {
  usedEquipment: ProjectEquipment[];
  availableEquipment: Equipment[];
  setUsedEquipment: React.Dispatch<React.SetStateAction<ProjectEquipment[]>>;
  setAvailableEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
}) => {
  const [isDeleting, setIsDeleting] = useState<Equipment | null>(null);

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
            {isDeleting && isDeleting.publicId == row.original.publicId ? (
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

  const { id } = useParams<{ id: string }>();
  const project = projectStore();

  const onAdd = async (e: Equipment) => {
    try {
      setIsDeleting(e);

      const res = await fetch(`/api/v1/projects/${id}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId: e.id,
          projectId: project.project!.id,
        }),
      });

      const json = await res.json();

      toast.success("Equipment added successfully");
      console.log(json);
      setUsedEquipment([...usedEquipment, { ...json, Equipment: e }]);
      setAvailableEquipment(availableEquipment.filter((i) => i.id !== e.id));
    } catch {
      toast.error("An error occurred");
    }

    setIsDeleting(null);
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

export default AvaliableEquipment;
