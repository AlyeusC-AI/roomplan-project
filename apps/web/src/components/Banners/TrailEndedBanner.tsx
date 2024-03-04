import Banner from '@components/DesignSystem/Banner'
import { AccessLevel } from '@restorationx/db'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

const TrailEndedBanner = () => {
  const [userInfo] = useRecoilState(userInfoState)

  return (
    <Banner
      title="Trial ended"
      variant="alert"
      {...((userInfo?.accessLevel === AccessLevel.admin ||
        userInfo?.isAdmin) && {
        cta: {
          text: 'Upgrade Now',
          href: '/pricing',
        },
      })}
    >
      <>
        {userInfo?.accessLevel === AccessLevel.admin || userInfo?.isAdmin ? (
          <>
            Please upgrade to a paid subscription to continue to use
            RestorationX
          </>
        ) : (
          <>
            Please contact your account administrator to upgrade to a paid
            subscription to continue to use RestorationX
          </>
        )}
      </>
    </Banner>
  )
}

export default TrailEndedBanner
