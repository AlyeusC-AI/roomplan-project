import { useMemo } from "react";
import { ProjectReportData } from "@atoms/project-report";
import useSupabaseImage from "@utils/hooks/useSupabaseImage";

import PDFSafeImage from "./PDFSaveImage";

const OverviewPhoto = ({ imageKey }: { imageKey: string }) => {
  const url = useSupabaseImage(imageKey);
  if (!url) return null;
  return (
    <div className='image-div'>
      <PDFSafeImage url={url} />
    </div>
  );
};

const OverviewPhotos = ({ room }: { room: ProjectReportData["rooms"][0] }) => {
  const selectedPhotos = useMemo(
    () => room.inferences.filter((i) => i.image.includeInReport),
    [room.inferences]
  );

  return (
    <>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        Overview Photos
      </h2>
      <div className='grid grid-cols-3 gap-3'>
        {selectedPhotos.length === 0 && <p>No photos of this room</p>}
        {selectedPhotos.map((inference) => {
          return (
            <OverviewPhoto
              key={inference.imageKey}
              imageKey={inference.imageKey}
            />
          );
        })}
      </div>
    </>
  );
};

export default OverviewPhotos;
