import { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import { atom } from 'recoil'

export const defaultOrgInfoState = {
  name: '',
  number: '',
  address: '',
  publicId: '',
  logoId: '',
}
const orgInfoState = atom<OrgInfo>({
  key: 'OrgInfoState',
  default: defaultOrgInfoState,
})

export default orgInfoState
