import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { event } from "nextjs-google-analytics";
import { ChevronDown, ChevronRight, Pencil, Trash } from "lucide-react";

import Readings from "./Readings";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@components/ui/dialog";
import { v4 } from "uuid";

const MitigationRoomTable = ({ room }: { room: RoomWithReadings }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { track } = useAmplitudeTrack();
  const [internalRoomName, setInternalRoomName] = useState(room.name);
  const [isCreating, setIsCreating] = useState(false);

  const { id } = useParams<{ id: string }>();

  const updateRoomName = async () => {
    if (internalRoomName === "" || internalRoomName.trim() === "") return;
    setIsSaving(true);
    track("Update Room Name");

    try {
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "PATCH",
        body: JSON.stringify({
          name: internalRoomName,
          roomId: room.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().updateRoomName(room, internalRoomName);
        setIsEditingTitle(false);
        toast.success("Room name updated");
      } else {
        toast.error("Failed to update room name");
      }
    } catch (error) {
      toast.error("Failed to update room name");
      console.log(error);
    }

    setIsSaving(false);
  };

  const deleteRoom = async () => {
    event("delete_room", {
      category: "Estimate Page",
    });
    setIsDeleting(true);
    track("Delete Room");
    try {
      const res = await fetch(`/api/v1/projects/${id}/room`, {
        method: "DELETE",
        body: JSON.stringify({
          roomId: room.publicId,
          name: room.name,
        }),
      });
      if (res.ok) {
        roomStore.getState().removeRoom(room);
        toast.success("Room deleted");
      } else {
        toast.error("Failed to delete room");
      }
    } catch (error) {
      toast.error("Failed to delete room");
      console.log(error);
    }
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  const addReading = async () => {
    setIsCreating(true);
    track("Add Room Reading");
    try {
      const res = await fetch(`/api/v1/projects/${id}/readings`, {
        method: "POST",
        body: JSON.stringify({
          type: "standard",
          data: { roomId: room.id, publicId: v4(), projectId: room.projectId },
        }),
      });
      if (res.ok) {
        const body = await res.json();
        toast.success("Reading added successfully");
        roomStore.getState().addReading(room.publicId, body.reading);
      } else {
        toast.error("Failed to add reading");
      }
      setIsCreating(false);
    } catch {
      toast.error("Failed to add reading");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center">
            {isEditingTitle ? (
              <>
                <Input
                  value={internalRoomName}
                  onChange={(e) => setInternalRoomName(e.target.value)}
                  disabled={isSaving}
                  className="h-8 w-48"
                />
                <Button
                  onClick={() => setIsEditingTitle(false)}
                  className="ml-2 h-8"
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateRoomName()}
                  className="ml-2 h-8"
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner /> : "Save"}
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold">{room.name}</h1>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={isCreating}
            onClick={() => addReading()}
            className="h-8"
          >
            {isCreating ? <LoadingSpinner /> : "Add Reading"}
          </Button>
          <Button
            onClick={() => setIsConfirmingDelete(true)}
            variant="destructive"
            className="h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4">
          <Readings room={room} />
        </div>
      </div>
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>Delete Room</DialogHeader>
          <DialogDescription>
            Permanently delete this room and everything associated within it
          </DialogDescription>
          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button onClick={deleteRoom} variant="destructive">
              {isDeleting ? <LoadingSpinner /> : "Yes, delete the room."}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MitigationRoomTable;
