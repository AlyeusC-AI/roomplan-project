import getProjectImageUrl from '@utils/getProjectImageUrl'
import { useRecoilState } from 'recoil'
import presignedUrlMapState from '@atoms/presignedUrlMapState'

const useSupabaseImage = (path?: string) => {
  const [presignedUrlMap] = useRecoilState(presignedUrlMapState)
  if (!path) return null
  if (!presignedUrlMap[decodeURIComponent(path)])
    return getProjectImageUrl(path)
  return presignedUrlMap[decodeURIComponent(path)]
}

export default useSupabaseImage
