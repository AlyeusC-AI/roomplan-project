import { useMediaQuery } from "react-responsive";
import { GroupByViews, PhotoViews } from "@servicegeek/db";

import MitigationTable from "./MitigationTable";
import MitigationToolbar from "./MitigationToolbar";
import Mobile from "./Mobile";

const ResponsiveWrapper = ({
  initialGroupView,
  initialPhotoView,
}: {
  initialGroupView: GroupByViews;
  initialPhotoView: PhotoViews;
}) => {
  const isMobile = useMediaQuery({ maxWidth: 600 });

  return (
    <>
      {isMobile ? (
        <Mobile />
      ) : (
        <>
          <MitigationToolbar />
          <MitigationTable
            initialGroupView={initialGroupView}
            initialPhotoView={initialPhotoView}
          />
        </>
      )}
    </>
  );
};

export default ResponsiveWrapper;
