"use client";

import EmptyState from "@components/DesignSystem/EmptyState";
import { useParams } from "next/navigation";
import { Separator } from "@components/ui/separator";

import { useGetRooms } from "@service-geek/api-client";
import AreaAffected from "./AreasAffected";

type AreaAffectedType = "walls" | "floor" | "ceiling";
const areaAffectedTitle: Record<AreaAffectedType, string> = {
  walls: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const areaAffectedOrder = ["walls", "floor", "ceiling"] as const;

// Update the type definitions
type ExtraField = {
  label: string;
  unit: string;
  value: string;
};

type ExtraFields = {
  [key: string]: ExtraField;
};

export default function Scope() {
  const { id } = useParams<{ id: string }>();
  const { data: rooms } = useGetRooms(id);

  return (
    <div className='relative min-h-screen pb-20'>
      <div className='mb-8 space-y-6 bg-background/50 backdrop-blur-sm'>
        <div>
          <h2 className='text-lg font-medium'>
            Scope Details
          </h2>
          <p className='text-sm text-muted-foreground'>
            Enter room dimensions, number of windows and doors, as well as
            document affected areas.
          </p>
        </div>
        <Separator className='bg-border/40' />
      </div>

      {rooms?.length === 0 ? (
        <EmptyState
          imagePath={"/images/empty.svg"}
          title={"No Rooms Added"}
          description={
            "Get started by adding rooms. Scope details can be added for each room"
          }
        />
      ) : (
        <div className='container mx-auto space-y-16 px-4'>
          {rooms?.map((room) => <AreaAffected key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}
