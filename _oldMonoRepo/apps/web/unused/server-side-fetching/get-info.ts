// import getUser from "@servicegeek/db/queries/user/getUser";

// export const convertToOrgInfo = (
//   user: Awaited<ReturnType<typeof getUser>>
// ): OrgInfo => ({
//   name: user!.org?.organization.name ?? "",
//   address: user!.org?.organization.address ?? "",
//   logoId: user!.org?.organization.logoId ?? "",
//   publicId: user!.org?.organization.publicId || "",
// });

// export const convertToUserInfo = (
//   user: Awaited<ReturnType<typeof getUser>>
// ): UserInfo => ({
//   email: user!.email,
//   firstName: user!.firstName,
//   lastName: user!.lastName,
//   phone: user!.phone,
//   organizationName: user!.org!.organization.name,
//   id: user!.id,
//   accessLevel: user!.org!.accessLevel!,
//   isAdmin: user!.org?.isAdmin ?? false,
//   hasSeenProductTour: user?.hasSeenProductTour || false,
//   isSupportUser: user?.isSupportUser || false,
//   savedDashboardView: user?.savedDashboardView || "listView",
//   productTourData: user?.productTourData ?? {},
// });
