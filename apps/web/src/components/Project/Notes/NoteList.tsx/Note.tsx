import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { format, formatDistance } from "date-fns";
import { Pencil, Trash, Camera } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Button } from "@components/ui/button";
import { useParams } from "next/navigation";
import { Textarea } from "@components/ui/textarea";
import debounce from "lodash/debounce";
import ImageGallery from "./ImageGallery";
import {
  Note as NoteType,
  useCreateNote,
  useUpdateNote,
  useUpdateRoom,
  useDeleteNote,
} from "@service-geek/api-client";

const Note = ({ note }: { note: NoteType }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [body, setBody] = useState(note.body);
  const [lastSavedBody, setLastSavedBody] = useState(note.body);
  const { id } = useParams<{ id: string }>();
  const { mutate: createNote } = useCreateNote();
  const { mutate: updateNote } = useUpdateNote();
  const { mutate: updateRoom } = useUpdateRoom();
  const { mutate: deleteNote } = useDeleteNote();

  const saveNote = async (newBody: string) => {
    try {
      setIsSaving(true);
      updateNote({
        id: note.id,
        data: {
          body: newBody,
        },
      });

      setLastSavedBody(newBody);
      toast.success("Note saved");
    } catch (error) {
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
      deleteNote(note.id);
      toast.success("Note deleted");
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
          <h4>{format(new Date(note.createdAt), "PPp")}</h4>
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
              name={note.id}
              id={note.id}
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
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {note.images && note.images.length > 0 && (
        <ImageGallery images={note.images} />
      )}
    </div>
  );
};

export default Note;
