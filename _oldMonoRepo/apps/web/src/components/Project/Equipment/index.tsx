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
  const getAvailableEquipment = async () => {
    await fetch("/api/v1/organization/available-equipment")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 ~ .then ~ data:", data);
        setEquipment(data.equipment || []);
        setFetching(false);
      });
  };
  useEffect(() => {
    setFetching(true);
    getAvailableEquipment();
    fetch(`/api/v1/projects/${id}/equipment`)
      .then((res) => res.json())
      .then((data) => {
        setUsedEquipment(data);
        setFetching(false);
      });
  }, []);
  // useEffect(() => {
  //   getAvailableEquipment();
  // }, [usedEquipment]);

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
          setAvailableEquipment={setEquipment}
        />
        <AvailableEquipment
          usedEquipment={usedEquipment}
          availableEquipment={equipment}
          setUsedEquipment={setUsedEquipment}
          setAvailableEquipment={setEquipment}
        />
      </div>
    </div>
  );
};

export default ProjectEquipment;
