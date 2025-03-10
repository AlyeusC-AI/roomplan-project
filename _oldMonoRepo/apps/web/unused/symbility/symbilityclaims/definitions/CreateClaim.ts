import { ClaimSpecification } from "./ClaimSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** CreateClaim */
export interface CreateClaim {
    /** claimSpecification */
    claimSpecification?: ClaimSpecification;
    /** creatorUserIDSpecification */
    creatorUserIDSpecification?: FromUserIdSpecification;
}
