import { ReactNode } from 'react'
import { format } from 'date-fns'
import { useRecoilState } from 'recoil'
import orgInfoState from '@atoms/orgInfoState'
import projectInfoState from '@atoms/projectInfoState'

import PDFSafeImage from './PDFSaveImage'
var parser = require('parse-address')

const SummaryDetail = ({ title, value }: { title: string; value: string }) => (
  <td style={{ textAlign: 'left', width: '50%' }}>
    <h3>{title}</h3>
    <p>{value}</p>
  </td>
)

const SummarySection = ({ children }: { children: ReactNode }) => (
  <table className="title-page-summary-section">
    <tbody>
      <tr>{children}</tr>
    </tbody>
  </table>
)

const getAddress = (parsedAddress: any) => {
  const { number, street, type } = parsedAddress
  const addressRowOne = `${number || ''} ${
    (street && street !== 'null') || ''
  }${type ? ` ${type || ''}` : ''}`
}

const TitlePage = () => {
  const [projectInfo] = useRecoilState(projectInfoState)
  const [orgInfo] = useRecoilState(orgInfoState)
  const parsedAddress = parser.parseLocation(orgInfo.address)
  let addressRowOne = ''
  if (parsedAddress) {
    const { number, street, type } = parsedAddress
    addressRowOne = `${number || ''} ${(street && street !== 'null') || ''}${
      type ? ` ${type || ''}` : ''
    }`
  }

  return (
    <div className="pdf first-page">
      <div>
        <table className="pdf invoice-info-container">
          <tbody>
            <tr>
              <td rowSpan={2} className="pdf client-name">
                {orgInfo.name}
              </td>
              <td></td>
            </tr>
            <tr>
              <td>{addressRowOne}</td>
            </tr>
            <tr>
              <td>
                Report Date:{' '}
                <strong>{format(Date.now(), 'LLLL	d, yyyy')}</strong>
              </td>
              <td>{`${parsedAddress.city || ''} ${parsedAddress.state || ''}${
                parsedAddress.zip ? `, ${parsedAddress.zip}` : ''
              }`}</td>
            </tr>
            <tr>
              <td></td>
              <td>{projectInfo.adjusterEmail}</td>
            </tr>
          </tbody>
        </table>

        <SummarySection>
          <SummaryDetail title="Client Name" value={projectInfo.clientName} />
          <SummaryDetail title="Address" value={projectInfo.location} />
        </SummarySection>
        <SummarySection>
          <SummaryDetail title="Type of Loss" value={projectInfo.lossType} />
          {projectInfo.lossType === 'Water' && (
            <SummaryDetail
              title="Category of Loss"
              value={`${projectInfo.catCode || ''}`}
            />
          )}
        </SummarySection>
        <SummarySection>
          <SummaryDetail
            title="Insurance Carrier"
            value={projectInfo.insuranceCompanyName}
          />
          <SummaryDetail
            title="Claim ID"
            value={projectInfo.insuranceClaimId}
          />
        </SummarySection>
        <SummarySection>
          <SummaryDetail
            title="Adjuster Name"
            value={projectInfo.adjusterName}
          />
          <SummaryDetail
            title="Adjuster Email"
            value={projectInfo.adjusterEmail}
          />
        </SummarySection>
      </div>
    </div>
  )
}

export default TitlePage
