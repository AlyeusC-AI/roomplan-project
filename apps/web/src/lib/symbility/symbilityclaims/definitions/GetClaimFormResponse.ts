import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Form } from "./Form";

/** GetClaimFormResponse */
export interface GetClaimFormResponse {
    /** GetClaimFormResult */
    GetClaimFormResult?: AddClaimAssigneeResult;
    /** form */
    form?: Form;
}
