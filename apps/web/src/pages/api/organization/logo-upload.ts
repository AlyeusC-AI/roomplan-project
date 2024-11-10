import getUser from '@servicegeek/db/queries/user/getUser'
import { prisma } from '@servicegeek/db'

import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { AccessLevel } from '@servicegeek/db'
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

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const servicegeekUser = await getUser(user.id)
  const organizationId = servicegeekUser?.org?.organization.id
  if (!organizationId) {
    res.status(500).json({ status: 'failed' })
    return
  }

  if (
    !(
      servicegeekUser.org?.accessLevel === AccessLevel.admin ||
      servicegeekUser.org?.accessLevel === AccessLevel.accountManager
    )
  ) {
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
      console.error('no file')
      res.status(500).json({ status: 'failed' })
      return
    }
    const fsdata = await fs.readFile(file.filepath)
    const imageBuffer = Buffer.from(fsdata)

    const logoId = uuidv4()

    const { data, error } = await supabaseServiceRole.storage
      .from('org-pictures')
      .upload(
        `${servicegeekUser.org.organization.publicId}/${logoId}.png`,
        imageBuffer,
        {
          cacheControl: '3600',
          upsert: true,
        }
      )

    await prisma.organization.update({
      where: {
        id: servicegeekUser.org.organizationId,
      },
      data: {
        logoId,
      },
    })

    console.log('Upload data', data)
    if (data) {
      res.status(200).json({ status: 'ok', id: logoId })
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

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
