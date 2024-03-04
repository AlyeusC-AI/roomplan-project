import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
import getUser from '@restorationx/db/queries/user/getUser'
const fs = require('fs')
const { promisify } = require('util')

import { supabaseServiceRole } from './supabaseServiceRoleClient'

const deleteFileFromProject = async (
  userId: string,
  projectPublicId: string,
  filename: string
) => {
  const identishotUser = await getUser(userId)
  const organizationId = identishotUser?.org?.organization.id
  if (!organizationId) return null
  const project = await getProjectForOrg(projectPublicId, organizationId)
  if (!project) {
    return null
  }

  const { data, error } = await supabaseServiceRole.storage
    .from('user-files')
    .remove([filename])

  if (error) return null

  return data
}

export default deleteFileFromProject
