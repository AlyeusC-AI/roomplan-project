import { verifySignature } from '@upstash/qstash/nextjs'
import { TextractDocument } from 'amazon-textract-response-parser'
import { NextApiRequest, NextApiResponse } from 'next'

const {
  TextractClient,
  GetDocumentAnalysisCommand,
} = require('@aws-sdk/client-textract')

const textract = new TextractClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || '',
  },
})

// TODO HANDLE NextToken
async function getJobsFromTextract(JobId: string) {
  const params = { JobId }

  // if (NextToken) params.NextToken = NextToken;

  const command = new GetDocumentAnalysisCommand(params)

  try {
    return await textract.send(command)
  } catch (err) {
    // Handle error
    console.log('ERR', err)
    return err
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { jobId } = JSON.parse(req.body)
  console.log('Requesting job: ', jobId)
  const jobData = await getJobsFromTextract(jobId)
  const parsed = new TextractDocument(jobData)
  console.log('Parsed', parsed)
  // console.log('Got data', jobData)
  res.status(200).send('ok')
}

async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}

export default verifySignature(Route)

export const config = {
  api: {
    bodyParser: false,
  },
}
