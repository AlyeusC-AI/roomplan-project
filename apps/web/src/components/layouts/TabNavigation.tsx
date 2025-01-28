"use client";

import clsx from "clsx";
import { useParams, usePathname } from "next/navigation";

export default function TabNavigation({
  tabs,
}: {
  tabs?: (id: string) => { name: string; href: string }[];
}) {
  const defaultTabs = (id: string) => [
    { name: "Overview", href: `/projects/${id}/overview` },
  ];
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  return (
    <div>
      <div className='hidden sm:block'>
        <div className='border-b border-gray-200 px-8'>
          <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
            {(tabs ? tabs(id) : defaultTabs(id)).map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={clsx(
                  "border-transparent text-gray-500 hover:border-gray-300",
                  "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                )}
                aria-current={tab.href === pathname ? "page" : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
