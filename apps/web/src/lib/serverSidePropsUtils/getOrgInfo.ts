import getUser from '@servicegeek/db/queries/user/getUser'

export interface OrgInfo {
  name: string
  address: string
  publicId: string
  logoId: string
}

const getOrgInfo = (user: Awaited<ReturnType<typeof getUser>>) => ({
  name: user!.org?.organization.name || null,
  address: user!.org?.organization.address || null,
  logoId: user!.org?.organization.logoId || null,
  publicId: user!.org?.organization.publicId || null,
})

export default getOrgInfo
