import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { CalendarEvents } from "./CalendarEvents";

/** GetCalendarEventsResponse */
export interface GetCalendarEventsResponse {
    /** GetCalendarEventsResult */
    GetCalendarEventsResult?: AddClaimAssigneeResult;
    /** calendarEvents */
    calendarEvents?: CalendarEvents;
}
