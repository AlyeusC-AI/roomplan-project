import { atom } from 'recoil'
import { PresignedUrlMap } from '@pages/projects/[id]/photos'

const presignedUrlMapState = atom<PresignedUrlMap>({
  key: 'PresignedUrlMapState',
  default: {},
})

export default presignedUrlMapState
