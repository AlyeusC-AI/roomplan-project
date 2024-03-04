import { format } from 'date-fns'

const Notes = ({
  roomName,
  notes,
}: {
  roomName: string
  notes: {
    publicId: string
    date: Date
    body: string
  }[]
}) => {
  if (notes.length === 0) return null
  return (
    <div className="pdf new-page">
      <h2 className="pdf room-section-subtitle major-break title-spacing">
        {roomName}: Notes
      </h2>
      {notes.map((note) => (
        <div key={note.publicId}>
          <div>{format(new Date(note.date), 'LLLL	d, yyyy')}</div>
          <p className="pdf notes-body section-spacing">{note.body}</p>
        </div>
      ))}
    </div>
  )
}

export default Notes
