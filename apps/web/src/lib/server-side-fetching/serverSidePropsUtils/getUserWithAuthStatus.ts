import getOrgWithAccessLevel from "@servicegeek/db/queries/organization/getOrgWithAccessLevel";
import getUser from "@servicegeek/db/queries/user/getUser";
import getSupabaseUser from "@lib/supabase/getSupabaseUser";

interface UserWithAuthStatus {
  user: Awaited<ReturnType<typeof getUser>> | null;
  orgAccessLevel: AccessLevel | null;
  accessToken: string | null;
  emailConfirmed: boolean;
}

const getUserWithAuthStatus = async (): Promise<UserWithAuthStatus> => {
  const now = performance.now();

  const { user, accessToken, emailConfirmedAt } = await getSupabaseUser();
  let end = performance.now();
  console.log(`getUserWithAuthStatus checkpoint 1 ${end - now} ms`);
  if (!user) {
    return {
      user: null,
      orgAccessLevel: null,
      accessToken: null,
      emailConfirmed: false,
    };
  }

  if (!user.org?.organization.id) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: accessToken || "",
      emailConfirmed: !!emailConfirmedAt,
    };
  }

  const org = await getOrgWithAccessLevel(user.org?.organization.id, user.id);

  end = performance.now();
  console.log(`getUserWithAuthStatus checkpoint 2 ${end - now} ms`);

  if (!org) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: accessToken || "",
      emailConfirmed: !!emailConfirmedAt,
    };
  }

  let orgAccessLevel: AccessLevel = "MEMBER";
  if (org.isDeleted) {
    orgAccessLevel = "REMOVED";
  } else if (org.isAdmin) {
    orgAccessLevel = "ADMIN";
  }

  if (user.isSupportUser) {
    orgAccessLevel = "ADMIN";
  }
  end = performance.now();
  console.log(`getUserWithAuthStatus took ${end - now} ms`);
  return {
    user: user,
    orgAccessLevel: orgAccessLevel,
    accessToken: accessToken || "",
    emailConfirmed: !!emailConfirmedAt,
  };
};
export default getUserWithAuthStatus;
