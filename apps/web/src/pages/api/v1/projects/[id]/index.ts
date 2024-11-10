import { getInferenceList } from '@servicegeek/db/queries/project/getProjectDetections'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import { default as getRestorationXUser } from '@servicegeek/db/queries/user/getUser'
import getProjectInfo from '@lib/serverSidePropsUtils/getProjectInfo'
import getPresignedUrlMapFromInferenceList from '@lib/supabase/getPresignedUrlMapFromInferenceList'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
    return
  }
  if (!req.query.id || Array.isArray(req.query.id)) {
    res.status(500).json({ status: 'Invalid id' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  try {
    const servicegeekUser = await getRestorationXUser(user.id)
    const org = servicegeekUser?.org?.organization
    if (!org?.id) {
      console.error('err', 'no org')
      res.status(500).json({ status: 'failed' })
      return
    }
    const [project, roomList] = await Promise.all([
      getProjectForOrg(req.query.id, org.id),
      getInferenceList(req.query.id, org.id),
    ])

    if (!project) {
      console.error('No project')
      res.status(500).json({ status: 'failed' })
      return
    }

    const urlMap = !roomList
      ? {}
      : // @ts-expect-error it's ok
        await getPresignedUrlMapFromInferenceList(roomList)

    res.status(200).json({
      status: 'ok',
      rooms: roomList?.rooms,
      project: getProjectInfo(project),
      orgId: org.publicId,
      urlMap,
    })
    return
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
