import { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import { atom } from 'recoil'

export const defaultUserInfoState = undefined

const userInfoState = atom<UserInfo | undefined>({
  key: 'UserInfoState',
  default: defaultUserInfoState,
})

export default userInfoState
