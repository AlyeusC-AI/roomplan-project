import EmptyState from "@components/DesignSystem/EmptyState";
import { roomStore } from "@atoms/room";

import ReadingsRoomTable from "./ReadingsRoomTable";
import { useGetRooms } from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { LoadingPlaceholder } from "@components/ui/spinner";
export default function ReadingsTable() {
  const { id } = useParams<{ id: string }>();
  const { data: rooms, isLoading: isLoadingRooms } = useGetRooms(id);

  return (
    <div className='space-y-6 divide-y-2 dark:divide-gray-700'>
      {isLoadingRooms ? (
        <LoadingPlaceholder />
      ) : rooms?.length === 0 ? (
        <EmptyState
          imagePath={"/images/empty.svg"}
          title={"No Rooms Added"}
          description={
            "Get started by adding rooms. Humidity, temperature, and gpp data can be associated with each room"
          }
        />
      ) : (
        <>
          {rooms
            // ?.sort((a, b) =>
            //   new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
            // )
            ?.map((room) => <ReadingsRoomTable key={room.id} room={room} />)}
        </>
      )}
    </div>
  );
}
