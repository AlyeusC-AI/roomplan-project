import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import formidable, { File as FormidableFile } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
const fs = require('fs').promises

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
    const imageBuffer = Buffer.from(fsdata)

    const { data, error } = await supabaseServiceRole.storage
      .from('profile-pictures')
      .upload(`${user.id}/avatar.png`, imageBuffer, {
        cacheControl: '3600',
        upsert: true,
      })

    if (data) {
      const { data: downData, error: downError } =
        await supabaseServiceRole.storage
          .from('profile-pictures')
          .createSignedUrl(`${user.id}/avatar.png`, 3600)
      if (!downData || downError) {
        console.error('Down fail')
        res.status(500).json({ status: 'failed download' })
        return
      }
      res.status(200).json({ status: 'ok', url: downData?.signedUrl })
      return
    }
    console.error(error)
    res.status(500).json({ status: 'failed' })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function UnprotectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
