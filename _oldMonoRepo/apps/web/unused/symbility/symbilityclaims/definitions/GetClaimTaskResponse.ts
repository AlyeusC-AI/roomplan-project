import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Task } from "./Task";

/** GetClaimTaskResponse */
export interface GetClaimTaskResponse {
    /** GetClaimTaskResult */
    GetClaimTaskResult?: AddClaimAssigneeResult;
    /** task */
    task?: Task;
}
