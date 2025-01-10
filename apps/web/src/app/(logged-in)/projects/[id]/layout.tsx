"use client"

import { SidebarNav } from '@/components/ui/sidebar-nav'
import { projectsStore } from '@atoms/projects'
import { Separator } from '@components/ui/separator'
import { useParams } from 'next/navigation'

export default function Layout({ children }: React.PropsWithChildren) {

  const { id } = useParams()

  const projects = projectsStore((state) => state.projects)

  const sidebarNavItems = () => [
    {
      title: 'Overview',
      href: `projects/${id}/overview`
    },
    {
      title: 'Files',
      href: `projects/${id}/files`
    },
    {
      title: 'Photos',
      href: `projects/${id}/photos`
    },
    {
      title: 'Mitigation',
      href: `projects/${id}/mitigation`
    },
    {
      title: 'Expenses',
      href: `projects/${id}/expenses`
    },
    {
      title: 'Calendar',
      href: `projects/${id}/calendar`
    },
    {
      title: 'Roofing',
      href: `projects/${id}/roofing`
    },
    {
      title: 'Weather',
      href: `projects/${id}/weather`
    },
    {
      title: 'Report',
      href: `projects/${id}/report`
    }
  ];

  return (
    <>
      <div className="hidden space-y-6 pl-5 pb-16 md:block">
        <div className="space-y-0.5 fixed bg-white z-20 w-full">
          <h2 className="text-2xl font-bold tracking-tight mt-4">{projects.find((val) => val.publicId === id)?.name ?? ""}</h2>
          <p className="text-muted-foreground">
            Manage your project details.
          </p>
        </div>
        <div className='pt-10 bg-white z-20'>
        <Separator className="my-12 fixed mt-10 " />
        </div>
        <div className="flex flex-col space-y-8 pt-10 lg:flex-row lg:gap-x-12 lg:space-y-0 w-full">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav className=' fixed' items={sidebarNavItems()} />
          </aside>
          <div className="flex-1 lg:max-w-2xl mt-10">{children}</div>
        </div>
      </div>
    </>
  )
}
