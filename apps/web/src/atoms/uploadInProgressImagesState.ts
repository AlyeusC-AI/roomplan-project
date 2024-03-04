import { atom } from 'recoil'
import { uploadInProgressImages } from '@pages/projects/[id]/photos'

const uploadInProgressImagesState = atom<uploadInProgressImages[]>({
  key: 'UploadInProgressImagesState',
  default: [],
})
export default uploadInProgressImagesState
