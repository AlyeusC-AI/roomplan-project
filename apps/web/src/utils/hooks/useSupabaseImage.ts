import getProjectImageUrl from '@utils/getProjectImageUrl'
import { urlMapStore } from '@atoms/url-map'

const useSupabaseImage = (path?: string) => {
  const presignedUrlMap = urlMapStore(state => state.urlMap)
  if (!path) return null
  if (!presignedUrlMap[decodeURIComponent(path)])
    return getProjectImageUrl(path)
  return presignedUrlMap[decodeURIComponent(path)]
}

export default useSupabaseImage
