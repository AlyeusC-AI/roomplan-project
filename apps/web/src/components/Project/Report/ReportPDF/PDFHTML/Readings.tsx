import { format } from "date-fns";
import { useMemo } from "react";

import PDFTableTd from "./PDFTable/PDFTableTd";
import PDFTableTh from "./PDFTable/PDFTableTh";
import PDFSafeImage from "./PDFSaveImage";
import {
  calculateGPP,
  Room,
  useGetRoomReadings,
} from "@service-geek/api-client";

// Use the ExtendedWallItem type from the global declarations
// This is defined in apps/web/src/types/app.d.ts

// Component to display a reading image
const ReadingImage = ({ url }: { url: string }) => {
  if (!url) return null;

  return (
    <PDFSafeImage
      url={url}
      alt='Reading image'
      className='h-48 w-full max-w-[400px] object-contain'
    />
  );
};

// Component to display a group of images
export const ImageGallery = ({ images }: { images: { url: string }[] }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className='my-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3'>
      {images.map((image) => (
        <ReadingImage url={image.url} />
      ))}
    </div>
  );
};

const Readings = ({ room }: { room: Room }) => {
  const roomName = room.name;
  const { data: roomReadingsData } = useGetRoomReadings(room.id);

  const roomReadings = roomReadingsData?.data || [];

  if (!roomReadings || roomReadings.length === 0) return null;

  return (
    <div className='pdf new-page'>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        {roomName}: Readings
      </h2>
      {roomReadings
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        .map((reading) => {
          // Create a type-safe version of the reading with all required properties
          const typedReading = reading;

          // Calculate GPP if temperature and humidity are available
          const calculatedGPP = calculateGPP(
            reading.temperature,
            reading.humidity
          );
          const displayGPP = calculatedGPP ? calculatedGPP : "--";

          // Filter wall and floor images
          // const wallImages =
          //   reading.wallReadings?.filter(
          //     (img) =>
          //       room.walls.find((w) => w.id === img.wallId)?.type === "WALL"
          //   ) || [];
          // const floorImages =
          //   reading.wallReadings?.filter(
          //     (img) =>
          //       room.walls.find((w) => w.id === img.wallId)?.type === "FLOOR"
          //   ) || [];

          // Helper function to get images for a specific extended wall/floor

          return (
            <div key={reading.id} className='mb-8'>
              <div className='text-lg font-bold'>
                {format(new Date(reading.date), "LLLL	d, yyyy")}
              </div>
              <table className='pdf room-section-dimensions-details-table section-spacing'>
                <thead>
                  <tr>
                    <PDFTableTh>Description</PDFTableTh>
                    <PDFTableTh>Value</PDFTableTh>
                    <PDFTableTh>Unit</PDFTableTh>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <PDFTableTd>Temperature</PDFTableTd>
                    <PDFTableTd>{reading.temperature || "--"}</PDFTableTd>
                    <PDFTableTd>&#8457;</PDFTableTd>
                  </tr>
                  <tr>
                    <PDFTableTd>Relative Humidity</PDFTableTd>
                    <PDFTableTd>{reading.humidity || "--"}</PDFTableTd>
                    <PDFTableTd>RH</PDFTableTd>
                  </tr>
                  <tr>
                    <PDFTableTd>GPP</PDFTableTd>
                    <PDFTableTd>{displayGPP}</PDFTableTd>
                    <PDFTableTd>gpp</PDFTableTd>
                  </tr>
                  {/* <tr>
                    <PDFTableTd>
                      {room.wallName || "Wall Moisture Content"}
                    </PDFTableTd>
                    <PDFTableTd>
                      {reading.moistureContentWall || "--"}
                    </PDFTableTd>
                    <PDFTableTd>%</PDFTableTd>
                  </tr>
                  <tr>
                    <PDFTableTd>
                      {room.floorName || "Floor Moisture Content"}
                    </PDFTableTd>
                    <PDFTableTd>
                      {reading.moistureContentFloor || "--"}
                    </PDFTableTd>
                    <PDFTableTd>%</PDFTableTd>
                  </tr> */}
                </tbody>
              </table>

              {/* Display wall images */}
              {/* {wallImages.length > 0 && (
                <div className='mt-3'>
                  <h3 className='text-md font-semibold'>
                    {room.wallName || "Wall"} Images
                  </h3>
                  <ImageGallery images={wallImages} />
                </div>
              )} */}

              {/* Display floor images */}
              {/* {floorImages.length > 0 && (
                <div className='mt-3'>
                  <h3 className='text-md font-semibold'>
                    {room.floorName || "Floor"} Images
                  </h3>
                  <ImageGallery images={floorImages} />
                </div>
              )} */}

              {/* Display extended walls and floors */}
              {typedReading.wallReadings &&
                typedReading.wallReadings.length > 0 && (
                  <div className='mt-4'>
                    <h3 className='text-md font-semibold'>
                      Additional Measurements
                    </h3>
                    <table className='pdf room-section-dimensions-details-table section-spacing'>
                      <thead>
                        <tr>
                          <PDFTableTh>Description</PDFTableTh>
                          <PDFTableTh>Value</PDFTableTh>
                          <PDFTableTh>Unit</PDFTableTh>
                        </tr>
                      </thead>
                      <tbody>
                        {typedReading?.wallReadings?.map((item) => (
                          <tr key={item.id}>
                            <PDFTableTd>
                              {room.walls.find((w) => w.id === item.wallId)
                                ?.name || "--"}
                            </PDFTableTd>
                            <PDFTableTd>{item.reading || "--"}</PDFTableTd>
                            <PDFTableTd>%</PDFTableTd>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Display extended wall/floor images */}
                    {typedReading.wallReadings.map((item) => {
                      const itemImages = item.images;
                      if (!itemImages || itemImages.length === 0) return null;

                      return (
                        <div key={`${item.id}-images`} className='mt-3'>
                          <h3 className='text-md font-semibold'>
                            {room.walls.find((w) => w.id === item.wallId)
                              ?.name || "--"}{" "}
                            Images
                          </h3>
                          <ImageGallery
                            images={itemImages.map((image) => ({ url: image }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Display dehumidifier readings */}
              {reading.genericRoomReading?.map((genericRoomReading, index) => (
                <div
                  className='mt-4 border-l-2 border-gray-300 pl-4'
                  key={genericRoomReading.id}
                >
                  <h3 className='text-md font-semibold'>
                    {`Dehumidifier Reading #${index + 1}`}
                  </h3>
                  <table className='pdf room-section-dimensions-details-table section-spacing'>
                    <thead>
                      <tr>
                        <PDFTableTh>Description</PDFTableTh>
                        <PDFTableTh>Value</PDFTableTh>
                        <PDFTableTh>Unit</PDFTableTh>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <PDFTableTd>Dehu Reading</PDFTableTd>
                        <PDFTableTd>
                          {genericRoomReading.value || "--"}
                        </PDFTableTd>
                        <PDFTableTd>Each</PDFTableTd>
                      </tr>
                      <tr>
                        <PDFTableTd>Temperature</PDFTableTd>
                        <PDFTableTd>
                          {genericRoomReading.temperature || "--"}
                        </PDFTableTd>
                        <PDFTableTd>&#8457;</PDFTableTd>
                      </tr>
                      <tr>
                        <PDFTableTd>Relative Humidity</PDFTableTd>
                        <PDFTableTd>
                          {genericRoomReading.humidity || "--"}
                        </PDFTableTd>
                        <PDFTableTd>RH</PDFTableTd>
                      </tr>
                    </tbody>
                  </table>

                  {/* Display dehumidifier images */}
                  {genericRoomReading.images &&
                    genericRoomReading.images.length > 0 && (
                      <div className='mt-3'>
                        <h3 className='text-md font-semibold'>
                          Dehumidifier Images
                        </h3>
                        <ImageGallery
                          images={genericRoomReading.images.map((image) => ({
                            url: image,
                          }))}
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );
};

export default Readings;
