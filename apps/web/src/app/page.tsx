import { createClient } from "@lib/supabase/server";
import { redirect } from "next/navigation";

// Exporting
export default async function Component() {
  const client = await createClient();

  const user = await client.auth.getUser();

  if (user.data.user) {
    return redirect("/projects");
  }

  return redirect("/login");
}
