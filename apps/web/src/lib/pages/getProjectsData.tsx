import { PAGE_COUNT } from '@lib/constants'
import { prisma } from '@servicegeek/db'

import { ORG_ACCESS_LEVEL } from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'

const getProjectsData = async (ctx: GetServerSidePropsContext) => {
  let now = performance.now()
  const supabaseClient = createServerSupabaseClient({
    req: ctx.req as NextApiRequest,
    res: ctx.res as NextApiResponse,
  })
  const {
    data: { user: authUser },
  } = await supabaseClient.auth.getUser()
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  if (!authUser) {
    return { user: null, accessToken: null }
  }
  let skip = 0
  const take = PAGE_COUNT
  let page = ctx.query.page

  if (page && !Array.isArray(page)) {
    const p = parseInt(page, 10)
    if (p > 1) {
      skip = PAGE_COUNT * (p - 1)
    }
  }

  const user = await prisma.user.findFirst({
    where: { id: authUser.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      inviteId: true,
      phone: true,
      isDeleted: true,
      isSupportUser: true,
      hasSeenProductTour: true,
      productTourData: true,
      savedDashboardView: true,
      photoView: true,
      groupView: true,
      org: {
        select: {
          id: true,
          role: true,
          accessLevel: true,
          isAdmin: true,
          organizationId: true,
          isDeleted: true,
          organization: {
            select: {
              createdAt: true,
              isDeleted: true,
              publicId: true,
              name: true,
              id: true,
              address: true,
              logoId: true,
              users: {
                where: {
                  isDeleted: false,
                  user: {
                    isDeleted: false,
                    isSupportUser: false,
                  },
                },
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      id: true,
                      email: true,
                    },
                  },
                },
              },
              Subscriptions: {
                take: 1,
                select: {
                  status: true,
                },
              },
              _count: {
                select: {
                  Image: true,
                  projects: true,
                },
              },
              projects: {
                take,
                skip,
                orderBy: {
                  createdAt: 'desc',
                },
                where: {
                  isDeleted: false,
                },
                select: {
                  publicId: true,
                  createdAt: true,
                  name: true,
                  clientName: true,
                  location: true,
                  status: true,
                  lat: true,
                  lng: true,
                  currentStatus: {
                    select: {
                      label: true,
                      description: true,
                      color: true,
                      publicId: true,
                    },
                  },
                  projectAssignees: {
                    select: {
                      userId: true,
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                          email: true,
                        },
                      },
                    },
                  },
                  _count: {
                    select: { images: true },
                  },
                  images: {
                    take: 1,
                    select: {
                      key: true,
                    },
                    where: {
                      isDeleted: false,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!user) {
    return {
      user: null,
      orgAccessLevel: null,
      accessToken: null,
      emailConfirmed: false,
    }
  }

  if (!user.org?.organization.id) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: session?.access_token,
      emailConfirmed: authUser.email_confirmed_at,
    }
  }

  if (!user.org) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: session?.access_token,
      emailConfirmed: authUser.email_confirmed_at,
    }
  }

  let orgAccessLevel = ORG_ACCESS_LEVEL.MEMBER
  if (user.org.isDeleted) {
    orgAccessLevel = ORG_ACCESS_LEVEL.REMOVED
  } else if (user.org.isAdmin) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN
  }
  if (user.isSupportUser) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN
  }
  let end = performance.now()
  console.log(`getProjectsData took ${end - now} ms`)
  return {
    user: user,
    orgAccessLevel: orgAccessLevel,
    accessToken: session?.access_token,
    emailConfirmed: authUser.email_confirmed_at,
  }
}

export default getProjectsData
