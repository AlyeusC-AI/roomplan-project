import { useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { InboxIcon } from "lucide-react";
// import { NotificationType } from '@servicegeek/db'
import { trpc } from "@utils/trpc";

import NotificationItem from "./NotificationItem";

export default function NotificationList() {
  const utils = trpc.useContext();
  const getNotifications = trpc.notification.getNotifications.useQuery({
    type: "notification",
  });
  const setNotificationsAsSeen =
    trpc.notification.setNotificationsAsSeen.useMutation();
  const { data } = getNotifications;

  useEffect(() => {
    const setAsViewed = async () => {
      if (
        setNotificationsAsSeen.isSuccess ||
        setNotificationsAsSeen.isLoading
      ) {
        return;
      }
      await setNotificationsAsSeen.mutateAsync();
      utils.notification.getUnreadNotificationCount.invalidate();
    };
    setTimeout(() => {
      setAsViewed();
    }, 3000);
  }, [setNotificationsAsSeen, utils.notification.getUnreadNotificationCount]);
  return (
    <>
      {!data && (
        <div className='flex size-full flex-col items-center justify-center px-8 text-center'>
          <MoonLoader />
        </div>
      )}
      {data && data.length > 0 && (
        <ul
          role='list'
          className='flex-1 divide-y divide-gray-200 overflow-y-auto'
        >
          {data &&
            data.map((d) => (
              <NotificationItem key={d.publicId} notification={d} />
            ))}
        </ul>
      )}
      {data && data.length === 0 && (
        <div className='flex size-full flex-col items-center justify-center px-8 text-center'>
          <InboxIcon className='size-20 text-gray-400' />
          <p className='mt-2 text-xl font-medium text-gray-900'>
            No Notifications
          </p>
          <p className='mt-1 text-gray-500'>
            Well keep you updated here with any key events that happen
          </p>
        </div>
      )}
    </>
  );
}
