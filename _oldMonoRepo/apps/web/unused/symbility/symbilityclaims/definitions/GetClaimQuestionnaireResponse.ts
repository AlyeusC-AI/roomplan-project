import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Questionnaire } from "./Questionnaire";

/** GetClaimQuestionnaireResponse */
export interface GetClaimQuestionnaireResponse {
    /** GetClaimQuestionnaireResult */
    GetClaimQuestionnaireResult?: AddClaimAssigneeResult;
    /** claimQuestionnaire */
    claimQuestionnaire?: Questionnaire;
}
