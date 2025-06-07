"use client";

import EmptyState from "@components/DesignSystem/EmptyState";
import { useGetRooms } from "@service-geek/api-client";
import { useParams } from "next/navigation";
import NoteList from "./NoteList.tsx";
import { LoadingPlaceholder } from "@components/ui/spinner";
export default function RoomNoteList() {
  const { id } = useParams<{ id: string }>();
  const { data: rooms, isLoading: isRoomsLoading } = useGetRooms(id as string);
  if (isRoomsLoading) {
    return <LoadingPlaceholder />;
  }
  return (
    <div className='space-y-6 divide-y-2'>
      {rooms?.length === 0 ? (
        <EmptyState
          imagePath={"/images/empty.svg"}
          title={"No Rooms Added"}
          description={
            "Get started by adding rooms. Humidity, temperature, and gpp data can be associated with each room"
          }
        />
      ) : (
        <>{rooms?.map((room) => <NoteList key={room.id} room={room} />)}</>
      )}
    </div>
  );
}
