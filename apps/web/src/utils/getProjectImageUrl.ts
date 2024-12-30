export const getBucketPath = (path: string) => {
  if (!path) return ''
  const newFormat = path.indexOf('project-images') !== 0
  if (newFormat) {
    // new
    return decodeURIComponent(path)
  }
  // legacy
  return decodeURIComponent(path).substring(
    decodeURIComponent(path).indexOf('/') + 1
  )
}

const getProjectImageUrl = (path: string) => {
  if (!path) return ''
  const newFormat = path.indexOf('project-images') !== 0
  if (newFormat) {
    // new
    return `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/project-images/${decodeURIComponent(path)}`
  }
  // legacy
  return `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public/project-images/${decodeURIComponent(
    path
  ).substring(decodeURIComponent(path).indexOf('/') + 1)}`
}

export default getProjectImageUrl
