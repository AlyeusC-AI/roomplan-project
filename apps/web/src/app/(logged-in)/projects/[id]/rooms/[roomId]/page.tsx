"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Ruler,
  Plus,
  Camera,
  PlusCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useGetRooms, useSearchImages } from "@service-geek/api-client";
import { LoadingPlaceholder } from "@/components/ui/spinner";
import Link from "next/link";
import ReadingsRoomTable from "@/components/Project/Readings/ReadingsRoomTable";
import NoteList from "@/components/Project/Notes/NoteList.tsx";
import AreasAffected from "@/components/Project/Scope/AreasAffected";
import PhotoList from "@/components/Project/Photos/PhotoList";
import ImageUploadModal from "@/components/Project/Photos/ImageUploadModal";

const TABS = [
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "readings", label: "Readings", icon: BookOpen },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "scope", label: "Scope", icon: Ruler },
];

export default function RoomPage() {
  const { id, roomId } = useParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("images");
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  const { data: rooms, isLoading } = useGetRooms(id as string);
  const room = useMemo(
    () => rooms?.find((r) => r.id === roomId),
    [rooms, roomId]
  );

  // Get images for this specific room
  const {
    data: imagesData,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useSearchImages(
    id as string,
    {
      type: "ROOM",
      roomIds: roomId ? [roomId] : [],
    },
    { field: "createdAt", direction: "desc" },
    { page: 1, limit: 100 }
  );

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (!room) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <h2 className='mb-2 text-xl font-semibold'>Room not found</h2>
        <p className='mb-4 text-muted-foreground'>
          The room you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href={`/projects/${id}/rooms`}>
            <ChevronLeft className='mr-2 h-4 w-4' />
            Back to Rooms
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-4'>
          <Link
            href={`/projects/${id}/rooms`}
            className='flex items-center gap-2'
          >
            <ChevronLeft size={18} />
            Back
          </Link>

          <div>
            <h1 className='text-lg font-medium tracking-tight'>{room.name}</h1>
            <p className='text-sm text-muted-foreground'>
              Manage room details, photos, readings, and scope
            </p>
          </div>
        </div>
        {/* <div className='flex gap-2'>
          <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
            <DialogTrigger asChild>
              <Button size='sm'>
                <Camera className='mr-2 h-4 w-4' />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <ImageUploadModal setOpen={setIsImageUploadOpen} />
            </DialogContent>
          </Dialog>
        </div> */}
      </div>

      {/* Room Info Card */}
      {/* <Card>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>
                Dimensions
              </p>
              <p className='text-lg font-semibold'>
                {room.length && room.width
                  ? `${room.length}' × ${room.width}'`
                  : "Not set"}
              </p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>
                Square Feet
              </p>
              <p className='text-lg font-semibold'>
                {room.totalSqft ? `${room.totalSqft} sq ft` : "Not set"}
              </p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>
                Windows
              </p>
              <p className='text-lg font-semibold'>{room.windows || 0}</p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>Doors</p>
              <p className='text-lg font-semibold'>{room.doors || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className='flex items-center gap-2'
              >
                <Icon className='h-4 w-4' />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value='images' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Room Images</h3>
            <Dialog
              open={isImageUploadOpen}
              onOpenChange={setIsImageUploadOpen}
            >
              <DialogTrigger asChild>
                <Button size='sm'>
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <ImageUploadModal setOpen={setIsImageUploadOpen} />
              </DialogContent>
            </Dialog>
          </div>
          {isLoadingImages ? (
            <LoadingPlaceholder />
          ) : !imagesData?.data || imagesData.data.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-12'>
              <ImageIcon className='mb-4 h-12 w-12 text-muted-foreground/50' />
              <h3 className='mb-2 text-lg font-semibold'>No images yet</h3>
              <p className='mb-4 text-center text-muted-foreground'>
                Start by adding photos to document this room
              </p>
              <Dialog
                open={isImageUploadOpen}
                onOpenChange={setIsImageUploadOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Camera className='mr-2 h-4 w-4' />
                    Add First Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <ImageUploadModal setOpen={setIsImageUploadOpen} />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className='rounded-lg border'>
              <PhotoList
                photos={imagesData.data}
                refetch={refetchImages}
                hideEmptyRooms={true}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value='readings' className='space-y-4'>
          <div className='rounded-lg border'>
            <ReadingsRoomTable room={room} />
          </div>
        </TabsContent>

        <TabsContent value='notes' className='space-y-4'>
          <div className='rounded-lg border'>
            <NoteList room={room} />
          </div>
        </TabsContent>

        <TabsContent value='scope' className='space-y-4'>
          <div className='rounded-lg border'>
            <AreasAffected room={room} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
