import { ClaimDocumentSpecification } from "./ClaimDocumentSpecification";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimDocument_v2 */
export interface GetClaimDocumentV2 {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:string */
    printProfileName?: string;
    /** claimDocumentSpecification */
    claimDocumentSpecification?: ClaimDocumentSpecification;
}
