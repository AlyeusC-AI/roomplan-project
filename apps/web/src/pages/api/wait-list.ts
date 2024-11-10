import addToWaitlist from '@servicegeek/db/queries/wait-list/addToWaitlist'
import { NextApiRequest, NextApiResponse } from 'next'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body)

  try {
    try {
      const { email } = body
      await addToWaitlist(email)
    } catch (error) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok' })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
