import { Metadata } from "next";
import DataDeletionRequest from "./main";

export const metadata: Metadata = {
  title: "Request Account Deletion",
  description: "A job management platform built for restoration",
};

export default async function Component() {
  return <DataDeletionRequest />;
}
