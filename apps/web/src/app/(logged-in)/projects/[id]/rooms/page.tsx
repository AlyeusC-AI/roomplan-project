"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  Home,
  Image as ImageIcon,
  Camera,
  FileText,
  Ruler,
  BookOpen,
} from "lucide-react";
import { useGetRooms } from "@service-geek/api-client";
import { LoadingPlaceholder } from "@/components/ui/spinner";
import EmptyState from "@/components/DesignSystem/EmptyState";
import Link from "next/link";

export default function RoomsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: rooms, isLoading: loadingRooms } = useGetRooms(id as string);

  const handleCreateRoom = () => {
    router.push(`/projects/${id}/rooms/create`);
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/projects/${id}/rooms/${roomId}`);
  };

  if (loadingRooms) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Rooms</h1>
          <p className='text-muted-foreground'>Manage project rooms</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={handleCreateRoom} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Create Room
          </Button>
        </div>
      </div>

      {/* Rooms Content */}
      <div className='space-y-4'>
        {rooms?.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <EmptyState
              imagePath='/images/empty.svg'
              title='No Rooms Added'
              description='Get started by adding rooms. Photos, readings, notes, and scope data can be associated with each room.'
            />
            <Button onClick={handleCreateRoom} className='mt-4'>
              <Plus className='mr-2 h-4 w-4' />
              Create Room
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {/* Create Room Card */}
            <Card
              className='h-48 cursor-pointer border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50'
              onClick={handleCreateRoom}
            >
              <CardContent className='flex h-full flex-col items-center justify-center p-6'>
                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                  <Plus className='h-6 w-6 text-muted-foreground' />
                </div>
                <h3 className='text-center font-semibold'>Create Room</h3>
                <p className='mt-1 text-center text-sm text-muted-foreground'>
                  Add a new room to this project
                </p>
              </CardContent>
            </Card>

            {/* Room Cards */}
            {rooms?.map((room) => (
              <Card
                key={room.id}
                className='group h-48 cursor-pointer overflow-hidden transition-shadow hover:shadow-lg'
                onClick={() => handleRoomClick(room.id)}
              >
                <div className='relative h-full'>
                  {/* Room Image or Placeholder */}
                  {room.images && room.images.length > 0 ? (
                    <div className='absolute inset-0'>
                      <img
                        src={room.images[0].url}
                        alt={room.name}
                        className='h-full w-full object-cover'
                      />
                      <div className='absolute inset-0 bg-black/20' />
                    </div>
                  ) : (
                    <div className='absolute inset-0 flex items-center justify-center bg-muted'>
                      <ImageIcon className='h-12 w-12 text-muted-foreground/50' />
                    </div>
                  )}

                  {/* Room Name Overlay */}
                  <div className='absolute left-0 right-0 top-0 bg-black/60 p-3'>
                    <h3 className='truncate text-sm font-semibold text-white'>
                      {room.name}
                    </h3>
                  </div>

                  {/* Room Stats Overlay */}
                  <div className='absolute bottom-0 left-0 right-0 bg-black/60 p-3'>
                    <div className='flex items-center justify-between text-xs text-white'>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          <Camera className='h-3 w-3' />
                          <span>{room.images?.length || 0}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <FileText className='h-3 w-3' />
                          <span>0</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <BookOpen className='h-3 w-3' />
                          <span>0</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Ruler className='h-3 w-3' />
                        <span>Scope</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
