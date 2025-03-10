import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";
import { TaskUpdateSpecification } from "./TaskUpdateSpecification";

/** UpdateClaimTask */
export interface UpdateClaimTask {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    taskID?: string;
    /** taskUpdateSpecification */
    taskUpdateSpecification?: TaskUpdateSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
