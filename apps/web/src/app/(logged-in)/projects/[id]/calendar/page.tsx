import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar"
}

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx)

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
//     let project = await getProjectForOrg(ctx.query.id, orgId)
//     if (!project) {
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }

//     const inferenceList = await getInferenceList(ctx.query.id, orgId)
//     const inferences = inferenceList?.rooms || []
//     const subscriptionStatus = await getSubcriptionStatus(user.id)
//     const stakeholders = await getUsersForProject(user.id, project.publicId)
//     const members = await getMembers(orgId)
//     const serializedMembers = superjson.serialize(members)

//     return {
//       props: {
//         inferences,
//         userInfo: getUserInfo(user),
//         projectInfo: getProjectInfo(project),
//         orgInfo: getOrgInfo(user),
//         subscriptionStatus,
//         stakeholders,
//         teamMembers: serializedMembers.json,
//       },
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }


export default async function Component() {
  
}