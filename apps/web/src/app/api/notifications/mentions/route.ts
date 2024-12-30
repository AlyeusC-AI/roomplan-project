import { Novu } from '@novu/node'
import assert from 'assert'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { phoneNumbers, body, client, location } = await req.json()
  console.log('Processing body ', body)
  console.log('Processing phoneNumbers ', phoneNumbers)

  if (!phoneNumbers || !body) {
    return NextResponse.json(
      { error: 'phoneNumbers and body are required' },
      { status: 400 }
    )
  }
  // init nuvo
  const novuApiKey = process.env.NOVU_API_KEY
  assert(novuApiKey, 'NOVU_API_KEY is not defined')
  const novu = new Novu(novuApiKey)

  // const nuvo promises
  const nuvoPromises: Promise<any>[] = []

  const messageData = {
    client,
    location,
    message: Buffer.from(body.replaceAll("'", ''), 'utf-8').toString(),
  }

  const promises = phoneNumbers.map((phoneNumber: string, i: number) => {
    return novu.trigger('calendar-reminder', {
      to: {
        subscriberId: phoneNumber + i,
        phone: phoneNumber,
      },
      payload: {
        ...messageData,
      },
    })
  })

  nuvoPromises.push(...promises)

  try {
    if (nuvoPromises.length) {
      console.log(`sending ${nuvoPromises.length} sms triggers`)
      await Promise.all(nuvoPromises)
    } else {
      console.log('no sms triggers to send!')
    }

    return NextResponse.json(
      {
        status: 'ok',
        result: 'notification ran successfully',
        sent: nuvoPromises.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error((error as Error).message)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  } finally {
    return
  }
}