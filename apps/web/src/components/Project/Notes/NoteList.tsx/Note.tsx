import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { roomStore } from "@atoms/room";
import { Pencil, Trash, Camera } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";
import { Textarea } from "@components/ui/textarea";
import debounce from "lodash/debounce";
import ImageGallery from "./ImageGallery";

const Note = ({ roomPublicId, note }: { roomPublicId: string; note: Note }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("noteId", note.publicId);
      formData.append("roomId", roomPublicId);

      const res = await fetch(`/api/v1/projects/${id}/notes/images`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        roomStore.getState().updateRoomNote(roomPublicId, note.publicId, {
          NoteImage: [...(note.NoteImage || []), json.image],
        } as Partial<Note>);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageKey: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${id}/notes/images`, {
        method: "DELETE",
        body: JSON.stringify({
          roomId: roomPublicId,
          noteId: note.publicId,
          imageKey,
        }),
      });

      if (res.ok) {
        roomStore.getState().updateRoomNote(roomPublicId, note.publicId, {
          NoteImage: note.NoteImage?.filter((img) => img.imageKey !== imageKey),
        } as Partial<Note>);
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
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
            {/* <Button
              variant='outline'
              className='relative'
              disabled={isUploading}
            >
              <Camera className='h-6' />
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <LoadingSpinner className="absolute inset-0 m-auto" />
              )}
            </Button> */}
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
      {note.NoteImage && note.NoteImage.length > 0 && (
        <ImageGallery images={note.NoteImage} onDeleteImage={handleDeleteImage} />
      )}
    </div>
  );
};

export default Note;
