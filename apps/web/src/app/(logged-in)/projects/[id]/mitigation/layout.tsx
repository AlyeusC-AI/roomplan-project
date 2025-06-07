"use client";

import { LoadingPlaceholder } from "@components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = (id: string) => [
    { name: "Readings", href: `/projects/${id}/mitigation` },
    { name: "Notes", href: `/projects/${id}/mitigation/notes` },
    { name: "Scope", href: `/projects/${id}/mitigation/scope` },
    { name: "Equipment", href: `/projects/${id}/mitigation/equipment` },
  ];

  return (
    <>
      <Tabs
        defaultValue={tabs(id).find((tab) => pathname === tab.href)?.href}
        className='mb-5 min-w-[400px]'
        onValueChange={(value) => router.push(value)}
      >
        <TabsList>
          {tabs(id).map((tab) => (
            <TabsTrigger key={tab.name} value={tab.href}>
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </>
  );
}
