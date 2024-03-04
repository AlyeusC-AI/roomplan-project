import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";

/** CreateClaimTaskResponse */
export interface CreateClaimTaskResponse {
    /** CreateClaimTaskResult */
    CreateClaimTaskResult?: AddClaimAssigneeResult;
    /** s:int */
    taskID?: string;
}
