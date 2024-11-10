import { MoonLoader } from 'react-spinners'
import { InboxIcon } from '@heroicons/react/24/outline'
import { NotificationType } from '@servicegeek/db'
import { trpc } from '@utils/trpc'

import NotificationItem from './NotificationItem'

export default function ActivityList() {
  const getTeamActivity = trpc.notification.getNotifications.useQuery({
    type: NotificationType.activity,
  })
  return (
    <>
      {!getTeamActivity.data && (
        <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
          <MoonLoader />
        </div>
      )}
      {getTeamActivity.data && getTeamActivity.data.length > 0 && (
        <ul
          role="list"
          className="flex-1 divide-y divide-gray-200 overflow-y-auto"
        >
          {getTeamActivity &&
            getTeamActivity.data.map((d) => (
              <NotificationItem key={d.publicId} notification={d} />
            ))}
        </ul>
      )}
      {getTeamActivity.data && getTeamActivity.data.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
          <InboxIcon className=" h-20 w-20 text-gray-400" />
          <p className="mt-2 text-xl font-medium text-gray-900">No Activity</p>
          <p className=" mt-1 text-gray-500">
            Well keep you updated here with any key events that happen
          </p>
        </div>
      )}
    </>
  )
}
