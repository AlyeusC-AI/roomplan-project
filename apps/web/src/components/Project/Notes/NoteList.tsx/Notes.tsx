import { RoomDataWithoutInferences } from '@restorationx/db/queries/project/getProjectDetections'

import Note from './Note'

const Notes = ({ room }: { room: RoomDataWithoutInferences }) => {
  if (!room.notes)
    return (
      <div className="mt-4 ml-2 flex items-center justify-start">
        <div className="max-w-[35%] border-l-2 border-l-gray-400 px-2">
          <h5 className="text-lg font-semibold">No Notes</h5>
          <p className="text-gray-500">
            Click &quot;Add Note&quot; to add notes to this room
          </p>
        </div>
      </div>
    )

  return (
    <div>
      {room.notes.map((note) => (
        <Note key={note.publicId} roomPublicId={room.publicId} note={note} />
      ))}
      {room.notes.length === 0 && (
        <div className="mt-4 ml-2 flex items-center justify-start">
          <div className="max-w-[35%] border-l-2 border-l-gray-400 px-2">
            <h5 className="text-lg font-semibold">No Notes</h5>
            <p className="text-gray-500">
              Click &quot;Add Note&quot; to add notes to this room
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
