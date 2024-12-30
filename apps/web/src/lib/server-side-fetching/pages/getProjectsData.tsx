import { prisma } from '@servicegeek/db'

const PAGE_COUNT = 10

import { createClient } from '@lib/supabase/server'

const getProjectsData = async () => {
  let now = performance.now()
  const supabaseClient = await createClient()
  const {
    data: { user: authUser },
  } = await supabaseClient.auth.getUser()

  if (!authUser) {
    return { user: null, accessToken: null }
  }
  
  let skip = 0
  const take = PAGE_COUNT
  let page = "1"

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
      emailConfirmed: authUser.email_confirmed_at !== null,
    }
  }

  if (!user.org) {
    return {
      user: user,
      orgAccessLevel: null,
      emailConfirmed: authUser.email_confirmed_at !== null,
    }
  }

  let orgAccessLevel: AccessLevel = "member" 
  if (user.org.isDeleted) {
    orgAccessLevel = "removed"
  } else if (user.org.isAdmin) {
    orgAccessLevel = "admin"
  }
  if (user.isSupportUser) {
    orgAccessLevel = "admin"
  }
  let end = performance.now()
  console.log(`getProjectsData took ${end - now} ms`)
  return {
    user: user,
    orgAccessLevel: orgAccessLevel,
    emailConfirmed: authUser.email_confirmed_at !== null,
  }
}

export default getProjectsData
