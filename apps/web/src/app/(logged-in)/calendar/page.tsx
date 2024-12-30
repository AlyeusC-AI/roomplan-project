import { Metadata } from 'next'
import Calendar from './main'

export const metadata: Metadata = {
  title: 'Calender',
  description: "Access the organization's calender",
  icons: ["./favicon.ico"],
}

// export const getServerSideProps = async () => {
//   try {
//     const { user, orgAccessLevel, accessToken } = await getUserWithAuthStatus()

//     console.log('Hello from getServersideprops')

//     if (!user) {
//       return redirect('/login')
//     }

//     if (!user.org) {
//       return redirect('/projects')
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       redirect('/access-revoked')
//     }

//     const publicOrgId = user.org?.organization.publicId || null
//     let projects = null
//     let allEvents = []
//     let totalProjects = 0
//     if (user.org?.organization.id) {
//       const orgWithProjects = await listProjects(user.org?.organization.id)
//       projects = SuperJSON.serialize(orgWithProjects?.projects)
//         .json as unknown as ProjectType[]
//       totalProjects = orgWithProjects?._count.projects || 0

//       // get all calender events for each project
//       const projectsPromises = projects.map((p: ProjectType) =>
//         getCalendarEvents({
//           userId: user.id,
//           projectId: p.publicId,
//         })
//       )
//       const projectsEvents = SuperJSON.serialize(
//         await Promise.all(projectsPromises)
//       ).json as unknown as any
//       allEvents = projectsEvents.reduce((acc: any, curr: any) => {
//         return acc?.concat(curr)
//       }, [])
//       console.log(allEvents)
//     }
//     const subscriptionStatus = await getSubcriptionStatus(user.id)

//     let inviteStatus: InviteStatus | null = null
//     let invitation: OrganizationInvitation | null = null
//     if (user.inviteId) {
//       invitation = await getInvitation(user.inviteId)
//       if (invitation) {
//         inviteStatus = {
//           accepted: invitation?.isAccepted,
//           organizationName: user.org!.organization.name,
//           inviteId: invitation.invitationId,
//         }
//       }
//     }

//     return {
//       orgId: publicOrgId,
//       projects,
//       subscriptionStatus,
//       inviteStatus,
//       userInfo: getUserInfo(user),
//       allEvents,
//       totalProjects,
//       orgInfo: getOrgInfo(user),
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }

export default function Component() {
  return <Calendar />
}
