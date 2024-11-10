import { prisma } from '@servicegeek/db'

import { Novu } from '@novu/node'
import { verifySignature } from '@upstash/qstash/nextjs'
import assert from 'assert'
import { NextApiRequest, NextApiResponse } from 'next'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.body)
  const { reminderId, dynamicId, localizedTimeString } = JSON.parse(req.body)
  console.log('Processing reminder ', reminderId)
  console.log('dynamic id ', dynamicId)

  const calendarEventReminder = await prisma.calendarEventReminder.findFirst({
    where: {
      id: reminderId,
    },
    select: {
      calendarEventId: true,
      calendarEvent: true,
    },
  })

  const calendarEvent = calendarEventReminder?.calendarEvent

  if (!calendarEvent) {
    res
      .status(200)
      .json({ status: 'ok', result: 'No action - Event not found.' })
    return
  }

  if (calendarEvent.isDeleted) {
    res
      .status(200)
      .json({ status: 'ok', result: 'No action - Event not found.' })
    return
  }

  if (!calendarEventReminder) {
    console.error('No action - reminder not found.')

    res
      .status(200)
      .json({ status: 'ok', result: 'No action - reminder not found.' })
    return
  }

  if (calendarEvent.dynamicId !== dynamicId) {
    console.error('No action - reminder stale.')
    res
      .status(200)
      .json({ status: 'ok', result: 'No action - reminder stale.' })
    return
  }
  // init nuvo
  const novuApiKey = process.env.NOVU_API_KEY
  assert(novuApiKey, 'NOVU_API_KEY is not defined')
  const novu = new Novu(novuApiKey)

  // const nuvo promises
  const nuvoPromises: Promise<any>[] = []
  const projectInfo = await prisma.project.findFirst({
    where: {
      id: Number(calendarEvent?.projectId) || 0,
    },
    select: {
      clientPhoneNumber: true,
      clientName: true,
      location: true,
    },
  })

  const messageData = {
    subject: Buffer.from(
      calendarEvent.subject.replaceAll("'", ''),
      'utf-8'
    ).toString(),
    time: localizedTimeString,
    client: projectInfo?.clientName,
    location: projectInfo?.location,
    message: Buffer.from(
      calendarEvent.payload.replaceAll("'", ''),
      'utf-8'
    ).toString(),
  }

  if (calendarEvent.remindClient) {
    console.log(
      'preparing to send to clientPhoneNumber ',
      projectInfo?.clientPhoneNumber
    )
    if (projectInfo?.clientPhoneNumber) {
      nuvoPromises.push(
        novu.trigger('calendar-reminder', {
          to: {
            subscriberId: calendarEvent.publicId,
            phone: `+1${projectInfo?.clientPhoneNumber}`,
          },
          payload: {
            ...messageData,
          },
        })
      )
    }
  }

  if (calendarEvent.remindProjectOwners) {
    const stakeHolders = await prisma.userToProject.findMany({
      where: {
        projectId: calendarEvent?.projectId || 1,
      },
      select: {
        userId: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    })

    const stakeHoldersPhoneNumbers = stakeHolders.map((sholder) =>
      `${sholder.user.phone}`.split('-').join('')
    )

    console.log('preparing to send to stakeholders ', stakeHoldersPhoneNumbers)

    const promises = stakeHoldersPhoneNumbers.map((phoneNumber) => {
      return novu.trigger('calendar-reminder', {
        to: {
          subscriberId: calendarEvent.publicId,
          phone: phoneNumber,
        },
        payload: {
          ...messageData,
        },
      })
    })

    nuvoPromises.push(...promises)
  }

  try {
    if (nuvoPromises.length) {
      console.log(`sending ${nuvoPromises.length} sms triggers`)
      await Promise.all(nuvoPromises)
    } else {
      console.log('no sms triggers to send!')
    }

    return res
      .status(200)
      .json({ status: 'ok', result: 'notification ran successfully' })
  } catch (error) {
    console.error((error as Error).message)
    res.status(500).json({ error: (error as Error).message })
  } finally {
    res.end()
  }
}

async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}

export default verifySignature(Route)

export const config = {
  api: {
    bodyParser: false,
  },
}
