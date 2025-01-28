"use client";

import Readings from "@components/Project/Readings";
import { trpc } from "@utils/trpc";
import { RouterOutputs } from "@servicegeek/api";
import { useParams } from "next/navigation";

interface EstimatePageProps {
  roomReadings: RouterOutputs["readings"]["getAll"];
}
const MitigationPage = ({ roomReadings }: EstimatePageProps) => {
  const { id } = useParams<{ id: string }>();
  trpc.readings.getAll.useQuery(
    { projectPublicId: id },
    { initialData: roomReadings }
  );
  return (
    <>
      <Readings />
    </>
  );
};

export default MitigationPage;

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx);

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

//     const roomList = await getRoomList(ctx.query.id, orgId);
//     const rooms = roomList?.rooms || [];
//     const subscriptionStatus = await getSubcriptionStatus(user.id);
//     const roomReadings = (await getRoomReadings(user.id, ctx.query.id)) || [];

//     return {
//       props: {
//         rooms,
//         userInfo: getUserInfo(user),
//         subscriptionStatus,
//         roomReadings: superjson.serialize(roomReadings).json,
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
