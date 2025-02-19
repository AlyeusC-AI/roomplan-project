import { useState } from "react";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { roomStore } from "@atoms/room";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";
import { Textarea } from "@components/ui/textarea";

const Note = ({ roomPublicId, note }: { roomPublicId: string; note: Note }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(note.body);

  const onSave = async () => {
    try {
      setIsEditing(true);
      const res = await fetch(`/api/v1/projects/${id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: roomPublicId,
          body,
          noteId: note.publicId,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        roomStore
          .getState()
          .updateRoomNote(
            roomPublicId,
            note.publicId,
            json.result.notesAuditTrail,
            json.result.updatedAt
          );

        toast.success("Note saved");
        // setRooms((oldRooms) => {
        //   return produce(oldRooms, (draft) => {
        //     const roomIndex = draft.findIndex(
        //       (r) => r.publicId === roomPublicId
        //     )
        //     if (roomIndex < 0 || !draft[roomIndex]) return draft

        //     const noteIndex = draft[roomIndex].notes?.findIndex(
        //       (n) => n.publicId === note.publicId
        //     )
        //     if (noteIndex === undefined || noteIndex < 0) return draft
        //     draft[roomIndex].notes[noteIndex].updatedAt = json.result.updatedAt
        //     draft[roomIndex].notes[noteIndex].notesAuditTrail =
        //       json.result.notesAuditTrail
        //     return draft
        //   })
        // })
      } else {
        toast.error("Failed to save room note");
        console.error("Failed to save room note");
      }
    } catch (error) {
      toast.error("Failed to save note.");
      console.log(error);
    }

    setIsEditing(false);
  };

  const { id } = useParams<{ id: string }>();

  const onDeleteNote = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/projects/${id}/notes`, {
        method: "DELETE",
        body: JSON.stringify({
          roomId: roomPublicId,
          noteId: note.publicId,
        }),
      });
      if (res.ok) {
        roomStore.getState().removeRoomNote(roomPublicId, note.publicId);
      } else {
        console.error("Failed to delete room readings");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note.");
    }
    setIsDeleting(false);
  };

  return (
    <div className='mt-6 border-l-2 border-gray-500 pl-4'>
      <div className='grid grid-cols-2 gap-6'>
        <div className='col-span-1 flex items-center justify-between'>
          <h4>{format(new Date(note.date), "PPp")}</h4>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' onClick={onSave} disabled={isEditing}>
              {isEditing ? (
                <LoadingSpinner />
              ) : (
                <>
                  Update <Pencil className='h-6' />
                </>
              )}
            </Button>
            <Button
              variant='destructive'
              onClick={() => onDeleteNote()}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : <Trash className='h-6' />}
            </Button>
          </div>
        </div>
        <div className='col-start-1'>
          <div className={clsx("relative mt-1 rounded-md shadow-sm")}>
            <Textarea
              name={note.publicId}
              id={note.publicId}
              className={clsx(
                "block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500"
              )}
              placeholder='Take notes for this room'
              defaultValue={note.body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className='mt-2 text-xs'>
            {note.updatedAt && (
              <>
                <p>
                  Last updated at{" "}
                  {formatDistance(new Date(note.updatedAt), Date.now(), {
                    addSuffix: true,
                  })}
                  {note.NotesAuditTrail?.length > 0 &&
                    note.NotesAuditTrail[0].userName && (
                      <>
                        {" "}
                        by <strong>{note.NotesAuditTrail[0].userName}</strong>
                      </>
                    )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Note;
