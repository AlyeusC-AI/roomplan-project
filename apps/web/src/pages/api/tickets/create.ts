import { NextApiRequest, NextApiResponse } from 'next'
const hubspot = require('@hubspot/api-client')
const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_API_KEY,
})

export interface HubspotTicket {
  hs_pipeline: string
  hs_pipeline_stage: string
  hs_ticket_priority: string
  subject: string
  client_address: string
  subscription_status: string
  report_type: string
  customer_name: string
  customer_email: string
  support_email: string
  project_id: string
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  const deserilizedBody = JSON.parse(body)

  const {
    project,
    client_address,
    customer_name,
    subscription_status,
    support_email,
    customer_email,
    report_type,
  } = deserilizedBody

  const properties = {
    hs_pipeline: '29443907',
    hs_pipeline_stage: '67521057',
    hs_ticket_priority: 'HIGH',
    subject: client_address,
    client_address: client_address || '',
    subscription_status: subscription_status || '',
    report_type: report_type || '',
    support_email: support_email || '',
    customer_email: customer_email || '',
    customer_name: customer_name || '',
    project_id: project || '',
  }

  const SimplePublicObjectInputForCreate = {
    properties,
  }

  //console.log('request', SimplePublicObjectInputForCreate)
  try {
    const apiResponse = await hubspotClient.crm.tickets.basicApi.create(
      SimplePublicObjectInputForCreate
    )
    console.log(JSON.stringify(apiResponse, null, 2))
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
  res.status(200).json({ status: 'ok' })
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
