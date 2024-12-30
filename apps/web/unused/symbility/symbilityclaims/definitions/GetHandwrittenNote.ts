import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetHandwrittenNote */
export interface GetHandwrittenNote {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    handwrittenNoteID?: string;
    /** HandwrittenNoteFormat|s:string|None,Png,Pdf */
    handwrittenNoteFormat?: string;
}
