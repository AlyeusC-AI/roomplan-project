import PropertyInfo from "@components/Project/PropertyInfo";

const PropertyInfoPage = () => {
  return <PropertyInfo />;
};

export default PropertyInfoPage;

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const { user, orgAccessLevel, accessToken } =
//       await getUserWithAuthStatus(ctx);

//     if (!user) {
//       return {
//         redirect: {
//           destination: "/login",
//           permanent: false,
//         },
//       };
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       return {
//         redirect: {
//           destination: "/access-revoked",
//           permanent: false,
//         },
//       };
//     }
//     const orgId = user.org?.organization.id || null;
//     if (!orgId || !ctx.query.id || Array.isArray(ctx.query.id)) {
//       return {
//         redirect: {
//           destination: "/projects",
//           permanent: false,
//         },
//       };
//     }
//     const project = await getProjectForOrg(ctx.query.id, orgId);
//     if (!project) {
//       return {
//         redirect: {
//           destination: "/projects",
//           permanent: false,
//         },
//       };
//     }

//     const subscriptionStatus = await getSubcriptionStatus(user.id);
//     const propertyData = await getPropertyData(project.id);

//     return {
//       props: {
//         userInfo: getUserInfo(user),
//         projectInfo: getProjectInfo(project),
//         propertyDataInfo: getPropertyDataInfo(propertyData),
//         subscriptionStatus,
//         orgInfo: getOrgInfo(user),
//       },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: {},
//     };
//   }
// };
