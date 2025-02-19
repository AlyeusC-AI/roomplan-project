import React, { useEffect, useState } from "react";
import EmptyState from "@components/DesignSystem/EmptyState";
import useFilterParams from "@utils/hooks/useFilterParams";
import { format } from "date-fns";
import produce from "immer";

import PhotoGroup from "./PhotoGroup";
import RoomReassignModal from "./RoomReassignModal";
import TheaterMode from "./TheaterMode";
import { roomStore } from "@atoms/room";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@components/ui/dialog";
import { userInfoStore } from "@atoms/user-info";
import { teamMembersStore } from "@atoms/team-members";

const PhotoList = ({
  photos,
  setPhotos,
}: {
  photos?: ImageQuery_Image[];
  setPhotos: React.Dispatch<React.SetStateAction<ImageQuery_Image[]>>;
}) => {
  const [theaterModeIndex, setTheaterModeIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isRoomReassignOpen, setIsRoomReassignOpen] = useState(false);
  const { rooms, onlySelected } = useFilterParams();
  const roomList = roomStore((state) => state.rooms);
  const user = userInfoStore();

  const [selectedPhotos, setSelectedPhotos] = useState<ImageQuery_Image[]>([]);

  // const trpcContext = trpc.useContext();

  // const deletePhotoMutation = trpc.photos.deleteProjectPhotos.useMutation({
  //   async onMutate({ photoIds }) {
  //     await trpcContext.photos.getProjectPhotos.cancel();
  //     const prevData =
  //       trpcContext.photos.getProjectPhotos.getData(queryContext);
  //     trpcContext.photos.getProjectPhotos.setData(queryContext, (old) => {
  //       const updated = old?.images?.filter(
  //         (p) => !photoIds.some((id) => id === p.publicId)
  //       );
  //       return { images: updated || [] };
  //     });
  //     return { prevData };
  //   },
  //   onSettled() {
  //     trpcContext.photos.getProjectPhotos.invalidate();
  //   },
  // });

  // const setRoomForProjectPhotosMutation =
  //   trpc.photos.setRoomForProjectPhotos.useMutation({
  //     async onMutate({ photoKeys, roomId }) {
  //       await trpcContext.photos.getProjectPhotos.cancel();
  //       const prevData =
  //         trpcContext.photos.getProjectPhotos.getData(queryContext);
  //       const newRoom = roomList.find((room) => room.publicId === roomId);
  //       trpcContext.photos.getProjectPhotos.setData(queryContext, (old) => {
  //         const updated = produce(old, (draft) => {
  //           if (!old || !draft) return;
  //           try {
  //             for (let i = 0; i < old.images?.length; i++) {
  //               if (photoKeys.find((key) => key === old.images[i].key)) {
  //                 if (old.images[i] && old.images[i].inference && newRoom) {
  //                   draft.images[i] = {
  //                     ...old.images[i],
  //                     ...(old.images[i].inference !== null && {
  //                       inference: {
  //                         publicId: old.images[i].inference!.publicId,
  //                         room: {
  //                           name: newRoom.name,
  //                           publicId: newRoom?.publicId,
  //                         },
  //                       },
  //                     }),
  //                   };
  //                 }
  //               }
  //             }
  //           } catch (e) {
  //             // something went horribly wrong
  //             console.error(e);
  //             location.reload();
  //             return;
  //           }
  //         });
  //         return updated;
  //       });
  //       return { prevData };
  //     },
  //     onSettled() {
  //       trpcContext.photos.getProjectPhotos.invalidate();
  //     },
  //   });

  const onPhotoClick = (key: string) => {
    const photoIndex = photos?.findIndex((p) => p.key === key);
    if (photoIndex !== undefined && photoIndex >= 0) {
      setTheaterModeIndex(photoIndex);
      setIsTheaterMode(true);
    }
  };

  useEffect(() => {
    console.log("fetching team members");
    fetch("/api/v1/organization/members")
      .then((res) => res.json())
      .then((data) => {
        console.log("team members", data);
        teamMembersStore.getState().setTeamMembers(data.members);
        console.log(data);
      });
  }, []);

  if (!photos) {
    return <LoadingPlaceholder />;
  }

  if (photos.length === 0 && (rooms || onlySelected)) {
    return (
      <div className='flex size-full items-center justify-center'>
        <EmptyState
          title='No photos match your filter criteria'
          imagePath='/images/void.svg'
          description='Try removing a few options'
          height={1038}
          width={995}
        />
      </div>
    );
  }

  let grouped: Record<string, ImageQuery_Image[]> = {};
  if (user.user?.groupView === "dateView") {
    grouped = photos.reduce((prev, photo) => {
      const day = format(new Date(photo.createdAt), "eee, MMM d, yyyy");
      return {
        ...prev,
        [day]: [...(prev[day] ? prev[day] : []), photo],
      };
    }, {});
  } else {
    grouped = photos.reduce((prev, photo) => {
      const room =
        photo.Inference.find((_, i) => i === 0)?.Room?.name || "Unknown room";
      return {
        ...prev,
        [room]: [...(prev[room] ? prev[room] : []), photo],
      };
    }, {});
    if (!rooms) {
      for (let i = 0; i < roomList.length; i++) {
        if (!grouped[roomList[i].name]) {
          grouped[roomList[i].name] = [];
        }
      }
    }
  }

  const onSelectPhoto = (photo: ImageQuery_Image) => {
    const photoIndex = selectedPhotos.findIndex((p) => p.key === photo.key);
    if (photoIndex === undefined || photoIndex === -1) {
      setSelectedPhotos([...selectedPhotos, photo]);
      return;
    } else if (photoIndex >= 0) {
      setSelectedPhotos((prev) =>
        produce(prev, (draft) => {
          const prevIndex = prev.findIndex((p) => p.key === photo.key);
          if (prevIndex >= 0) {
            draft.splice(prevIndex, 1);
          }
        })
      );
    }
  };

  const onDelete = async () => {
    // FILTER HERE IN CASE OF DRIFT
    const photoIds = selectedPhotos
      .map((p) => p.publicId)
      .filter((p) => photos.some((o) => o.publicId === p));
    // await deletePhotoMutation.mutateAsync({
    //   projectPublicId: queryContext.projectPublicId,
    //   photoIds,
    // });
    setSelectedPhotos([]);
  };

  const onUpdateRoom = async (roomId: string) => {
    // FILTER HERE IN CASE OF DRIFT
    const photoKeys = selectedPhotos
      .map((p) => p.key)
      .filter((p) => photos.some((o) => o.key === p));
    // await setRoomForProjectPhotosMutation.mutateAsync({
    //   projectPublicId: queryContext.projectPublicId,
    //   photoKeys,
    //   roomId,
    // });
    setSelectedPhotos([]);
    setIsRoomReassignOpen(false);
  };

  return (
    <div className='mt-4 flex flex-col gap-4'>
      <Dialog
        open={selectedPhotos.length > 0}
        onOpenChange={() => setSelectedPhotos([])}
      >
        <DialogContent>
          <DialogHeader>Manage Image(s)</DialogHeader>
          <DialogDescription>Manage your images here.</DialogDescription>
          <div className='flex justify-end gap-4'>
            <Button onClick={() => setIsRoomReassignOpen(true)}>
              Assign Room
            </Button>
            <Button variant='destructive' onClick={onDelete} disabled={false}>
              Delete Image(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <RoomReassignModal
        open={isRoomReassignOpen}
        setOpen={setIsRoomReassignOpen}
        onReassign={onUpdateRoom}
        loading={false}
      />
      {isTheaterMode && (
        <TheaterMode
          open={isTheaterMode}
          setOpen={setIsTheaterMode}
          photos={photos}
          theaterModeIndex={theaterModeIndex}
          setTheaterModeIndex={setTheaterModeIndex}
        />
      )}
      {Object.keys(grouped).map((day) => (
        <PhotoGroup
          key={day}
          day={day}
          photos={grouped[day]}
          onPhotoClick={onPhotoClick}
          onSelectPhoto={onSelectPhoto}
          selectedPhotos={selectedPhotos}
          setPhotos={setPhotos}
        />
      ))}
    </div>
  );
};

export default PhotoList;
