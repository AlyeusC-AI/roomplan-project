import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimQuestionnaire */
export interface GetClaimQuestionnaire {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    questionnaireID?: string;
    /** s:boolean */
    includeHiddenQuestions?: string;
}
