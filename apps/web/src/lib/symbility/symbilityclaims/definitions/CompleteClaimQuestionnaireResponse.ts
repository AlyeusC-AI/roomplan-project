import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Questionnaire } from "./Questionnaire";

/** CompleteClaimQuestionnaireResponse */
export interface CompleteClaimQuestionnaireResponse {
    /** CompleteClaimQuestionnaireResult */
    CompleteClaimQuestionnaireResult?: AddClaimAssigneeResult;
    /** claimQuestionnaire */
    claimQuestionnaire?: Questionnaire;
}
