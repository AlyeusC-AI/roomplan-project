import { Metadata } from "next";
import ProjectList from "@components/Projects/ProjectList";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Access projects that you have integrated with ServiceGeek",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <Suspense>
      <ProjectList />
    </Suspense>
  );
}
