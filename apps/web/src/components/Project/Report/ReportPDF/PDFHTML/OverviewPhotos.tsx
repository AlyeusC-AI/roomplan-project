import { useMemo } from "react";

import PDFSafeImage from "./PDFSaveImage";

const OverviewPhoto = ({ imageKey }: { imageKey: string }) => {
  const url = imageKey;
  if (!url) return null;
  return (
    <div className='image-div'>
      <PDFSafeImage
        url={url}
        alt={`Overview photo`}
        className='h-full w-full'
      />
    </div>
  );
};

const PhotoNote = ({
  notes,
}: {
  notes: Array<{ id: string; body: string }>;
}) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className='photo-note'>
      {notes.map((note) => (
        <div key={note.id} className='note-content'>
          {note.body}
        </div>
      ))}
    </div>
  );
};

const OverviewPhotos = ({ room }: { room: RoomWithReadings }) => {
  const selectedPhotos = useMemo(
    () => room.Inference.filter((i) => i.Image?.includeInReport),
    [room.Inference]
  );

  // Group photos into rows of 3
  const photoRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < selectedPhotos.length; i += 3) {
      rows.push(selectedPhotos.slice(i, i + 3));
    }
    return rows;
  }, [selectedPhotos]);
  console.log("🚀 ~ photoRows ~ photoRows:", photoRows);

  return (
    <>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        Overview Photos
      </h2>
      <div className='photo-grid'>
        {selectedPhotos.length === 0 && <p>No photos of this room</p>}
        {photoRows.map((row, rowIndex) => (
          <div key={rowIndex} className='photo-row'>
            {row.map((inference) => (
              <div key={inference.imageKey} className='photo-item'>
                <OverviewPhoto imageKey={inference.imageKey!} />
                <PhotoNote notes={inference.Image?.ImageNote} />
              </div>
            ))}
            {/* Add empty items to maintain grid if row has less than 3 items */}
            {row.length < 3 &&
              Array(3 - row.length)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className='photo-item photo-item-empty'
                  />
                ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default OverviewPhotos;
