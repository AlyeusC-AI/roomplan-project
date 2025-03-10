import { Metadata } from "next";
import WeatherPage from "./main";

export const metadata: Metadata = {
  title: "Weather",
  description: "Weather",
};

export default function Weather() {
  return <WeatherPage />;
}
