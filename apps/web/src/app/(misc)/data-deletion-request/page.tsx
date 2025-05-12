import { Metadata } from "next";
import DataDeletionRequest from "./main";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Request Account Deletion",
  description: "A job management platform built for restoration",
};

export default function Component() {
  return (
    <Suspense>
      <DataDeletionRequest />
    </Suspense>
  );
}
