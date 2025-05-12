import SecureView from "@components/SecureView";
import { Suspense } from "react";
const SecureViewPage = () => {
  return (
    <Suspense>
      <SecureView noAccess={false} />
    </Suspense>
  );
};

export default SecureViewPage;

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const linkId = ctx.query.linkId;

//     if (!linkId || Array.isArray(linkId)) {
//       console.log("No link Id");
//       return {
//         props: {
//           noAccess: true,
//         },
//       };
//     }
//     console.log(linkId);
//     const projectId = await getProjectIdFromAccessLink(linkId);

//     if (!projectId) {
//       console.log("No project Id");
//       return {
//         props: {
//           noAccess: true,
//         },
//       };
//     }

//     const project = await prisma.project.findFirst({
//       where: {
//         id: projectId,
//       },
//     });

//     if (!project) {
//       console.log("No project");

//       return {
//         props: {
//           noAccess: true,
//         },
//       };
//     }

//     const inferenceList = await getInferenceList(
//       project?.publicId,
//       project?.organizationId
//     );

//     const urlMap = !inferenceList
//       ? {}
//       : // @ts-expect-error it's ok
//         await getPresignedUrlMapFromInferenceList(inferenceList);

//     const inferences = inferenceList?.rooms || [];
//     return {
//       props: {
//         noAccess: false,
//         inferences,
//         urlMap,
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
