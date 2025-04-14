import { format } from "date-fns";
import { useMemo } from "react";
import useSupabaseImage from "@utils/hooks/useSupabaseImage";

import PDFTableTd from "./PDFTable/PDFTableTd";
import PDFTableTh from "./PDFTable/PDFTableTh";
import PDFSafeImage from "./PDFSaveImage";

// Use the ExtendedWallItem type from the global declarations
// This is defined in apps/web/src/types/app.d.ts

// Component to display a reading image
const ReadingImage = ({ imageKey }: { imageKey: string }) => {
  const url = useMemo(() => {
    // This is important - we need to create a public URL for the reading images
    // which are stored in the readings-images bucket, not the project-images bucket
    if (!imageKey) return null;

    // Remove leading slash if present for consistent URL formatting
    const normalizedKey = imageKey.startsWith("/")
      ? imageKey.substring(1)
      : imageKey;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/readings-images/${normalizedKey}`;
  }, [imageKey]);

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
export const ImageGallery = ({
  images,
}: {
  images: { imageKey: string }[];
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className='my-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3'>
      {images.map((image) => (
        <ReadingImage imageKey={image.imageKey} />
      ))}
    </div>
  );
};

const Readings = ({
  room,
  roomReadings,
}: {
  room: any;
  roomReadings: ReadingsWithGenericReadings[];
}) => {
  const roomName = room.name;
  if (roomReadings.length === 0) return null;
  return (
    <div className='pdf new-page'>
      <h2 className='pdf room-section-subtitle major-break title-spacing'>
        {roomName}: Readings
      </h2>
      {roomReadings.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }).map((reading) => {
        // Create a type-safe version of the reading with all required properties
        const typedReading = reading as ReadingsWithGenericReadings & {
          wallName: string | null;
          floorName: string | null;
          extendedWalls: ExtendedWallItem[] | null;
        };

        // Filter wall and floor images
        const wallImages =
          reading.RoomReadingImage?.filter((img) => img.type === "wall") || [];
        const floorImages =
          reading.RoomReadingImage?.filter((img) => img.type === "floor") || [];

        // Helper function to get images for a specific extended wall/floor
        const getExtendedItemImages = (itemId: string) => {
          return (
            reading.RoomReadingImage?.filter((img) => img.type === itemId) || []
          );
        };

        return (
          <div key={reading.publicId} className='mb-8'>
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
                  <PDFTableTd>{reading.gpp || "--"}</PDFTableTd>
                  <PDFTableTd>gpp</PDFTableTd>
                </tr>
                <tr>
                  <PDFTableTd>
                    {room.wallName || "Wall Moisture Content"}
                  </PDFTableTd>
                  <PDFTableTd>{reading.moistureContentWall || "--"}</PDFTableTd>
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
                </tr>
              </tbody>
            </table>

            {/* Display wall images */}
            {wallImages.length > 0 && (
              <div className='mt-3'>
                <h3 className='text-md font-semibold'>
                  {room.wallName || "Wall"} Images
                </h3>
                <ImageGallery images={wallImages} />
              </div>
            )}

            {/* Display floor images */}
            {floorImages.length > 0 && (
              <div className='mt-3'>
                <h3 className='text-md font-semibold'>
                  {room.floorName || "Floor"} Images
                </h3>
                <ImageGallery images={floorImages} />
              </div>
            )}

            {/* Display extended walls and floors */}
            {typedReading.extendedWalls &&
              typedReading.extendedWalls.length > 0 && (
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
                      {typedReading.extendedWalls.map((item) => (
                        <tr key={item.id}>
                          <PDFTableTd>{item.name}</PDFTableTd>
                          <PDFTableTd>{item.value || "--"}</PDFTableTd>
                          <PDFTableTd>%</PDFTableTd>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Display extended wall/floor images */}
                  {typedReading.extendedWalls.map((item) => {
                    const itemImages = getExtendedItemImages(item.id);
                    if (itemImages.length === 0) return null;

                    return (
                      <div key={`${item.id}-images`} className='mt-3'>
                        <h3 className='text-md font-semibold'>
                          {item.name} Images
                        </h3>
                        <ImageGallery images={itemImages} />
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Display dehumidifier readings */}
            {reading.GenericRoomReading.map((genericRoomReading, index) => (
              <div
                className='mt-4 border-l-2 border-gray-300 pl-4'
                key={genericRoomReading.publicId}
              >
                <h3 className='text-md font-semibold'>
                  {genericRoomReading.type === "dehumidifer"
                    ? `Dehumidifier Reading #${index + 1}`
                    : ""}
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
                {genericRoomReading.GenericRoomReadingImage &&
                  genericRoomReading.GenericRoomReadingImage.length > 0 && (
                    <div className='mt-3'>
                      <h3 className='text-md font-semibold'>
                        Dehumidifier Images
                      </h3>
                      <ImageGallery
                        images={genericRoomReading.GenericRoomReadingImage}
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
