import { Metadata } from "next";
import OverviewPage from "./main";

export const metadata: Metadata = {
  title: "Overview",
  description: "Project Estimate and Details",
};

export default function Overview() {
  return <OverviewPage />;
}
