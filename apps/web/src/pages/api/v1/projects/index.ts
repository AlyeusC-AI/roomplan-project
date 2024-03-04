import createProject from '@restorationx/db/queries/project/createProject'
import listProjects, {
  listProjectsForUser,
} from '@restorationx/db/queries/project/listProjects'
import { default as getRestorationXUser } from '@restorationx/db/queries/user/getUser'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import superjson from 'superjson'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
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
    res.status(500).send('Session does not exist')
    return
  }
  try {
    const identishotUser = await getRestorationXUser(user.id)
    const org = identishotUser?.org?.organization
    if (!org?.id) {
      console.error('err', 'no org')
      res.status(204).send('Account set incomplete')
      return
    }
    let projects
    if (req.query.userId && !Array.isArray(req.query.userId)) {
      projects = await listProjectsForUser(org.id, req.query.userId)
      projects = projects.filter((p) =>
        p.projectAssignees.find((u) => u.userId === req.query.userId)
      )
    } else {
      projects = await listProjects(org.id)
      projects = projects?.projects
    }
    res.status(200).json({
      status: 'ok',
      projects,
      orgId: org.publicId,
      teamMembers: superjson.serialize(org.users).json,
    })
    return
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
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
    const { publicId, failed, reason } = await createProject(user.id, {
      name: req.body.name,
      location: req.body.location,
    })
    if (failed) {
      res.status(500).json({ status: 'failed', reason })
      return
    }
    res.status(200).json({ status: 'ok', projectId: publicId })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') await handleGet(req, res)
  else if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
