import { init, logEvent, track } from "@amplitude/analytics-browser";
import { getUserId, setUserId } from "@amplitude/analytics-browser";
import { userInfoStore } from "@atoms/user-info";

const useAmplitudeTrack = () => {
  const userInfo = userInfoStore((state) => state.user);
  const currentUserId = getUserId();

  if (userInfo?.email && userInfo.email !== currentUserId) {
    setUserId(userInfo.email);
  }

  return { track, logEvent, init };
};

export default useAmplitudeTrack;
