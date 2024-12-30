'use server'

import { redirect } from 'next/navigation'
import getProjectsData from './pages/getProjectsData'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import superjson from 'superjson'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { ProjectType } from '@servicegeek/db/queries/project/listProjects'
import { convertToOrgInfo, convertToUserInfo } from './get-info'
import getInvitation from '@servicegeek/db/queries/invitations/getInvitation'
import { OrganizationInvitation, User } from '@servicegeek/db'
import getPrice from '@servicegeek/db/queries/prices/getPrice'
import getSubscriptions from '@servicegeek/db/queries/subscriptions/getSubscriptions'
import getOrganization from '@servicegeek/db/queries/organization/getOrganization'
import getProduct from '@servicegeek/db/queries/products/getProduct'
import getUser from '@servicegeek/db/queries/user/getUser'

declare global {
  interface LoggedInUserInfo {
    status?: string
    orgId: string
    projects: ProjectType[] | null
    subscriptionStatus: any
    userInfo: UserInfo
    user: Awaited<ReturnType<typeof getUser>>
    orgInfo: OrgInfo
    urlMap: any
    inviteStatus: InviteStatus | null
    totalProjects: number
    emailConfirmed: boolean
    productInfo?: {
      name: string
    }
    planInfo?: {
      unitAmount: string
      currency: string
      type: string
      interval: string
    }
  }
}

export const getLoggedInUserInfo = async (
  includeImages: boolean,
  includeSubscriptionStatus: boolean,
  includeInviteStatus: boolean,
  includeProductInfo: boolean = false
): Promise<LoggedInUserInfo> => {
  try {
    let now,
      end = 0
    now = performance.now()

    const { user, orgAccessLevel, emailConfirmed } = await getProjectsData()

    if (!user) {
      return redirect('/login')
    }

    if (!user.org) {
      return redirect('/projects')
    }

    if (orgAccessLevel === 'removed') {
      return redirect('/access-revoked')
    }

    const publicOrgId = user.org?.organization.publicId

    let projects = null
    let totalProjects = 0
    if (publicOrgId) {
      totalProjects = user.org.organization._count.projects
      const orgWithProjects = user.org.organization.projects
      projects = superjson.serialize(orgWithProjects)
        .json as unknown as ProjectType[]

        console.log('projects', projects)
    }

    let subscriptionStatus = null

    if (includeSubscriptionStatus) {
      subscriptionStatus = await getSubcriptionStatus(user.id)
    }

    let urlMap = {}

    if (includeImages) {
      urlMap = await getURLMap(projects)
    }

    const inviteStatus = await getInviteStatus(
      user.inviteId,
      includeInviteStatus
    )

    if (includeProductInfo && orgAccessLevel) {
      const productInfo = (await getProductInfo(orgAccessLevel, publicOrgId))!
      return {
        orgId: publicOrgId,
        projects,
        user,
        subscriptionStatus,
        userInfo: convertToUserInfo(user),
        orgInfo: convertToOrgInfo(user),
        urlMap,
        inviteStatus,
        totalProjects,
        emailConfirmed,
        ...productInfo,
      }
    }

    end = performance.now()
    console.log(`/projects took ${end - now} ms`)
    return {
      orgId: publicOrgId,
      projects,
      subscriptionStatus,
      userInfo: convertToUserInfo(user),
      orgInfo: convertToOrgInfo(user),
      urlMap,
      inviteStatus,
      totalProjects,
      emailConfirmed,
      user
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

async function getURLMap(projects: any) {
  const imageKeys = projects?.reduce((prev: any, cur: any) => {
    const images = cur.images.reduce(
      (p: any, c: any) => [decodeURIComponent(c.key), ...p],
      []
    )
    return [...images, ...prev]
  }, []) as string[]

  const { data, error } = await supabaseServiceRole.storage
    .from('project-images')
    .createSignedUrls(imageKeys, 1800)

  const urlMap = !data
    ? {}
    : data.reduce<PresignedUrlMap>((p, c) => {
        if (c.error) return p
        if (!c.path) return p
        return {
          [c.path]: c.signedUrl,
          ...p,
        }
      }, {})

  return urlMap
}

async function getInviteStatus(
  inviteId: string | null,
  get: boolean
): Promise<InviteStatus | null> {
  if (!get) {
    return null
  }
  let inviteStatus: InviteStatus | null = null
  let invitation: OrganizationInvitation | null = null
  if (inviteId) {
    invitation = await getInvitation(inviteId)
    if (invitation) {
      inviteStatus = {
        accepted: invitation?.isAccepted,
        inviteId: invitation.invitationId,
      }
    }
  }

  return inviteStatus
}

async function getProductInfo(orgAccessLevel: AccessLevel, orgId: string) {
  let planInfo

  const organization = await getOrganization(orgId)
  if (!organization) {
    console.error('No Org')
    return redirect('/projects')
  }

  const subscriptions = await getSubscriptions(organization.id)
  const subscription = subscriptions[0]
  if (orgAccessLevel !== 'admin') {
    console.error('Invalid org access level', orgAccessLevel)
    redirect('/projects')
  }

  if (subscription) {
    const price = await getPrice(subscription.pricesId)
    if (price) {
      const { unitAmount, currency, type, interval } = price
      planInfo = {
        unitAmount: `${unitAmount}`,
        currency,
        type,
        interval,
      }

      const product = await getProduct(price.productId)

      if (product) {
        return {
          status: !subscription ? 'never' : subscription.status,
          productInfo: {
            name: product.name,
          },
          planInfo,
        }
      }
    }
  }
}
