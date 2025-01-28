import { Metadata } from "next";
import FilesPage from "./main";

export const metadata: Metadata = {
  title: "Project Files",
  description: "Project Files",
};

export default function Files() {
  return <FilesPage />;
}
