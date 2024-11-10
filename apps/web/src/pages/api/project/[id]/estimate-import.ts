import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  StartDocumentAnalysisCommand,
  TextractClient,
} from '@aws-sdk/client-textract' // ES Modules import
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getUser from '@servicegeek/db/queries/user/getUser'
import { SubscriptionStatus } from '@servicegeek/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import formidable, { File as FormidableFile } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

const fs = require('fs').promises

export const config = {
  api: {
    bodyParser: false,
  },
}

const texttractClient = new TextractClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || '',
  },
})

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY || '',
  },
})

export { s3Client }

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!user || !session?.access_token) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    res.status(500).json({ status: 'trial_expired' })
    return
  }

  const servicegeekUser = await getUser(user.id)
  if (!servicegeekUser) {
    res.redirect('/register')
    return
  }
  if (!servicegeekUser.org?.organizationId) {
    res.redirect('/projects')
    return
  }
  const queryId = req.query.id

  if (Array.isArray(queryId) || !queryId) {
    res.status(500).json({ status: 'no query id' })
    return queryId
  }

  try {
    const file = await new Promise<FormidableFile>((resolve, reject) => {
      const form = new formidable.IncomingForm()
      let f: FormidableFile
      form.on('file', function (field, file) {
        f = file
      })
      form.on('end', () => resolve(f))
      form.on('error', (err) => reject(err))
      form.parse(req, () => {
        //
      })
    }).catch((e) => {
      console.log(e)
    })
    if (!file) {
      res.status(500).json({ status: 'failed' })
      return
    }
    const fsdata = await fs.readFile(file.filepath)
    const S3Object = {
      Bucket: 'estimateimports',
      Key: `${
        servicegeekUser.org?.organization.publicId
      }/${uuidv4()}-estimate.pdf`,
    }
    const bucketParams = {
      ...S3Object,
      Body: fsdata,
    }

    await s3Client.send(new PutObjectCommand(bucketParams))

    const command = new StartDocumentAnalysisCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: S3Object.Bucket,
          Name: S3Object.Key,
        },
      },
      FeatureTypes: ['FORMS'],
    })

    // @ts-ignore
    const { JobId } = await texttractClient.send(command)

    if (!JobId) {
      console.error('Failed to generate job id')
      res.status(500).json({ status: 'failed' })
      return
    }

    const qstashRes = await fetch(
      `${process.env.QSTASH_PUBLISH_URL}${process.env.IDENTISHOT_ESTIMATION_PROCESSING_URL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_AUTHORIZATION_TOKEN}`,
          'Upstash-Delay': '10s',
        },
        body: JSON.stringify({
          jobId: JobId,
          projectId: queryId,
        }),
      }
    )
    if (!qstashRes.ok) {
      console.error(qstashRes)
    }

    // const response = await client.send(command)
    // console.log(response)
    res.status(200).send('ok')
    // const data = await uploadFileToProject(user.id, queryId, file)
    // if (data) {
    //   res.status(200).json({ status: 'ok', key: data.Key })
    //   return
    // }
    // res.status(500).json({ status: 'failed' })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
