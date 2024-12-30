import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomDiagramSpecifications } from "./CustomDiagramSpecifications";
import { EstimateSpecification } from "./EstimateSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** CreateClaimEstimate */
export interface CreateClaimEstimate {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** customDiagramSpecifications */
    customDiagramSpecifications?: CustomDiagramSpecifications;
    /** estimateSpecification */
    estimateSpecification?: EstimateSpecification;
    /** creatorUserIDSpecification */
    creatorUserIDSpecification?: FromUserIdSpecification;
}
