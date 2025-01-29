"use client";

import { trpc } from "@utils/trpc";
import { RouterOutputs } from "@servicegeek/api";

import { useParams } from "next/navigation";

import TabTitleArea from "../TabTitleArea";

import AvailableEquipment from "./AvailableEquipment";
import UsedEquipment from "./UsedEquipment";

const ProjectEquipment = ({
  initialUsedEquipment,
  intialOrganizationEquipment,
}: {
  initialUsedEquipment: RouterOutputs["equipment"]["getAllUsed"];
  intialOrganizationEquipment: RouterOutputs["equipment"]["getAll"];
}) => {
  const { id } = useParams<{ id: string }>();
  const usedEquipment = trpc.equipment.getAllUsed.useQuery(
    {
      projectPublicId: id,
    },
    {
      initialData: initialUsedEquipment,
    }
  );

  return (
    <div>
      <TabTitleArea
        title='Equipment Transfer'
        description='Keep track of equipment used on the job'
      ></TabTitleArea>
      <div className='mt-12 space-y-12'>
        <UsedEquipment usedEquipment={usedEquipment.data} />
        <AvailableEquipment
          usedEquipment={usedEquipment.data}
          intialOrganizationEquipment={intialOrganizationEquipment}
        />
      </div>
    </div>
  );
};

export default ProjectEquipment;
