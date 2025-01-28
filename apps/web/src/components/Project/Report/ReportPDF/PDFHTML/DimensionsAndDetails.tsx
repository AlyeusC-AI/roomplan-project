import { Room } from "@servicegeek/db";

import PDFTableTd from "./PDFTable/PDFTableTd";
import PDFTableTh from "./PDFTable/PDFTableTh";

const DimensionsAndDetails = ({
  room,
  roomName,
}: {
  room: Room;
  roomName: string;
}) => (
  <div className='pdf new-page'>
    <h2 className='pdf room-section-subtitle major-break title-spacing'>
      {roomName}: Dimensions & Details
    </h2>
    {room.equipmentUsed.length > 0 && (
      <div className='mb-4'>
        <h4 className='mr-2'>Equipment Used:</h4>
        <ul className='ml-6 list-disc'>
          {room.equipmentUsed.map((e) => (
            <li className='list-item' key={e}>
              {e}
            </li>
          ))}
        </ul>
      </div>
    )}
    <table className='pdf room-section-dimensions-details-table'>
      <thead>
        <PDFTableTh>Description</PDFTableTh>
        <PDFTableTh>Value</PDFTableTh>
        <PDFTableTh>Unit</PDFTableTh>
      </thead>
      <tbody>
        <tr>
          <PDFTableTd>Length</PDFTableTd>
          <PDFTableTd>{room.length || "--"}</PDFTableTd>
          <PDFTableTd>ft</PDFTableTd>
        </tr>
        <tr>
          <PDFTableTd>Height</PDFTableTd>
          <PDFTableTd>{room.height || "--"}</PDFTableTd>
          <PDFTableTd>ft</PDFTableTd>
        </tr>
        <tr>
          <PDFTableTd>Width</PDFTableTd>
          <PDFTableTd>{room.width || "--"}</PDFTableTd>
          <PDFTableTd>ft</PDFTableTd>
        </tr>
        <tr>
          <PDFTableTd>Total Sqft</PDFTableTd>
          <PDFTableTd>{room.totalSqft || "--"}</PDFTableTd>
          <PDFTableTd>sqft</PDFTableTd>
        </tr>
        <tr>
          <PDFTableTd>Doors</PDFTableTd>
          <PDFTableTd>{room.doors || "--"}</PDFTableTd>
          <PDFTableTd>#</PDFTableTd>
        </tr>
        <tr>
          <PDFTableTd>Windows</PDFTableTd>
          <PDFTableTd>{room.windows || "--"}</PDFTableTd>
          <PDFTableTd>#</PDFTableTd>
        </tr>
      </tbody>
    </table>
  </div>
);

export default DimensionsAndDetails;
