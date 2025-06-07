import { Metadata } from "next";
import Roofing from "@components/Project/RoofingWind";

export const metadata: Metadata = {
  title: "Wind",
  description: "Wind",
};

const WindPage = () => {
  return <Roofing />;
};

export default WindPage;
