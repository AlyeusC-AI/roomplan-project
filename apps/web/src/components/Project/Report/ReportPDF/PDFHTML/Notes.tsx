import { format } from "date-fns";
import PDFSafeImage from "./PDFSaveImage";

const Notes = ({ roomName, notes }: { roomName: string; notes: Note[] }) => {
  console.log("🚀 ~ Notes ~ notes:", notes?.[0]?.NoteImage);
  if (notes.length === 0) return null;
  return (
    <div className='pdf new-page'>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        {roomName}: Notes
      </h2>
      {notes.map((note) => (
        <div key={note.publicId} className='mb-8'>
          <div>{format(new Date(note.date), "LLLL	d, yyyy")}</div>
          <p className='pdf notes-body section-spacing'>{note.body}</p>
          {note.NoteImage && note.NoteImage.length > 0 && (
            <div className='mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4'>
              {note.NoteImage.map((image, index) => (
                <div key={image.imageKey} className='relative'>
                  <PDFSafeImage
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/note-images/${image.imageKey}`}
                    alt={`Note image ${index + 1}`}
                    className='h-48 w-full max-w-[400px] rounded-lg object-cover'
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
