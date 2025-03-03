import Roofing from "@components/Project/RoofingHail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hail",
  description: "Hail",
};

export default function Hail() {
  return <Roofing />;
}
