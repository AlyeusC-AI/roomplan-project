import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { roomStore } from "@atoms/room";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";
import { Textarea } from "@components/ui/textarea";
import debounce from "lodash/debounce";

const Note = ({ roomPublicId, note }: { roomPublicId: string; note: Note }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [body, setBody] = useState(note.body);
  const [lastSavedBody, setLastSavedBody] = useState(note.body);
  const { id } = useParams<{ id: string }>();

  const saveNote = async (newBody: string) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/v1/projects/${id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: roomPublicId,
          body: newBody,
          noteId: note.publicId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        roomStore.getState().updateRoomNote(roomPublicId, note.publicId, {
          notesAuditTrail: json.note.NotesAuditTrail,
          updatedAt: json.note.updatedAt,
          body: newBody,
        } as Partial<Note>);
        setLastSavedBody(newBody);
        // Only show success toast when manually saving
        if (!json.note.autosave) {
          toast.success("Note saved");
        }
      } else {
        toast.error("Failed to save note");
        console.error("Failed to save note");
      }
    } catch (error) {
      toast.error("Failed to save note");
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced autosave function
  const debouncedSave = useCallback(
    debounce((newBody: string) => {
      if (newBody !== lastSavedBody) {
        saveNote(newBody);
      }
    }, 1000),
    [lastSavedBody]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

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
        console.error("Failed to delete note");
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note");
    }
    setIsDeleting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBody = e.target.value;
    setBody(newBody);
    debouncedSave(newBody);
  };

  const hasUnsavedChanges = body !== lastSavedBody;

  return (
    <div className='mt-6 border-l-2 border-gray-500 pl-4'>
      <div className='grid grid-cols-2 gap-6'>
        <div className='col-span-1 flex items-center justify-between'>
          <h4>{format(new Date(note.date), "PPp")}</h4>
          <div className='flex items-center space-x-2'>
            {hasUnsavedChanges && (
              <span className='text-sm text-yellow-600'>
                {isSaving ? "Saving..." : "Unsaved changes"}
              </span>
            )}
            <Button
              variant='outline'
              onClick={() => saveNote(body)}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <LoadingSpinner />
              ) : (
                <>
                  Save <Pencil className='h-6' />
                </>
              )}
            </Button>
            <Button
              variant='destructive'
              onClick={onDeleteNote}
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
                "block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500",
                isSaving && "bg-gray-50"
              )}
              placeholder='Take notes for this room'
              value={body}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>
          <div className='mt-2 text-xs'>
            {note.updatedAt && (
              <>
                <p>
                  Last updated{" "}
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
