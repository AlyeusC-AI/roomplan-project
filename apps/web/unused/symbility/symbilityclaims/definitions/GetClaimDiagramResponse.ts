import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Diagram } from "./Diagram";

/** GetClaimDiagramResponse */
export interface GetClaimDiagramResponse {
    /** GetClaimDiagramResult */
    GetClaimDiagramResult?: AddClaimAssigneeResult;
    /** diagram */
    diagram?: Diagram;
}
