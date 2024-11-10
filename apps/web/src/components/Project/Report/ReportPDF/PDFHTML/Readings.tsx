import { GenericRoomReading, RoomReading } from '@servicegeek/db'
import { format } from 'date-fns'

import PDFTableTd from './PDFTable/PDFTableTd'
import PDFTableTh from './PDFTable/PDFTableTh'

const Readings = ({
  roomName,
  roomReadings,
}: {
  roomName: string
  roomReadings: (RoomReading & {
    genericRoomReadings: GenericRoomReading[]
  })[]
}) => {
  if (roomReadings.length === 0) return null
  return (
    <div className="pdf new-page">
      <h2 className="pdf room-section-subtitle major-break title-spacing">
        {roomName}: Readings
      </h2>
      {roomReadings.map((reading) => (
        <div key={reading.publicId} className="mb-8">
          <div className="text-lg font-bold">
            {format(new Date(reading.date), 'LLLL	d, yyyy')}
          </div>
          <table className="pdf room-section-dimensions-details-table section-spacing ">
            <thead>
              <PDFTableTh>Description</PDFTableTh>
              <PDFTableTh>Value</PDFTableTh>
              <PDFTableTh>Unit</PDFTableTh>
            </thead>
            <tbody>
              <tr>
                <PDFTableTd>Temperature</PDFTableTd>
                <PDFTableTd>{reading.temperature || '--'}</PDFTableTd>
                <PDFTableTd>&#8457;</PDFTableTd>
              </tr>
              <tr>
                <PDFTableTd>Relative Humidity</PDFTableTd>
                <PDFTableTd>{reading.humidity || '--'}</PDFTableTd>
                <PDFTableTd>RH</PDFTableTd>
              </tr>
              <tr>
                <PDFTableTd>GPP</PDFTableTd>
                <PDFTableTd>{reading.gpp || '--'}</PDFTableTd>
                <PDFTableTd>gpp</PDFTableTd>
              </tr>
              <tr>
                <PDFTableTd>Wall Moisture Content</PDFTableTd>
                <PDFTableTd>{reading.moistureContentWall || '--'}</PDFTableTd>
                <PDFTableTd>%</PDFTableTd>
              </tr>
              <tr>
                <PDFTableTd>Floor Moisture Content</PDFTableTd>
                <PDFTableTd>{reading.moistureContentFloor || '--'}</PDFTableTd>
                <PDFTableTd>%</PDFTableTd>
              </tr>
            </tbody>
          </table>
          {reading.genericRoomReadings.map((genericRoomReading, index) => (
            <div
              className="mt-4 border-l-2 border-gray-300 pl-4"
              key={genericRoomReading.publicId}
            >
              <h3>
                {genericRoomReading.type === 'dehumidifer'
                  ? `Dehumidifier Reading #${index + 1}`
                  : ''}
              </h3>
              <table className="pdf room-section-dimensions-details-table section-spacing">
                <thead>
                  <PDFTableTh>Description</PDFTableTh>
                  <PDFTableTh>Value</PDFTableTh>
                  <PDFTableTh>Unit</PDFTableTh>
                </thead>
                <tbody>
                  <tr>
                    <PDFTableTd>Dehu Reading</PDFTableTd>
                    <PDFTableTd>{genericRoomReading.value || '--'}</PDFTableTd>
                    <PDFTableTd>Each</PDFTableTd>
                  </tr>
                  <tr>
                    <PDFTableTd>Temperature</PDFTableTd>
                    <PDFTableTd>
                      {genericRoomReading.temperature || '--'}
                    </PDFTableTd>
                    <PDFTableTd>&#8457;</PDFTableTd>
                  </tr>
                  <tr>
                    <PDFTableTd>Relative Humidity</PDFTableTd>
                    <PDFTableTd>
                      {genericRoomReading.humidity || '--'}
                    </PDFTableTd>
                    <PDFTableTd>TH</PDFTableTd>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Readings
