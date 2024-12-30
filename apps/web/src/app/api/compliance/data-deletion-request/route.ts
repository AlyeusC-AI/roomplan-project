import addDataDeletionRequest from '@servicegeek/db/queries/data-deletion-request/addDataDeletionRequest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  try {
    const { email, fullName } = body
    await addDataDeletionRequest(fullName, email)

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'error' })
  }
}
