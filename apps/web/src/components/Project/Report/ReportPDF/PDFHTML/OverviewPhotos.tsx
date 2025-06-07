import { useMemo } from "react";

import PDFSafeImage from "./PDFSaveImage";
import { Comment, Room } from "@service-geek/api-client";

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

const PhotoNote = ({ notes }: { notes: Comment[] }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className='photo-note'>
      {notes.map((note) => (
        <div key={note.id} className='note-content'>
          {note.content}
        </div>
      ))}
    </div>
  );
};

const OverviewPhotos = ({ room }: { room: Room }) => {
  const selectedPhotos = useMemo(
    () => room.images.filter((i) => i.showInReport),
    [room.images]
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
            {row.map((image) => (
              <div key={image.id} className='photo-item'>
                <OverviewPhoto imageKey={image.url!} />
                <PhotoNote notes={image.comments || []} />
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
