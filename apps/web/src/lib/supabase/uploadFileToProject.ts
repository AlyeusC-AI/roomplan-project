import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
import getUser from '@restorationx/db/queries/user/getUser'
import { File } from 'formidable'
const fs = require('fs').promises

import { supabaseServiceRole } from './supabaseServiceRoleClient'

const uploadFileToProject = async (
  userId: string,
  projectPublicId: string,
  file: File
) => {
  const identishotUser = await getUser(userId)
  const organizationId = identishotUser?.org?.organization.id
  if (!organizationId) return null
  const project = await getProjectForOrg(projectPublicId, organizationId)
  if (!project) {
    return null
  }

  const fsdata = await fs.readFile(file.filepath)
  const inputBuffer = Buffer.from(fsdata)

  console.log(
    'uploading data',
    `${identishotUser.org?.organization.publicId}/${projectPublicId}/${file.originalFilename}`
  )
  const { data, error } = await supabaseServiceRole.storage
    .from('user-files')
    .upload(
      `${identishotUser.org?.organization.publicId}/${projectPublicId}/${file.originalFilename}`,
      inputBuffer,
      {
        upsert: true,
        contentType: file.mimetype || undefined,
      }
    )

  if (error) {
    console.log('error uploading', error)
    return null
  }

  return data
}

export default uploadFileToProject
