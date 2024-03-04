import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import uploadFileToProject from '@lib/supabase/uploadFileToProject'
import { SubscriptionStatus } from '@restorationx/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import formidable, { File as FormidableFile } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    res.status(500).json({ status: 'trial_expired' })
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
    const data = await uploadFileToProject(user.id, queryId, file)
    if (data) {
      res.status(200).json({ status: 'ok', key: data.path })
      return
    }
    res.status(500).json({ status: 'failed' })
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
