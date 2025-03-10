import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { CalendarEvent } from "./CalendarEvent";

/** GetCalendarEventResponse */
export interface GetCalendarEventResponse {
    /** GetCalendarEventResult */
    GetCalendarEventResult?: AddClaimAssigneeResult;
    /** calendarEvent */
    calendarEvent?: CalendarEvent;
}
