import { format } from "date-fns";
import PDFSafeImage from "./PDFSaveImage";
import { Room } from "@service-geek/api-client";
import { useGetNotes } from "@service-geek/api-client";

const Notes = ({ room }: { room: Room }) => {
  const { data: notesData } = useGetNotes(room.id);
  const notes = notesData || [];
  if (notes.length === 0) return null;
  return (
    <div className='pdf new-page'>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        {room.name}: Notes
      </h2>
      {notes.map((note) => (
        <div key={note.id} className='mb-8'>
          <div>{format(new Date(note.createdAt), "LLLL	d, yyyy")}</div>
          <p className='pdf notes-body section-spacing'>{note.body}</p>
          {note.images && note.images.length > 0 && (
            <div className='mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4'>
              {note.images.map((image, index) => (
                <div key={image.id} className='relative'>
                  <PDFSafeImage
                    url={image.url}
                    alt={`Note image ${index + 1}`}
                    className='h-48 w-full max-w-[400px] rounded-lg object-contain'
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notes;
