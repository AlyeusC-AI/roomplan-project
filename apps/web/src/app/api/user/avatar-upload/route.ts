import { createClient } from '@lib/supabase/server'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import formidable, { File as FormidableFile } from 'formidable'
import { NextRequest, NextResponse } from 'next/server'
const fs = require('fs').promises

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
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
      return NextResponse.json({ status: 'failed' }, { status: 500 })
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
        return NextResponse.json({ status: 'failed download' }, { status: 500 })
      }

      return NextResponse.json({ status: 'ok', url: downData?.signedUrl }, { status: 500 })
    }
    console.error(error)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

