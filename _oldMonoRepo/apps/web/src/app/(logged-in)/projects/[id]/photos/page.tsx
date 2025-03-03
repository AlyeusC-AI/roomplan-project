import { Metadata } from "next";
import EstimatePage from "./main";

export const metadata: Metadata = {
  title: "Estimates",
  description: "Project Estimate and Details",
};

export default function Photos() {
  return <EstimatePage />;
}
