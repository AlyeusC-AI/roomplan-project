import { default as getRestorationXUser } from '@restorationx/db/queries/user/getUser'
import { prisma } from '@restorationx/db'

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

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

  const searchTerm = req.query.search
  if (Array.isArray(searchTerm) || !searchTerm) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const identishotUser = await getRestorationXUser(user.id)
    const org = identishotUser?.org?.organization
    if (!org?.id) {
      console.error('err', 'no org')
      res.status(500).json({ status: 'failed' })
      return
    }
    const search = searchTerm
      .split(' ')
      .map((s) => `${s.trim()}:*`)
      .join(' | ')

    const results = await prisma.project.findMany({
      where: {
        isDeleted: false,
        organizationId: org.id,
        name: {
          search,
        },
        location: {
          search,
        },
        clientEmail: {
          search,
        },
        clientPhoneNumber: {
          search,
        },
        companyName: {
          search,
        },
        assignmentNumber: {
          search,
        },
        managerName: {
          search,
        },
        adjusterEmail: {
          search,
        },
        adjusterName: {
          search,
        },
        adjusterPhoneNumber: {
          search,
        },
        insuranceCompanyName: {
          search,
        },
        insuranceClaimId: {
          search,
        },
        claimSummary: {
          search,
        },
      },
      select: {
        publicId: true,
        name: true,
        location: true,
        clientEmail: true,
        clientPhoneNumber: true,
        companyName: true,
        managerName: true,
        adjusterEmail: true,
        adjusterName: true,
        adjusterPhoneNumber: true,
        insuranceCompanyName: true,
        insuranceClaimId: true,
        claimSummary: true,
        status: true,
      },
    })
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
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
