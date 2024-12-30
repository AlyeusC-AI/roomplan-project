import { CalendarEventIdSpecification } from "./CalendarEventIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** DeleteCalendarEvent */
export interface DeleteCalendarEvent {
    /** calendarEventIDSpecification */
    calendarEventIDSpecification?: CalendarEventIdSpecification;
    /** creatorUserIDSpecification */
    creatorUserIDSpecification?: FromUserIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
}
