import getOrgWithAccessLevel from '@servicegeek/db/queries/organization/getOrgWithAccessLevel'
import getUser from '@servicegeek/db/queries/user/getUser'
import getSupabaseUser from '@lib/supabase/getSupabaseUser'
import { GetServerSidePropsContext } from 'next'

export enum ORG_ACCESS_LEVEL {
  ADMIN,
  MEMBER,
  REMOVED,
}

interface UserWithAuthStatus {
  user: Awaited<ReturnType<typeof getUser>> | null
  orgAccessLevel: ORG_ACCESS_LEVEL | null
  accessToken: string | null
  emailConfirmed: boolean
}

const getUserWithAuthStatus = async (
  ctx: GetServerSidePropsContext
): Promise<UserWithAuthStatus> => {
  const now = performance.now()

  const { user, accessToken, emailConfirmedAt } = await getSupabaseUser(ctx)
  let end = performance.now()
  console.log(`getUserWithAuthStatus checkpoint 1 ${end - now} ms`)
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
      accessToken: accessToken || '',
      emailConfirmed: !!emailConfirmedAt,
    }
  }

  const org = await getOrgWithAccessLevel(user.org?.organization.id, user.id)

  end = performance.now()
  console.log(`getUserWithAuthStatus checkpoint 2 ${end - now} ms`)

  if (!org) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: accessToken || '',
      emailConfirmed: !!emailConfirmedAt,
    }
  }

  let orgAccessLevel = ORG_ACCESS_LEVEL.MEMBER
  if (org.isDeleted) {
    orgAccessLevel = ORG_ACCESS_LEVEL.REMOVED
  } else if (org.isAdmin) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN
  }

  if (user.isSupportUser) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN
  }
  end = performance.now()
  console.log(`getUserWithAuthStatus took ${end - now} ms`)
  return {
    user: user,
    orgAccessLevel: orgAccessLevel,
    accessToken: accessToken || '',
    emailConfirmed: !!emailConfirmedAt,
  }
}
export default getUserWithAuthStatus
