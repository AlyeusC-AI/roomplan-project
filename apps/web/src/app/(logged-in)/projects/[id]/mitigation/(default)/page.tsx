import { Metadata } from "next";
import MitigationPage from "./main";

export const metadata: Metadata = {
  title: "Estimates",
  description: "Project Estimate and Details",
};

export default function Mitigation() {
  return <MitigationPage />;
}
