"use server";

import { createClient } from "@lib/supabase/server";
import { redirect, RedirectType } from "next/navigation";

export async function verifyUserLoggedOut() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    return redirect("/projects", RedirectType.push);
  }
}
