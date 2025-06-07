import { Metadata } from "next";
import AcceptInvite from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Accept Invitation",
};

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInvite />
    </Suspense>
  );
}
