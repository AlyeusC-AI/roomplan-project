import ProjectMapView from "./main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
};

export default async function Component() {
  return <ProjectMapView />;
}
