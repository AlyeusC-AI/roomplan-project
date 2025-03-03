import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { DiagramImportSpecification } from "./DiagramImportSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** ImportClaimDiagram */
export interface ImportClaimDiagram {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
    /** diagramImportSpecification */
    diagramImportSpecification?: DiagramImportSpecification;
}
