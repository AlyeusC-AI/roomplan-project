import { Metadata } from "next";
import RoofingPage from "./main";

export const metadata: Metadata = {
  title: "Roofing",
  description: "Project roofing estimate",
};

export default function Roofing() {
  return <RoofingPage />;
}

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

//     const inferenceList = await getInferenceList(ctx.query.id, orgId);

//     const inferences = inferenceList?.rooms || [];
//     const subscriptionStatus = await getSubcriptionStatus(user.id);

//     let files: FileObject[] = [];
//     let presignedUrlMap: PresignedUrlMap = {};
//     if (accessToken) {
//       const { data, error } = await supabaseServiceRole.storage
//         .from("user-files")
//         .list(`${user.org?.organization.publicId}/${ctx.query.id}/`, {
//           limit: 100,
//           offset: 0,
//           sortBy: { column: "name", order: "asc" },
//         });

//       if (data) files = data;

//       files = files.filter((f) => f.name !== ".emptyFolderPlaceholder");
//       presignedUrlMap = await getPresignedUrlMapFromFileObjectList(
//         files,
//         `${user.org?.organization.publicId}/${ctx.query.id}/`,
//         "user-files"
//       );
//     }
//     return {
//       props: {
//         inferences,
//         userInfo: getUserInfo(user),
//         projectInfo: getProjectInfo(project),
//         orgInfo: getOrgInfo(user),
//         subscriptionStatus,
//         projectFiles: files,
//       },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: {},
//     };
//   }
// };
