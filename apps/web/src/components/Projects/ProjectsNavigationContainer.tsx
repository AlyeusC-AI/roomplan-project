import { useMemo } from 'react'
import SecondaryNavigation from '@components/layouts/SecondaryNavigation'
import { WrenchScrewdriverIcon } from '@heroicons/react/20/solid'
import {
  ArrowPathIcon,
  CreditCardIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { AccessLevel } from '@restorationx/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

export default function ProjectsNavigationContainer() {
  const [userInfo] = useRecoilState(userInfoState)
  const router = useRouter()
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }

  const navigation = useMemo(() => {
    const navList = [
      {
        name: 'Account',
        href: '/settings/account',
        icon: UserCircleIcon,
      },
      {
        name: 'Equipment',
        href: '/settings/equipment',
        icon: WrenchScrewdriverIcon,
      },
    ]

    if (
      userInfo?.isAdmin ||
      userInfo?.accessLevel === AccessLevel.admin ||
      userInfo?.accessLevel === AccessLevel.accountManager ||
      userInfo?.isSupportUser
    ) {
      navList.push({
        name: 'Organization',
        href: '/settings/organization',
        icon: UserGroupIcon,
      })
    }
    if (
      userInfo?.isAdmin ||
      userInfo?.accessLevel === AccessLevel.admin ||
      userInfo?.accessLevel === AccessLevel.accountManager ||
      userInfo?.isSupportUser
    ) {
      navList.push({
        name: 'Workflow',
        href: '/settings/workflow',
        icon: ArrowPathIcon,
      })
    }
    if (userInfo?.isAdmin || userInfo?.accessLevel === AccessLevel.admin) {
      navList.push({
        name: 'Plan & Billing',
        href: '/settings/billing',
        icon: CreditCardIcon,
      })
    }
    return navList
  }, [userInfo?.accessLevel, userInfo?.isAdmin])

  return <SecondaryNavigation navigation={navigation} hideBackButton />
}
