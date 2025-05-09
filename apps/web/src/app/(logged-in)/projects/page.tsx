import { Metadata } from "next";
import ProjectList from "@components/Projects/ProjectList";
import { Suspense } from "react";
import { createClient } from "@lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Access projects that you have integrated with RestoreGeek",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  const client = await createClient();
  const session = await client.auth.getSession();
  console.log(session.data.session?.access_token);
  return <Suspense>{/* <ProjectList /> */}</Suspense>;
}
