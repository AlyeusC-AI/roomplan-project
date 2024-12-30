import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimPhoto */
export interface GetClaimPhoto {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    photoID?: string;
    /** PhotoFormat|s:string|None,Jpeg */
    photoFormat?: string;
}
