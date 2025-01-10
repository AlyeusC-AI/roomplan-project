import { getInferenceList } from '@servicegeek/db/queries/project/getProjectDetections'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import { default as getRestorationXUser } from '@servicegeek/db/queries/user/getUser'
import getPresignedUrlMapFromInferenceList from '@lib/supabase/getPresignedUrlMapFromInferenceList'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import getProjectInfo from '@lib/server-side-fetching/serverSidePropsUtils/getProjectInfo'
import { User } from "@supabase/supabase-js"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const headers = req.headers
  const jwt = headers.get('auth-token')

  let user: User | null = null

  if (!jwt || Array.isArray(jwt)) {
    user = (await supabase.auth.getUser()).data.user
  } else {
    user = (await supabase.auth.getUser(jwt)).data.user
  }

  const queryId = (await params).id

  if (!queryId || Array.isArray(queryId)) {
    return NextResponse.json({ status: 'Invalid id' }, { status: 500 })
  }

  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'Session does not exist' }, { status: 500 })
  }

  try {
    const servicegeekUser = await getRestorationXUser(user.id)
    const org = servicegeekUser?.org?.organization
    if (!org?.id) {
      console.error('err', 'no org')
      return NextResponse.json({ status: 'Account set incomplete' }, { status: 500 })
    }
    const [project, roomList] = await Promise.all([
      getProjectForOrg(queryId, org.id),
      getInferenceList(queryId, org.id),
    ])

    if (!project) {
      console.error('No project')
      return NextResponse.json({ status: 'No project' }, { status: 500 })
    }

    const urlMap = !roomList
      ? {}
      : // @ts-expect-error it's ok
        await getPresignedUrlMapFromInferenceList(roomList)

    return NextResponse.json({
      status: 'ok',
      rooms: roomList?.rooms,
      project: getProjectInfo(project),
      orgId: org.publicId,
      urlMap,
    })
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}