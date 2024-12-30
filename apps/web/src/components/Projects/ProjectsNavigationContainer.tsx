import { useMemo } from 'react'
import SecondaryNavigation from '@components/layouts/SecondaryNavigation'
import { WrenchIcon } from 'lucide-react'
import {
  ArrowUp,
  CreditCardIcon,
  UserCircleIcon,
  User2,
} from 'lucide-react'
import { AccessLevel } from '@servicegeek/db'
import { useParams } from 'next/navigation'
import { userInfoStore } from '@atoms/user-info'

export default function ProjectsNavigationContainer() {
  const userInfo = userInfoStore((state) => state.user)
  const router = useParams()
  let id = router?.id || ''
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
        icon: WrenchIcon,
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
        icon: User2,
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
        icon: ArrowUp,
      })
    }
    if (
      process.env.PRICING_ENABLED === 'true' &&
      (userInfo?.isAdmin || userInfo?.accessLevel === AccessLevel.admin)
    ) {
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
