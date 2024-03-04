import { AccessLevel } from '@restorationx/db'

export const RoleToDescription = {
  [AccessLevel.admin]: 'Account Administrator',
  [AccessLevel.accountManager]: 'Account Manager',
  [AccessLevel.projectManager]: 'Project Manager',
  [AccessLevel.contractor]: 'Contractor',
  [AccessLevel.viewer]: 'Viewer',
}
