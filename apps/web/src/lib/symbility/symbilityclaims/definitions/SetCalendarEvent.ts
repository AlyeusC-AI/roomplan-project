import { CalendarEventIdSpecification } from "./CalendarEventIdSpecification";
import { CalendarEventUpdateSpecification } from "./CalendarEventUpdateSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetCalendarEvent */
export interface SetCalendarEvent {
    /** calendarEventIDSpecification */
    calendarEventIDSpecification?: CalendarEventIdSpecification;
    /** creatorUserIDSpecification */
    creatorUserIDSpecification?: FromUserIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** calendarEventUpdateSpecification */
    calendarEventUpdateSpecification?: CalendarEventUpdateSpecification;
    /** s:boolean */
    allowConflict?: string;
}
