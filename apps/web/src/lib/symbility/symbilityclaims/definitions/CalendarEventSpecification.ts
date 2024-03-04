import { Attendees } from "./Attendees";

/**
 * calendarEventSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface CalendarEventSpecification {
    /** Attendees */
    Attendees?: Attendees;
}
