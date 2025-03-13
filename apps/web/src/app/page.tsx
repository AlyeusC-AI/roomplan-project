import { createClient } from "@lib/supabase/server";
import { redirect } from "next/navigation";

// Exporting
export default async function Component({
  params,
  searchParams,
}: {
  params: Promise<{ inviteCode: string }>;
  searchParams: Promise<{ inviteCode: string }>;
}) {
  console.log("🚀 ~ params:", params);
  const client = await createClient();
  const search = await searchParams;
  const inviteCode = search.inviteCode;
  if (inviteCode) {
    // const { data, error } = await client.auth.verifyOtp({
    //   token_hash: inviteCode,
    //   type: "invite",
    // });
    // if (data.session?.access_token && data.session?.refresh_token) {
    //   await client.auth.setSession({
    //     access_token: data.session.access_token,
    //     refresh_token: data.session.refresh_token,
    //   });
    // }
    // console.log("🚀 ~ Component ~ data:", JSON.stringify(data, null, 2));
    // console.log("🚀 ~ Component ~ error:", JSON.stringify(error, null, 2));
    return redirect("/acceptInvite?inviteCode=" + inviteCode);
    // if (data.user?.user_metadata.inviteId) {
    //   return redirect(
    //     "/acceptInvite?token=" + data.user?.user_metadata.inviteId
    //   );
    // }
  }

  console.log("🚀 ~ Component ~ search:", search);
  // console.log("🚀 ~ Component ~ search:", search.get("inviteCode"));

  const user = await client.auth.getUser();
  console.log("🚀 ~ user:", user);
  console.log(
    "🚀 ~ user.data.user.user_metadata:",
    user.data.user?.user_metadata
  );

  if (
    user.data.user &&
    user.data.user.email_confirmed_at &&
    user.data.user.user_metadata.organizationId
  ) {
    return redirect("/projects");
  } else if (
    user.data.user &&
    user.data.user.user_metadata.inviteId &&
    !user.data.user.user_metadata.acceptedInvite
    // true
  ) {
    return redirect(
      "/acceptInvite?token=" + user.data.user.user_metadata.inviteId
    );
  } else if (
    user.data.user &&
    user.data.user.email_confirmed_at &&
    !user.data.user.user_metadata.organizationId
  ) {
    return redirect("/register?page=3");
  } else if (user.data.user && !user.data.user.email_confirmed_at) {
    return redirect("/register?page=2");
  }

  return redirect("/login");
}
