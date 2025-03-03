import { CalendarEventSpecification } from "./CalendarEventSpecification";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** CreateCalendarEvent */
export interface CreateCalendarEvent {
    /** calendarEventSpecification */
    calendarEventSpecification?: CalendarEventSpecification;
    /** creatorUserIDSpecification */
    creatorUserIDSpecification?: FromUserIdSpecification;
    /** creatorCompanyIDSpecification */
    creatorCompanyIDSpecification?: CompanyIdSpecification;
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:boolean */
    allowConflict?: string;
}
