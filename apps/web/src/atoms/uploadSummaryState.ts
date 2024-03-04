import { atom } from 'recoil'

type UploadSummary = {
  [roomName: string]: number
}
const uploadSummaryState = atom<UploadSummary>({
  key: 'UploadSummaryState',
  default: {},
})

export default uploadSummaryState
