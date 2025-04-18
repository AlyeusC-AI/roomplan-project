import { orgStore } from "@atoms/organization";
import { roomStore } from "@atoms/room";
import { reportSettingsStore } from "@atoms/report-settings";
import Script from "next/script";

import AffectedAreas from "./AffectedAreas";
import DimensionsAndDetails from "./DimensionsAndDetails";
import LogoContainer from "./LogoContainer";
import Notes from "./Notes";
import OverviewPhotos from "./OverviewPhotos";
import PageCount from "./PageCount";
import Readings from "./Readings";
import TitlePage from "./TitlePage";
import WeatherReporting from "./WeatherReporting";
// import ReportSettingsPanel from "./ReportSettingsPanel";

import "@/styles/shared-pdf-styles.css";
import "@/styles/unshared-pdf-styles.css";

const PDFHTML = () => {
  const rooms = roomStore((state) => state.rooms);
  const {
    showTitlePage,
    showWeatherReporting,
    showDimensionsAndDetails,
    showOverviewPhotos,
    showReadings,
    showNotes,
    showAffectedAreas,
  } = reportSettingsStore();

  return (
    <div className='flex'>
      <Script
        src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        integrity='sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=='
        crossOrigin='anonymous'
        referrerPolicy='no-referrer'
      />
      <div className='pdf-root w-[800px]'>
        <div id='pdf-root'>
          <div className='pdf pdf-reset'>
            <PageCount />

            {/* <LogoContainer publicId={orgInfo!.publicId} /> */}
            {showTitlePage && <TitlePage />}
            {showWeatherReporting && <WeatherReporting />}

            {rooms.map((room) => (
              <div key={room.publicId} className='pdf'>
                <div className='pdf new-page'>
                  <h2 className='pdf room-section-title'>{room.name}</h2>
                  {showOverviewPhotos && <OverviewPhotos room={room} />}
                </div>
                {showDimensionsAndDetails && (
                  <>
                    <DimensionsAndDetails roomName={room.name} room={room} />
                    {showAffectedAreas && (
                      <AffectedAreas
                        roomName={room.name}
                        areasAffected={room.AreaAffected}
                      />
                    )}
                  </>
                )}
            
                {showReadings && <Readings room={room} roomReadings={room.RoomReading} />}
                {showNotes && <Notes roomName={room.name} notes={room.Notes} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFHTML;
