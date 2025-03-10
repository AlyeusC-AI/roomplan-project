"use client";

import { useMemo } from "react";
import SecondaryNavigation from "@components/layouts/SecondaryNavigation";
import {
  BookOpenIcon,
  CalendarIcon,
  CloudIcon,
  DollarSignIcon,
  FolderIcon,
  HomeIcon,
  NewspaperIcon,
  PictureInPicture,
} from "lucide-react";
import { useParams } from "next/navigation";
import { userInfoStore } from "@atoms/user-info";

export default function ProjectNavigationContainer() {
  const { id } = useParams();
  const userInfo = userInfoStore((state) => state.user);

  // if (
  //   user.org?.accessLevel !== AccessLevel.projectManager &&
  //   user.org?.accessLevel !== AccessLevel.admin &&
  //   user.org?.accessLevel !== AccessLevel.accountManager
  // ) {
  //   return {
  //     redirect: {
  //       destination: '/projects',
  //       permanent: false,
  //     },
  //   }
  // }

  const navigation = useMemo(
    () => [
      {
        name: "Overview",
        href: `/projects/${id}/overview`,
        icon: NewspaperIcon,
      },
      {
        name: "Files",
        href: `/projects/${id}/files`,
        icon: FolderIcon,
      },
      {
        name: "Photos",
        href: `/projects/${id}/photos`,
        icon: PictureInPicture,
      },
      {
        name: "Mitigation",
        href: `/projects/${id}/mitigation`,
        icon: BookOpenIcon,
      },
      ...(userInfo?.accessLevel === AccessLevel.projectManager ||
      userInfo?.accessLevel === AccessLevel.admin ||
      userInfo?.accessLevel === AccessLevel.accountManager
        ? [
            {
              name: "Expenses",
              href: `/projects/${id}/costs`,
              icon: DollarSignIcon,
            },
          ]
        : []),
      // {
      //   name: 'Inspection',
      //   href: `/projects/${id}/inspection`,
      //   icon: CalculatorIcon,
      // },
      // {
      //   name: 'Repairs',
      //   href: `#`,

      //   icon: CurrencyDollarIcon,
      // },
      {
        name: "Calendar",
        href: `/projects/${id}/calendar`,

        icon: CalendarIcon,
      },
      // {
      //   name: 'Property',
      //   href: `/projects/${id}/property-info`,
      //   icon: EyeIcon,
      // },
      {
        name: "Roofing",
        href: `/projects/${id}/roofing`,
        icon: HomeIcon,
      },
      {
        name: "Weather",
        href: `/projects/${id}/weather`,
        icon: CloudIcon,
      },
      {
        name: "Report",
        href: `/projects/${id}/report`,
        icon: BookOpenIcon,
      },
      // {
      //   name: 'Dimensions',
      //   href: `/projects/${id}/dimensions`,
      //   icon: ArrowsPointingInIcon,
      //   isComingSoon: true,
      // },
    ],
    [id, userInfo?.accessLevel]
  );

  // @ts-ignore
  return <SecondaryNavigation navigation={navigation} />;
}
