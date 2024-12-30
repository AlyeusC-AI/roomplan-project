import Banner from '@components/DesignSystem/Banner'
import { AccessLevel } from '@servicegeek/db'
import { userInfoStore } from '@atoms/user-info'

const TrailEndedBanner = () => {
  const userInfo = userInfoStore((state) => state.user)

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
            Please upgrade to a paid subscription to continue to use ServiceGeek
          </>
        ) : (
          <>
            Please contact your account administrator to upgrade to a paid
            subscription to continue to use ServiceGeek
          </>
        )}
      </>
    </Banner>
  )
}

export default TrailEndedBanner
