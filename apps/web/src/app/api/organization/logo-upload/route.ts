import getUser from '@servicegeek/db/queries/user/getUser'
import { prisma } from '@servicegeek/db'

import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { AccessLevel } from '@servicegeek/db'
import formidable, { File as FormidableFile } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const fs = require('fs').promises

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  const supabaseClient = await createClient()
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  const servicegeekUser = await getUser(user.id)
  const organizationId = servicegeekUser?.org?.organization.id
  if (!organizationId) {
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  if (
    !(
      servicegeekUser.org?.accessLevel === AccessLevel.admin ||
      servicegeekUser.org?.accessLevel === AccessLevel.accountManager
    )
  ) {
    return NextResponse.json({ status: 'failed' }, { status: 500 })
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
    }).catch((e) => {
      console.log(e)
    })
    if (!file) {
      console.error('no file')
      return NextResponse.json({ status: 'failed' }, { status: 500 })
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
      return NextResponse.json({ status: 'ok', id: logoId }, { status: 200 })
    }
    console.error(error)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}