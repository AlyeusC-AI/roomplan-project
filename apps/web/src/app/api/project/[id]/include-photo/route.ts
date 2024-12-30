import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import { prisma } from '@servicegeek/db'

import { SubscriptionStatus } from '@servicegeek/db'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }

  try {
    const { includeInReport, inferencePublicId } = await req.json()
    const project = await prisma.project.findFirst({
      where: {
        publicId: queryId,
      },
    })
    if (!project) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    const image = await prisma.image.findFirst({
      where: {
        projectId: project.id,
        inference: {
          publicId: inferencePublicId,
        },
      },
    })
    if (!image) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    await prisma.image.update({
      where: {
        id: image.id,
      },
      data: {
        includeInReport,
      },
    })

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
