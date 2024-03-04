import { AreaAffected } from '@restorationx/db'

import PDFTableTd from './PDFTable/PDFTableTd'
import PDFTableTh from './PDFTable/PDFTableTh'

const AffectedAreas = ({
  roomName,
  areasAffected,
}: {
  roomName: string
  areasAffected: AreaAffected[]
}) => {
  if (areasAffected.length === 0) return null
  return (
    <div className="pdf new-page">
      <h2 className="pdf room-section-subtitle subtitle-spacing minor-break">
        {roomName}: Affected Areas
      </h2>
      {areasAffected.map((affectedArea) => (
        <div key={affectedArea.publicId}>
          <h4 className="pdf room-section-minortitle minor-break title-spacing">
            {affectedArea.type}
          </h4>
          <table className="pdf room-section-dimensions-details-table">
            <thead>
              <PDFTableTh>Description</PDFTableTh>
              <PDFTableTh>Value</PDFTableTh>
              <PDFTableTh>Unit</PDFTableTh>
            </thead>
            <tbody>
              <tr>
                <PDFTableTd>Total Area Removed</PDFTableTd>
                <PDFTableTd>{affectedArea.totalAreaRemoved || '--'}</PDFTableTd>
                <PDFTableTd>sqft</PDFTableTd>
              </tr>
              <tr>
                <PDFTableTd>Total Area Anti-Microbial Applied</PDFTableTd>
                <PDFTableTd>
                  {affectedArea.totalAreaMicrobialApplied || '--'}
                </PDFTableTd>
                <PDFTableTd>sqft</PDFTableTd>
              </tr>
              {affectedArea.type !== 'ceiling' && (
                <tr>
                  <PDFTableTd>Wall Material</PDFTableTd>
                  <PDFTableTd>{affectedArea.material || '--'}</PDFTableTd>
                  <PDFTableTd>--</PDFTableTd>
                </tr>
              )}
              {affectedArea.type === 'wall' && (
                <tr>
                  <PDFTableTd>Cabinetry Removed</PDFTableTd>
                  <PDFTableTd>
                    {affectedArea.cabinetryRemoved || '--'}
                  </PDFTableTd>
                  <PDFTableTd>--</PDFTableTd>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export default AffectedAreas
