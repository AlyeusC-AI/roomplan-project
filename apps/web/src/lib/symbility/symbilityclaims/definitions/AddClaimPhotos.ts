import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";
import { PhotoSpecifications } from "./PhotoSpecifications";

/** AddClaimPhotos */
export interface AddClaimPhotos {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
    /** s:string */
    photoPageName?: string;
    /** photoSpecifications */
    photoSpecifications?: PhotoSpecifications;
}
