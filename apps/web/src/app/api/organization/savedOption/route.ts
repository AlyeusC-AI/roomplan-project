import createSavedOption from '@servicegeek/db/queries/organization/savedOption/createSavedOption'
import deleteSavedOption from '@servicegeek/db/queries/organization/savedOption/deleteSavedOption'
import getSavedOptions from '@servicegeek/db/queries/organization/savedOption/getSavedOptions'
import updateSavedOption from '@servicegeek/db/queries/organization/savedOption/updateSavedOption'
import { SavedOptionType } from '@servicegeek/db'
import { z } from 'zod'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const SavedOptionApiPatchBodySchema = z.object({
  publicId: z.string().uuid(),
  label: z.string(),
  value: z.string(),
})

export type SavedOptionApiPatchBody = z.infer<
  typeof SavedOptionApiPatchBodySchema
>

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  try {
    const body = SavedOptionApiPatchBodySchema.parse(await req.json())

    const result = await updateSavedOption(
      user.id,
      body.publicId,
      body.label,
      body.value
    )
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

const SavedOptionApiPostBodySchema = z.object({
  label: z.string(),
  type: z.string(), // enforce this is of type SavedOptionType
})

export type SavedOptionApiPostBody = z.infer<
  typeof SavedOptionApiPostBodySchema
>

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
    const body = SavedOptionApiPostBodySchema.parse(JSON.parse(await req.json()))

    const result = await createSavedOption(
      user.id,
      body.type as SavedOptionType,
      body.label
    )
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok', option: result.result }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

const SavedOptionApiDeleteBodySchema = z.object({
  publicId: z.string().uuid(),
})

export type SavedOptionApiDeleteBody = z.infer<
  typeof SavedOptionApiDeleteBodySchema
>

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  try {
    const body = SavedOptionApiDeleteBodySchema.parse(JSON.parse(await req.json()))
    const result = await deleteSavedOption(user.id, body.publicId)
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  try {
    const type = req.nextUrl.searchParams.get("type") as SavedOptionType
    if (Array.isArray(type) || !type) {
      return NextResponse.json({ status: 'failed', reason: 'invalid query param' }, { status: 400 })
    }
    const result = await getSavedOptions(user.id, type)
    if (!result || result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', options: result.result }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}