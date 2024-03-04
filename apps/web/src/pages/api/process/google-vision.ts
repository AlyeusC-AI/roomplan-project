import { withApiAuth } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleCreate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate?alt=json&key=' +
        process.env.GOOGLE_VISION_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                source: {
                  imageUri: req.body.imageUri,
                },
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      }
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default withApiAuth(async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handleCreate(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
})
