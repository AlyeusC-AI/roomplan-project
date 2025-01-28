import { getLoggedInUserInfo } from "@lib/server-side-fetching/get-logged-in-user-info";
import getProjectStats from "@servicegeek/db/queries/project/getProjectStats";

import { Metadata } from "next";
import PerformancePage from "./main";

export const metadata: Metadata = {
  title: "Performance",
  description: "Access organization settings and manage your team",
  icons: ["/favicon.ico"],
};

declare global {
  interface ProjectStats {
    openedProjects: { cur: number; prev: number };
    closedProjects: { cur: number; prev: number };
  }
}

export default async function Component() {
  const props = await getLoggedInUserInfo(false, true, false, false);
  const stats = await getProjectStats(props.user?.org?.id!);
  return <PerformancePage {...props} projectStats={stats} />;
}
