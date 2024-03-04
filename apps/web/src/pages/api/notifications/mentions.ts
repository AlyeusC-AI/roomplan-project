import { Novu } from '@novu/node'
import assert from 'assert'
import { NextApiRequest, NextApiResponse } from 'next'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { phoneNumbers, body, client, location } = JSON.parse(req.body)
  console.log('Processing body ', body)
  console.log('Processing phoneNumbers ', phoneNumbers)

  if (!phoneNumbers || !body) {
    return res.status(400).json({ error: 'phoneNumbers and body are required' })
  }
  // init nuvo
  const novuApiKey = process.env.NOVU_API_KEY
  assert(novuApiKey, 'NOVU_API_KEY is not defined')
  const novu = new Novu(novuApiKey)

  // const nuvo promises
  const nuvoPromises: Promise<any>[] = []

  const messageData = {
    client,
    location,
    message: Buffer.from(body.replaceAll("'", ''), 'utf-8').toString(),
  }

  const promises = phoneNumbers.map((phoneNumber: string, i: number) => {
    return novu.trigger('calendar-reminder', {
      to: {
        subscriberId: phoneNumber + i,
        phone: phoneNumber,
      },
      payload: {
        ...messageData,
      },
    })
  })

  nuvoPromises.push(...promises)

  try {
    if (nuvoPromises.length) {
      console.log(`sending ${nuvoPromises.length} sms triggers`)
      await Promise.all(nuvoPromises)
    } else {
      console.log('no sms triggers to send!')
    }

    return res
      .status(200)
      .json({ status: 'ok', result: 'notification ran successfully' })
  } catch (error) {
    console.error((error as Error).message)
    res.status(500).json({ error: (error as Error).message })
  } finally {
    res.end()
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
