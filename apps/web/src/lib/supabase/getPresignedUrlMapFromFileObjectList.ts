import { FileObject } from '@supabase/storage-js'

import { supabaseServiceRole } from './supabaseServiceRoleClient'

const getPresignedUrlMapFromFileObjectList = async (
  files: FileObject[],
  prefix: string,
  from: string
) => {
  const keys = files.reduce((prev, cur) => {
    return [...prev, decodeURIComponent(`${prefix}${cur.name}`)]
  }, [] as string[])
  const { data, error } = await supabaseServiceRole.storage
    .from(from)
    .createSignedUrls(keys, 1800)

  const urlMap = !data
    ? {}
    : data.reduce<PresignedUrlMap>((p, c) => {
        if (c.error) return p
        if (!c.path) return p
        return {
          [c.path.substring(c.path.lastIndexOf('/') + 1)]: c.signedUrl,
          ...p,
        }
      }, {})
  console.log(urlMap)
  return urlMap
}

export default getPresignedUrlMapFromFileObjectList
