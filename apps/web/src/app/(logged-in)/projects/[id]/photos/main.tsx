"use client";

// import FirstTimePhotos from "@components/onboarding/FirstTimePhotos";
import Mitigation from "@components/Project/Mitigation";

const EstimatePage = () => {
  return (
    <>
      <Mitigation />
      {/* <FirstTimePhotos /> */}
    </>
  );
};

export default EstimatePage;

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

//     const { rooms, onlySelected, sortDireciton } = ctx.query;
//     let parsedRooms: string[] | undefined = undefined;
//     let parsedOnlySelected: boolean | undefined = undefined;
//     let parsedSortDirection: "asc" | "desc" | undefined = undefined;

//     if (rooms) {
//       try {
//         parsedRooms = RoomsFilterQueryParam.parse(JSON.parse(rooms as string));
//       } catch (e) {
//         console.error(e);
//       }
//     }

//     if (onlySelected) {
//       try {
//         parsedOnlySelected = OnlySelectedFilterQueryParam.parse(
//           JSON.parse(onlySelected as string)
//         );
//       } catch (e) {
//         console.error(e);
//       }
//     }

//     if (sortDireciton) {
//       try {
//         parsedSortDirection = SortDirectionQueryParam.parse(
//           JSON.parse(sortDireciton as string)
//         );
//       } catch (e) {
//         console.error(e);
//       }
//     }

//     const [project, inferenceList, subscriptionStatus, roomList] =
//       await Promise.all([
//         getProjectForOrg(ctx.query.id, orgId),
//         getInferenceList(
//           ctx.query.id,
//           orgId,
//           parsedRooms,
//           parsedOnlySelected,
//           parsedSortDirection
//         ),
//         getSubcriptionStatus(user.id),
//         getRoomList(ctx.query.id, orgId),
//       ]);

//     const urlMap = !inferenceList
//       ? {}
//       : // @ts-expect-error it's ok
//         await getPresignedUrlMapFromInferenceList(inferenceList);

//     if (!project) {
//       return {
//         redirect: {
//           destination: "/projects",
//           permanent: false,
//         },
//       };
//     }
//     const inferences = inferenceList?.rooms || [];
//     const roomArr = roomList?.rooms || [];
//     console.log(inferences);

//     const members = (await getMembers(orgId)) as unknown as Member[];
//     const serializedMembers = superjson.serialize(members);

//     return {
//       props: {
//         rooms: roomArr,
//         inferences,
//         teamMembers: serializedMembers.json as unknown as Member[],
//         userInfo: getUserInfo(user),
//         projectInfo: getProjectInfo(project),
//         orgInfo: getOrgInfo(user),
//         subscriptionStatus,
//         urlMap,
//         initialPhotoView: user.photoView || PhotoViews.photoListView,
//         initialGroupView: user.groupView || GroupByViews.dateView,
//       },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: {},
//     };
//   }
// };
