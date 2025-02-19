"use client";

import { useParams } from "next/navigation";
import AvailableEquipment from "./AvailableEquipment";
import UsedEquipment from "./UsedEquipment";
import { Separator } from "@components/ui/separator";
import { useEffect, useState } from "react";
import { LoadingPlaceholder } from "@components/ui/spinner";

const ProjectEquipment = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [usedEquipment, setUsedEquipment] = useState<ProjectEquipment[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    setFetching(true);
    fetch("/api/v1/organization/equipment")
      .then((res) => res.json())
      .then((data) => {
        setEquipment(data.equipment);
        setFetching(false);
      });
    fetch(`/api/v1/projects/${id}/equipment`)
      .then((res) => res.json())
      .then((data) => {
        setUsedEquipment(data);
        setFetching(false);
      });
  }, []);

  if (fetching) {
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
        <UsedEquipment
          usedEquipment={usedEquipment}
          setUsedEquipment={setUsedEquipment}
        />
        <AvailableEquipment
          usedEquipment={usedEquipment}
          availableEquipment={equipment}
          setUsedEquipment={setUsedEquipment}
        />
      </div>
    </div>
  );
};

export default ProjectEquipment;
