import { Metadata } from "next";
import { ResetPassword } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function Component() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}