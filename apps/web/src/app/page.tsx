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
  const client = await createClient();
  const search = await searchParams;
  const inviteCode = search.inviteCode;
  if (inviteCode) {
    return redirect("/acceptInvite?inviteCode=" + inviteCode);
  }

  const user = await client.auth.getUser();
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
