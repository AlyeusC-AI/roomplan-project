import { Metadata } from "next";
import UpdatePassword from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Update Password",
};

export default function Component() {
  return (
    <Suspense>
      <UpdatePassword />
    </Suspense>
  );
}
