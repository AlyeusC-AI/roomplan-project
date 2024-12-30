import { useEffect, useState } from 'react'
import { Project } from '@servicegeek/db'

export type createCalenderEventBody = {
  subject: string
  payload: string
  date: number
  reminderDate: number
  remindClient: boolean
  remindProjectOwners: boolean
  localizedTimeString: string
}
export type createCalenderEventResponse = {
  calendarEvent: {
    publicId: string
  }
}

export type deleteCalenderBody = {
  calendarEventPublicId: string
}
export type deleteCalenderResponse = {
  status: string
}

export type getAllCalenderEventsForProjectResponse = {
  results: calenderEvents[]
}
export type calenderEvents = {
  subject: string
  payload: string
  date: Date
  projectId: number | null
  publicId: string
  project: Project | null
  dynamicId: string
  isDeleted: boolean
  remindClient: boolean
  remindProjectOwners: boolean
}

export type CalendarEventPatchBody = {
  calendarEventPublicId: string
  subject?: string
  localizedTimeString: string
  payload?: string
  remindProjectOwners?: boolean
  date?: number
  reminderDate?: number
  remindClient?: boolean
}

type useSchedulerProps = {
  projectId: string
}

const useScheduler = ({ projectId }: useSchedulerProps) => {
  const [calenderEvents, setCalenderEvents] = useState<calenderEvents[]>([])

  const getCalendarEvents = async () => {
    // call api to get all calendar events
    const res = await fetch(`/api/project/${projectId}/calendar-event`, {
      method: 'GET',
    })

    try {
      const json = await res.json()
      const { results } = json as getAllCalenderEventsForProjectResponse

      setCalenderEvents(results)
    } catch (error) {
      new Error('getCalendarEvents failed')
    }
  }

  const createCalenderEvent = async (body: createCalenderEventBody) => {
    // call api to create a new calendar event
    const res = await fetch(`/api/project/${projectId}/calendar-event`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    try {
      const json = await res.json()
      const {
        calendarEvent: { publicId },
      } = json as createCalenderEventResponse
      await getCalendarEvents()
    } catch (error) {
      new Error('createCalenderEvent failed')
    }
  }

  const deleteCalenderEvent = async (body: deleteCalenderBody) => {
    // call api to delete a calendar event
    const res = await fetch(`/api/project/${projectId}/calendar-event`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    })
    try {
      const json = await res.json()
      const { status } = json as deleteCalenderResponse
      await getCalendarEvents()

      return status
    } catch (error) {
      new Error('deleteCalenderEvent failed')
    }
  }

  // method to update a calendar event
  const updateCalenderEvent = async (body: CalendarEventPatchBody) => {
    // call api to update a calendar event
    const res = await fetch(`/api/project/${projectId}/calendar-event`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    try {
      const json = await res.json()
      await getCalendarEvents()

      return
    } catch (error) {
      new Error('updateCalenderEvent failed')
    }
  }

  useEffect(() => {
    getCalendarEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    calenderEvents,
    getCalendarEvents,
    createCalenderEvent,
    deleteCalenderEvent,
    updateCalenderEvent,
  }
}

export default useScheduler
