import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { ClaimQuestionnaireSpecification } from "./ClaimQuestionnaireSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimQuestionnaire */
export interface AddClaimQuestionnaire {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** claimQuestionnaireSpecification */
    claimQuestionnaireSpecification?: ClaimQuestionnaireSpecification;
}
