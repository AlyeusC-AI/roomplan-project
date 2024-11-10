import createSavedOption from '@servicegeek/db/queries/organization/savedOption/createSavedOption'
import deleteSavedOption from '@servicegeek/db/queries/organization/savedOption/deleteSavedOption'
import getSavedOptions from '@servicegeek/db/queries/organization/savedOption/getSavedOptions'
import updateSavedOption from '@servicegeek/db/queries/organization/savedOption/updateSavedOption'
import { SavedOptionType } from '@servicegeek/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

const SavedOptionApiPatchBodySchema = z.object({
  publicId: z.string().uuid(),
  label: z.string(),
  value: z.string(),
})

export type SavedOptionApiPatchBody = z.infer<
  typeof SavedOptionApiPatchBodySchema
>

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const body = SavedOptionApiPatchBodySchema.parse(JSON.parse(req.body))

    const result = await updateSavedOption(
      user.id,
      body.publicId,
      body.label,
      body.value
    )
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok', result })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const SavedOptionApiPostBodySchema = z.object({
  label: z.string(),
  type: z.string(), // enforce this is of type SavedOptionType
})

export type SavedOptionApiPostBody = z.infer<
  typeof SavedOptionApiPostBodySchema
>

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
    const body = SavedOptionApiPostBodySchema.parse(JSON.parse(req.body))

    const result = await createSavedOption(
      user.id,
      body.type as SavedOptionType,
      body.label
    )
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok', option: result })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const SavedOptionApiDeleteBodySchema = z.object({
  publicId: z.string().uuid(),
})

export type SavedOptionApiDeleteBody = z.infer<
  typeof SavedOptionApiDeleteBodySchema
>

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const body = SavedOptionApiDeleteBodySchema.parse(JSON.parse(req.body))
    const result = await deleteSavedOption(user.id, body.publicId)
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
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

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const type = req.query.type as SavedOptionType
    if (Array.isArray(type) || !type) {
      res.status(400).json({ status: 'failed', reason: 'invalid query param' })
      return
    }
    const result = await getSavedOptions(user.id, type)
    // @ts-expect-error
    if (!result || result?.failed) {
      console.log(result)
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok', options: result })
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
  if (req.method === 'PATCH') await handlePatch(req, res)
  else if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
