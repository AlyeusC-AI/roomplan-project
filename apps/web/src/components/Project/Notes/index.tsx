import NotesToolbar from "./NotesToolbar";
import RoomNoteList from "./RoomNoteList";

const Notes = () => {
  return (
    <div className="space-y-6">
      <NotesToolbar />
      <RoomNoteList />
    </div>
  );
};

export default Notes;
