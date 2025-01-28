import { orgStore } from "@atoms/organization";
import { projectReportStore } from "@atoms/project-report";

import AffectedAreas from "./AffectedAreas";
import DimensionsAndDetails from "./DimensionsAndDetails";
import LogoContainer from "./LogoContainer";
import Notes from "./Notes";
import OverviewPhotos from "./OverviewPhotos";
import PageCount from "./PageCount";
import Readings from "./Readings";
import TitlePage from "./TitlePage";
import WeatherReporting from "./WeatherReporting";

const PDFHTML = () => {
  const orgInfo = orgStore((state) => state.organization);
  const projectReportData = projectReportStore(
    (state) => state.projectReportData
  );

  return (
    <div className='flex'>
      <div className='pdf-root w-[800px]'>
        <div id='pdf-root'>
          <div className='pdf pdf-reset'>
            <PageCount />

            {orgInfo?.logoId && (
              <LogoContainer
                logoId={orgInfo.logoId}
                publicId={orgInfo.publicId}
              />
            )}
            <TitlePage />
            <WeatherReporting />

            {projectReportData?.rooms.map((room) => (
              <div key={room.publicId} className='pdf'>
                <div className='pdf new-page'>
                  <h2 className='pdf room-section-title'>{room.name}</h2>
                  <OverviewPhotos room={room} />
                </div>
                <DimensionsAndDetails roomName={room.name} room={room} />
                <AffectedAreas
                  roomName={room.name}
                  areasAffected={room.areasAffected}
                />
                <Readings
                  roomName={room.name}
                  roomReadings={room.roomReadings}
                />
                <Notes roomName={room.name} notes={room.notes} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFHTML;
