import { router } from "../../trpc";

import getNotifications from "./getNotifications";
import getUnreadNotificationCount from "./getUnreadNotificationCount";
import setNotificationsAsSeen from "./setNotificationsAsSeen";

export const notificationRouter = router({
  getNotifications,
  getUnreadNotificationCount,
  setNotificationsAsSeen,
});
