import createCalendarEvent from '@servicegeek/db/queries/calendar-event/createCalendarEvent'
import deleteCalendarEvent from '@servicegeek/db/queries/calendar-event/deleteCalendarEvent'
import getCalendarEvents from '@servicegeek/db/queries/calendar-event/getCalendarEvents'
import updateCalendarEvent from '@servicegeek/db/queries/calendar-event/updateCalendarEvent'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

export type CalendarEventPostBody = {
  subject: string
  payload: string
  remindProjectOwners: boolean
  date: number
  reminderDate: number
  remindClient: boolean
  localizedTimeString: string
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
  const body = JSON.parse(req.body)
  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const {
      subject,
      payload,
      remindProjectOwners,
      remindClient,
      date,
      reminderDate,
      localizedTimeString,
    } = body as CalendarEventPostBody

    const calendarEvent = await createCalendarEvent({
      userId: user.id,
      projectId,
      data: {
        subject,
        payload,
        remindProjectOwners: remindProjectOwners || false,
        remindClient: remindClient || false,
        date, // in unix time
        reminderDate: reminderDate, // in unix time,
        localizedTimeString,
      },
    })
    if (!calendarEvent) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({
      status: 'ok',
      calendarEvent: {
        publicId: calendarEvent.publicId,
      },
    })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export type CalendarEventPatchBody = {
  projectId: string
  calendarEventPublicId: string
  subject?: string
  payload?: string
  remindProjectOwners?: boolean
  date?: number
  reminderDate?: number
  remindClient?: boolean
  localizedTimeString: string
}

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
  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  const body = JSON.parse(req.body)

  try {
    const {
      subject,
      payload,
      remindProjectOwners,
      remindClient,
      date,
      reminderDate,
      calendarEventPublicId,
      localizedTimeString,
    } = body as CalendarEventPatchBody

    await updateCalendarEvent({
      userId: user.id,
      projectId,
      data: {
        calendarEventPublicId,
        subject,
        payload,
        remindProjectOwners,
        remindClient,
        date: date, // in unix time
        reminderDate: reminderDate, // in unix time
        localizedTimeString,
      },
    })
    res.status(200).json({ status: 'ok' })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export type CalendarEventDeleteBody = {
  calendarEventPublicId: string
}

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
  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  const body = JSON.parse(req.body)
  try {
    const { calendarEventPublicId } = body as CalendarEventDeleteBody

    await deleteCalendarEvent({
      userId: user.id,
      projectId,
      calendarEventPublicId,
    })
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
  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  try {
    const results = await getCalendarEvents({
      userId: user.id,
      projectId,
    })
    if (!results) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ results })
    return
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'GET') await handleGet(req, res)
  else if (req.method === 'PATCH') await handlePatch(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
