interface OrgInfo {
  name: string
  address: string
  publicId: string
  logoId: string | null
}

interface Member {
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

interface Invitation {
  email: string
}
