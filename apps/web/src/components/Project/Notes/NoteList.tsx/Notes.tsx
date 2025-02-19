import Note from "./Note";

const Notes = ({ room }: { room: RoomWithReadings }) => {
  if (!room.Notes)
    return (
      <div className='ml-2 mt-4 flex items-center justify-start'>
        <div className='max-w-[35%] border-l-2 border-l-gray-400 px-2'>
          <div>
            <h3 className='text-lg font-medium'>No Notes</h3>
            <p className='text-sm text-muted-foreground'>
              Click &quot;Add Note&quot; to add notes to this room
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      {room.Notes.map((note) => (
        <Note key={note.publicId} roomPublicId={room.publicId} note={note} />
      ))}
      {room.Notes.length === 0 && (
        <div className='ml-2 mt-4 flex items-center justify-start'>
          <div className='max-w-[35%] border-l-2 border-l-gray-400 px-2'>
            <h5 className='text-lg font-semibold'>No Notes</h5>
            <p className='text-gray-500'>
              Click &quot;Add Note&quot; to add notes to this room
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
