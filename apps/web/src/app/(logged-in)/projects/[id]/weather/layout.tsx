"use client";

import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = (id: string) => [
    { name: "Wind maps", href: `/projects/${id}/weather` },
    { name: "Hail reports", href: `/projects/${id}/weather/hail` },
    { name: "Wind reports", href: `/projects/${id}/weather/wind` },
    { name: "Tornado reports", href: `/projects/${id}/weather/tornado` },
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
