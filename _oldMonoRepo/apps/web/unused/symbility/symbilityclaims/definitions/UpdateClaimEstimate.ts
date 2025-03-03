import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomDiagramSpecifications } from "./CustomDiagramSpecifications";
import { EstimateUpdateSpecification } from "./EstimateUpdateSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** UpdateClaimEstimate */
export interface UpdateClaimEstimate {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    estimateID?: string;
    /** customDiagramSpecifications */
    customDiagramSpecifications?: CustomDiagramSpecifications;
    /** estimateUpdateSpecification */
    estimateUpdateSpecification?: EstimateUpdateSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
