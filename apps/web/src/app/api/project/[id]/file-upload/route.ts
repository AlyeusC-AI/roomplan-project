import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import uploadFileToProject from '@lib/supabase/uploadFileToProject'
import { SubscriptionStatus } from '@servicegeek/db'
import formidable, { File as FormidableFile } from 'formidable'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    return NextResponse.json({ status: 'trial_expired' }, { status: 500 })
  }

  const queryId = (await params).id

  if (Array.isArray(queryId) || !queryId) {
    return NextResponse.json({ status: 'failed', reason: 'invalid query param' }, { status: 400 })
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
      return NextResponse.json({ status: 'no file uploaded' }, { status: 500 })
    }
    const data = await uploadFileToProject(user.id, queryId, file)
    if (data) {
      return NextResponse.json(
        { status: 'ok', key: data.path },
        { status: 200 }
      )
    }

    return NextResponse.json({ status: 'failed' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
