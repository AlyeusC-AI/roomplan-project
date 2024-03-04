import getUser from '@restorationx/db/queries/user/getUser'
import { AccessLevel, DashboardViews } from '@restorationx/db'

export interface UserInfo {
  email: string
  firstName: string
  lastName: string
  phone: string
  organizationName: string
  accessLevel: AccessLevel
  isAdmin: boolean // Legacy
  hasSeenProductTour: boolean
  isSupportUser: boolean
  savedDashboardView: DashboardViews
  productTourData?: {
    [key: string]: boolean
  }
}

const getUserInfo = (user: Awaited<ReturnType<typeof getUser>>) => ({
  email: user!.email,
  firstName: user!.firstName,
  lastName: user!.lastName,
  phone: user!.phone,
  organizationName: user!.org?.organization.name || null,
  id: user!.id,
  accessLevel: user!.org?.accessLevel || null,
  isAdmin: user!.org?.isAdmin || null,
  hasSeenProductTour: user?.hasSeenProductTour || false,
  isSupportUser: user?.isSupportUser || false,
  savedDashboardView: user?.savedDashboardView || DashboardViews.listView,
  productTourData: user?.productTourData,
})

export default getUserInfo
