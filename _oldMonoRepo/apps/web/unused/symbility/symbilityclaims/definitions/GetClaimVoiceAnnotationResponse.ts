import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { VoiceAnnotation } from "./VoiceAnnotation";

/** GetClaimVoiceAnnotationResponse */
export interface GetClaimVoiceAnnotationResponse {
    /** GetClaimVoiceAnnotationResult */
    GetClaimVoiceAnnotationResult?: AddClaimAssigneeResult;
    /** voiceAnnotation */
    voiceAnnotation?: VoiceAnnotation;
}
