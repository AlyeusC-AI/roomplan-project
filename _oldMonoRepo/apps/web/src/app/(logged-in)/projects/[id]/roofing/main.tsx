"use client";

import TabNavigation from "@components/layouts/TabNavigation";
import Roofing from "@components/Project/Roofing";

export default function RoofingPage() {
  return (
    <>
      <TabNavigation
        tabs={(id: string) => [
          { name: "Report", href: `/projects/${id}/roofing` },
          { name: "3D", href: `/projects/${id}/roofing-3d` },
        ]}
      />
      <Roofing />
    </>
  );
};