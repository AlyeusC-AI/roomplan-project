import { CreatorCompany } from "./CreatorCompany";
import { CreatorUser } from "./CreatorUser";
import { Users } from "./Users";

/**
 * calendarEvent
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface CalendarEvent {
    /** CreatorUser */
    CreatorUser?: CreatorUser;
    /** CreatorCompany */
    CreatorCompany?: CreatorCompany;
    /** Attendees */
    Attendees?: Users;
}
