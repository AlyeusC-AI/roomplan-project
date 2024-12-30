import { DashboardViews } from "@servicegeek/db"
import { JSONObject, JSONArray, JSONValue } from "superjson/dist/types"

declare global {
  declare type AccessLevel = | 'admin' | 'removed' | 'viewer' | "projectManager" | 'accountManager' | 'contractor'
  interface UserInfo {
    id: string
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
    productTourData?: JSONValue
  }

  interface InviteStatus {
    accepted: boolean
    inviteId: string
  }
}
