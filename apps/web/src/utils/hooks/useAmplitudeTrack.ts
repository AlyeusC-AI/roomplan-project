import { init, logEvent, track } from '@amplitude/analytics-browser'
import { getUserId, setUserId } from '@amplitude/analytics-browser'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

const useAmplitudeTrack = () => {
  const [userInfo] = useRecoilState(userInfoState)
  const currentUserId = getUserId()

  if (userInfo?.email && userInfo.email !== currentUserId) {
    setUserId(userInfo.email)
  }

  return { track, logEvent, init }
}

export default useAmplitudeTrack
