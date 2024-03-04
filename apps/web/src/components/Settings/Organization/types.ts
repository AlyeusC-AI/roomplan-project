import { AccessLevel } from '@restorationx/db'

export interface Member {
  createdAt?: Date
  isAdmin: boolean
  accessLevel: AccessLevel
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
}

export interface Invitation {
  email: string
}
