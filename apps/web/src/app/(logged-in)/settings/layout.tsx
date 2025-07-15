import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Separator } from "@components/ui/separator";

const sidebarNavItems = [
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Organization",
    href: "/settings/organization",
  },
  {
    title: "Billing",
    href: "/settings/billing",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Workflows",
    href: "/settings/workflow",
  },
  {
    title: "Tags",
    href: "/settings/tags",
  },
  {
    title: "Equipment",
    href: "/settings/equipment",
  },
];

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <div className='md:hidden'></div>
      <div className='hidden space-y-6 pb-16 pl-5 md:block'>
        <div className='space-y-0.5'>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>Settings</h2>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-6' />
        <div className=''>
          <aside className=''>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className=''>{children}</div>
        </div>
      </div>
    </>
  );
}
