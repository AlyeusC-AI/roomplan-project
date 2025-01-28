import Costs from "@components/Project/Costs";
import { SubscriptionStatus } from "@servicegeek/db";
import { User } from "@supabase/supabase-js";

interface EstimatePageProps {
  user: User;
  projectInfo: ProjectInfo;
  subscriptionStatus: SubscriptionStatus;
  subcontractorCosts: CostDataType[];
  miscellaneousCosts: CostDataType[];
  materialsCosts: CostDataType[];
  laborCosts: CostDataType[];
  rcvValue: number;
  actualValue: number;
}

const ExpensesPage = ({ rcvValue, actualValue }: EstimatePageProps) => {
  return (
    <>
      <Costs rcvValue={rcvValue} actualValue={actualValue} />
    </>
  );
};

export default ExpensesPage;

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

//     if (
//       user.org?.accessLevel !== AccessLevel.projectManager &&
//       user.org?.accessLevel !== AccessLevel.admin &&
//       user.org?.accessLevel !== AccessLevel.accountManager
//     ) {
//       return {
//         redirect: {
//           destination: "/projects",
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
//     const project = await prisma.project.findFirst({
//       where: { publicId: ctx.query.id, organizationId: orgId },
//       include: {
//         costs: {
//           select: {
//             id: true,
//             name: true,
//             actualCost: true,
//             estimatedCost: true,
//             type: true,
//           },
//           where: {
//             isDeleted: false,
//           },
//         },
//       },
//     });
//     if (!project) {
//       return {
//         redirect: {
//           destination: "/projects",
//           permanent: false,
//         },
//       };
//     }

//     const [subscriptionStatus] = await Promise.all([
//       getSubcriptionStatus(user.id),
//       getRoomList(ctx.query.id, orgId),
//     ]);

//     return {
//       props: {
//         userInfo: getUserInfo(user),
//         projectInfo: getProjectInfo(project),
//         rcvValue: project.rcvValue,
//         actualValue: project.actualValue,
//         subcontractorCosts: project.costs.filter(
//           (cost) => cost.type === CostType.subcontractor
//         ),
//         miscellaneousCosts: project.costs.filter(
//           (cost) => cost.type === CostType.miscellaneous
//         ),
//         materialsCosts: project.costs.filter(
//           (cost) => cost.type === CostType.materials
//         ),
//         laborCosts: project.costs.filter(
//           (cost) => cost.type === CostType.labor
//         ),
//         orgInfo: getOrgInfo(user),
//         subscriptionStatus,
//       },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: {},
//     };
//   }
// };
