"use client";

import Files from "@components/Project/Files";

const FilesPage = () => {
  return <Files />;
};

export default FilesPage;

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
//         subscriptionStatus,
//         presignedUrlMap,
//         projectFiles: files,
//         userInfo: getUserInfo(user),
//         orgInfo: getOrgInfo(user),
//         projectInfo: getProjectInfo(project),
//       },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: {},
//     };
//   }
// };
