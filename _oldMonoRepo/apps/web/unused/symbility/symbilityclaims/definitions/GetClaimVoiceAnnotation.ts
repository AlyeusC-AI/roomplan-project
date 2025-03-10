import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimVoiceAnnotation */
export interface GetClaimVoiceAnnotation {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    voiceAnnotationID?: string;
    /** VoiceAnnotationFormat|s:string|None,Wav */
    voiceAnnotationFormat?: string;
}
