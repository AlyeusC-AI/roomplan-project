import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** GetCalendarEvents */
export interface GetCalendarEvents {
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:dateTime */
    eventDateFrom?: string;
    /** s:dateTime */
    eventDateTo?: string;
}
