import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { ExternalDocumentSpecification } from "./ExternalDocumentSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimExternalDocument */
export interface AddClaimExternalDocument {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
    /** externalDocumentSpecification */
    externalDocumentSpecification?: ExternalDocumentSpecification;
}
