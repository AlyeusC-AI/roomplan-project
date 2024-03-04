import OrgMembersSection from './TeamManagement/OrgMembersSection'
import OrgSettingsSection from './OrgSettingsSection'
import { Invitation } from './types'

interface OrganizationProps {
  invitations: Invitation[]
}

export default function Organization({ invitations }: OrganizationProps) {
  return (
    <>
      {/* Payment details */}
      <div className="flex flex-col">
        <OrgSettingsSection />
        <OrgMembersSection invitations={invitations} />
      </div>
    </>
  )
}
