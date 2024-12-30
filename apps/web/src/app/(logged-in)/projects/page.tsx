import { Metadata } from 'next'
import ProjectList from '@components/Projects/ProjectList'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Access projects that you have integrated with ServiceGeek',
  icons: ['/favicon.ico'],
}

// export const getServerSidePropss = async () => {
//   try {
//     const { user, orgAccessLevel } = await getProjectsData()

//     if (!user) {
//       return redirect('/login')
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       return redirect('/access-revoked')
//     }

//     const publicOrgId = user.org?.organization.publicId || null
//     let projects = null
//     let totalProjects = 0
//     if (user.org?.organization.id) {
//       const orgWithProjects = user.org.organization.projects
//       totalProjects = user.org.organization._count.projects
//       projects = SuperJSON.serialize(orgWithProjects)
//         .json as unknown as ProjectType[]
//     }
//     const subscriptionStatus = await getSubcriptionStatus(user.id)

    // let inviteStatus: InviteStatus | null = null
    // let invitation: OrganizationInvitation | null = null
    // if (user.inviteId) {
    //   invitation = await getInvitation(user.inviteId)
    //   if (invitation) {
    //     inviteStatus = {
    //       accepted: invitation?.isAccepted,
    //       organizationName: user.org!.organization.name,
    //       inviteId: invitation.invitationId,
    //     }
    //   }
    // }

//     const imageKeys = projects?.reduce<string[]>((prev, cur) => {
//       const images = cur.images.reduce<string[]>(
//         (p, c) => [decodeURIComponent(c.key), ...p],
//         []
//       )
//       return [...images, ...prev]
//     }, []) as string[]

//     const { data, error } = await supabaseServiceRole.storage
//       .from('project-images')
//       .createSignedUrls(imageKeys, 1800)

//     const { data: mediaData } = await supabaseServiceRole.storage
//       .from('media')
//       .createSignedUrls(imageKeys, 1800)
//     const arr =
//       data && mediaData
//         ? [...data, ...mediaData]
//         : data
//         ? data
//         : mediaData
//         ? mediaData
//         : []
//     const urlMap = arr.reduce<PresignedUrlMap>((p, c) => {
//       if (c.error) return p
//       if (!c.path) return p
//       return {
//         [c.path]: c.signedUrl,
//         ...p,
//       }
//     }, {})

//     const members = !user.org
//       ? []
//       : ((await getMembers(user.org.organization.id)) as unknown as Member[])
//     const serializedMembers = SuperJSON.serialize(members)

//     return {
//       orgId: publicOrgId,
//       totalProjects,
//       teamMembers: serializedMembers.json as unknown as Member[],
//       projects,
//       subscriptionStatus,
//       inviteStatus,
//       userInfo: getUserInfo(user),
//       urlMap,
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }

export default async function Component() {
  return (
    <ProjectList />
  )
}
