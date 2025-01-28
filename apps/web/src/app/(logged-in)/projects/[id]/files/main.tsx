"use client";

import MainContent from "@components/layouts/MainContent";
import Files from "@components/Project/Files";
import { useParams } from "next/navigation";
import { trpc } from "@utils/trpc";

const FilesPage = () => {
  const { id } = useParams();
  const pendingReports = trpc.pendingReports.getPendingReports.useQuery({
    publicProjectId: id as string,
  });

  return (
    <MainContent>
      {/* {router.query.alert === "roof_report_ordered" && (
          <Alert title='Roof report ordered!' type='success'>
            Your roof report is being generated and will available within 24
            hours
            <br />
            Your roof report .esx file will be on this page once it&apos;s ready
          </Alert>
        )} */}
      {/* {router.query.alert !== "roof_report_ordered" &&
          pendingReports.data?.pendingRoofReports !== undefined &&
          pendingReports.data?.pendingRoofReports > 0 && (
            <Alert title='Roof status' type='default'>
              You have {pendingReports.data?.pendingRoofReports} roof report(s)
              currently processing
              <br />
              Your roof report .esx file(s) will be on this page once it&apos;s
              ready
            </Alert>
          )} */}
      <Files />
    </MainContent>
  );
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
