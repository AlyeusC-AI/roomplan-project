import { Metadata } from "next";
import AccessRevokedPage from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "Access Denied",
  icons: ["/favicon.ico"],
};

export default function Component() {
  return (
    <Suspense>
      <AccessRevokedPage />
    </Suspense>
  );
}
