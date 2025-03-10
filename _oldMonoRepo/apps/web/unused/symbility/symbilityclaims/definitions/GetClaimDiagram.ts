import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { DiagramRenderOptions } from "./DiagramRenderOptions";

/** GetClaimDiagram */
export interface GetClaimDiagram {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    diagramID?: string;
    /** DiagramFormat|s:string|None,Png */
    diagramFormat?: string;
    /** diagramRenderOptions */
    diagramRenderOptions?: DiagramRenderOptions;
}
