import { useMemo } from 'react'
import SecondaryNavigation from '@components/layouts/SecondaryNavigation'
import {
  BookOpenIcon,
  CalendarIcon,
  CloudIcon,
  CurrencyDollarIcon,
  FolderIcon,
  HomeModernIcon,
  NewspaperIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { AccessLevel } from '@servicegeek/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

export default function ProjectNavigationContainer() {
  const router = useRouter()
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }
  const [userInfo] = useRecoilState(userInfoState)

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
        name: 'Overview',
        href: `/projects/${id}/overview`,
        icon: NewspaperIcon,
      },
      {
        name: 'Files',
        href: `/projects/${id}/files`,
        icon: FolderIcon,
      },
      {
        name: 'Photos',
        href: `/projects/${id}/photos`,
        icon: PhotoIcon,
      },
      {
        name: 'Mitigation',
        href: `/projects/${id}/mitigation`,
        icon: BookOpenIcon,
      },
      ...(userInfo?.accessLevel === AccessLevel.projectManager ||
      userInfo?.accessLevel === AccessLevel.admin ||
      userInfo?.accessLevel === AccessLevel.accountManager
        ? [
            {
              name: 'Expenses',
              href: `/projects/${id}/costs`,
              icon: CurrencyDollarIcon,
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
        name: 'Calendar',
        href: `/projects/${id}/calendar`,

        icon: CalendarIcon,
      },
      // {
      //   name: 'Property',
      //   href: `/projects/${id}/property-info`,
      //   icon: EyeIcon,
      // },
      {
        name: 'Roofing',
        href: `/projects/${id}/roofing`,
        icon: HomeModernIcon,
      },
      {
        name: 'Weather',
        href: `/projects/${id}/weather`,
        icon: CloudIcon,
      },
      {
        name: 'Report',
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
  )

  return <SecondaryNavigation navigation={navigation} />
}
