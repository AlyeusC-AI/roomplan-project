import { CalendarEventIdSpecification } from "./CalendarEventIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetCalendarEvent */
export interface GetCalendarEvent {
    /** calendarEventIDSpecification */
    calendarEventIDSpecification?: CalendarEventIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
}
