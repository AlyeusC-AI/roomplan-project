import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Diagrams } from "./Diagrams";

/** ImportClaimDiagramResponse */
export interface ImportClaimDiagramResponse {
    /** ImportClaimDiagramResult */
    ImportClaimDiagramResult?: AddClaimAssigneeResult;
    /** diagrams */
    diagrams?: Diagrams;
}
