import { useState } from "react";
import TableData from "@components/DesignSystem/Table/TableData";
import TableRow from "@components/DesignSystem/Table/TableRow";
import { trpc } from "@utils/trpc";
import { RouterOutputs } from "@servicegeek/api";
import produce from "immer";
import { Button } from "@components/ui/button";

const EquipmentItem = ({
  equipment,
}: {
  equipment: RouterOutputs["equipment"]["getAll"][0];
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const setName = trpc.equipment.setName.useMutation();
  const utils = trpc.useUtils();

  const deleteEquipment = trpc.equipment.delete.useMutation({
    async onMutate({ publicId }) {
      await utils.equipment.getAll.cancel();
      const prevData = utils.equipment.getAll.getData();
      utils.equipment.getAll.setData(undefined, (old) =>
        produce(old, (draft) => {
          const index = old?.findIndex((p) => p.publicId === publicId);
          if (index !== undefined && index >= 0) draft?.splice(index, 1);
        })
      );
      return { prevData };
    },
    onError(err, data, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        utils.equipment.getAll.setData(undefined, ctx.prevData);
    },
    onSettled() {
      // Sync with server once mutation has settled
      utils.equipment.getAll.invalidate();
    },
  });

  // const onSave = async (name: string, publicId: string) => {
  //   setName.mutate({
  //     name,
  //     publicId,
  //   });
  // };

  const onDelete = async () => {
    setIsDeleting(true);
    if (equipment.publicId.indexOf("temporary") === -1) {
      try {
        await deleteEquipment.mutateAsync({ publicId: equipment.publicId });
      } catch (e) {
        console.error(e);
      }
    }
    setIsDeleting(true);
  };

  return (
    <TableRow key={equipment.publicId}>
      <TableData important>
        <></>
        {/* <AutoSaveTextInput
          defaultValue={equipment.name}
          onSave={(name) => onSave(name, equipment.publicId)}
          name={`${equipment.publicId}-equipmentName`}
          ignoreInvalid
        /> */}
      </TableData>
      <TableData>
        {/* @ts-expect-error ddd */}
        <Button variant='destructive' onClick={onDelete} disabled={isDeleting}>
          Remove<span className='sr-only'>, {equipment.name}</span>
        </Button>
      </TableData>
    </TableRow>
  );
};

export default EquipmentItem;
