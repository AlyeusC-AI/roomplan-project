import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import getUser from '@servicegeek/db/queries/user/getUser'

import { supabaseServiceRole } from './supabaseServiceRoleClient'

const deleteFileFromProject = async (
  userId: string,
  projectPublicId: string,
  filename: string
) => {
  const servicegeekUser = await getUser(userId)
  const organizationId = servicegeekUser?.org?.organization.id
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
