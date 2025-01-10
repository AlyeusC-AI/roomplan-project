'use server'

import { createClient } from '@lib/supabase/server'
import {
  DashboardViews,
  GroupByViews,
  PhotoViews,
  Prisma,
  prisma,
} from '@servicegeek/db'
import { redirect } from 'next/navigation'

export const fetchLoggedInUserAndOrg = async (): Promise<User | undefined | never> => {
  let redirectPath: string | null = null

  try {
    const supabaseClient = await createClient()

    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser()

    if (!authUser) {
      throw new Error('/login')
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
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new Error('/login')
    }

    if (!user.org) {
      throw new Error('/organization')
    }

    if (!user.org.accessLevel) {
      throw new Error('/access-revoked')
    }

    return {
      ...user,
      emailConfirmed: authUser.email_confirmed_at != null,
      organizationName: user.org.organization.name,
      accessLevel: user.org.accessLevel,
      isAdmin: user.org.isAdmin,
      org: {
        ...user.org,
        name: user.org.organization.name,
        organizationId: user.org.organization.id,
        isDeleted: user.org.isDeleted,
        address: user.org.organization.address,
        publicId: user.org.organization.publicId,
        logoId: user.org.organization.logoId,
      },
    }
  } catch (error) {
    if (typeof error === 'string') {
      redirectPath = error
    } else if (error instanceof Error) {
      redirectPath = error.message
    }
  } finally {
    if (redirectPath) {
      return redirect(redirectPath)
    }
  }
}

declare global {
  interface User extends UserInfo {
    emailConfirmed: boolean
    id: string
    firstName: string
    lastName: string
    email: string
    inviteId: string | null
    phone: string
    isDeleted: boolean
    isSupportUser: boolean
    hasSeenProductTour: boolean
    productTourData: Prisma.JsonValue
    savedDashboardView: DashboardViews
    photoView: PhotoViews
    groupView: GroupByViews
    org: Org | null
  }

  interface Org extends OrgInfo {
    id: number
    role: string | null
    accessLevel: string | null
    isAdmin: boolean
    organizationId: number
    isDeleted: boolean
    organization: {
      createdAt: Date
      isDeleted: boolean
      publicId: string
      name: string
      id: number
      address: string
      logoId: string | null
    }
  }
}
