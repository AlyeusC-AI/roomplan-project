import EstimateDetails from '@components/Project/EstimateDetails'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Project Estimate and Details',
}

const EstimateDetailsPage = () => {
  
  return (
    <>
      {/* <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value="notifications" disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </Tabs> */}
      {/* <MainContent> */}
        <EstimateDetails />
      {/* </MainContent> */}
    </>
  )
}

export default EstimateDetailsPage

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   let now,
//     end = 0
//   now = performance.now()
//   try {
//     if (Array.isArray(ctx.query.id) || !ctx.query.id) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }
//     const { user, orgAccessLevel } = await getOverViewData(ctx, ctx.query.id)
//     end = performance.now()
//     console.log(`/projects/overview checkpoint 1 took ${end - now} ms`)
//     if (!user) {
//       return {
//         redirect: {
//           destination: '/login',
//           permanent: false,
//         },
//       }
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       return {
//         redirect: {
//           destination: '/access-revoked',
//           permanent: false,
//         },
//       }
//     }
//     const orgId = user.org?.organization.id || null
//     if (!orgId || !ctx.query.id || Array.isArray(ctx.query.id)) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }

//     const project = user.org?.organization.projects[0]
//     if (!project) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }

//     const subscriptionStatus = await getSubcriptionStatus(user.id)

//     end = performance.now()
//     console.log(`/projects/overview took ${end - now} ms`)
//     return {
//       props: {
//         userInfo: getUserInfo(user),
//         orgInfo: getOrgInfo(user),
//         projectInfo: getProjectInfo(project),
//         propertyDataInfo: getPropertyDataInfo(project.propertyData),
//         teamMembers: superjson.serialize(user.org?.organization.users).json,
//         stakeholders: superjson.serialize(project.projectAssignees).json,
//         subscriptionStatus,
//       },
//     }
//   } catch (e) {
//     console.log('Returning nothing')
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }
