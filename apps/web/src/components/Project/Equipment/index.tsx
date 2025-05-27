"use client";

import { useParams } from "next/navigation";
import AvailableEquipment from "./AvailableEquipment";
import UsedEquipment from "./UsedEquipment";
import { Separator } from "@components/ui/separator";
import { LoadingPlaceholder } from "@components/ui/spinner";
import {
  useGetEquipment,
  useGetEquipmentAssignments,
} from "@service-geek/api-client";

const ProjectEquipment = () => {
  const { id } = useParams<{ id: string }>();
  const { data: equipment = [], isLoading: isLoadingEquipment } =
    useGetEquipment();

  if (isLoadingEquipment) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-medium'>Equipment Transfer</h1>
        <p className='text-sm text-muted-foreground'>
          Keep track of equipment used on the job
        </p>
      </div>
      <Separator />
      <div className='mt-12 space-y-12'>
        <UsedEquipment />
        {/* <AvailableEquipment
          usedEquipment={usedEquipment}
          availableEquipment={equipment}
        /> */}
      </div>
    </div>
  );
};

export default ProjectEquipment;
