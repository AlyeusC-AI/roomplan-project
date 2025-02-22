import { Metadata } from "next";
import { AcceptInviteForm } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Accept Invitation",
};

export default async function Component() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
