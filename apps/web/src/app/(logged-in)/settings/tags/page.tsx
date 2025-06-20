import { Metadata } from "next";
import TagsPage from "./main";

export const metadata: Metadata = {
  title: "Tags Settings",
  description: "RestoreGeek tags management settings",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <div className='space-y-6'>
      <TagsPage />
    </div>
  );
}
