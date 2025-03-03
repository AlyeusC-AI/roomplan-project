import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Tasks } from "./Tasks";

/** GetClaimTaskListResponse */
export interface GetClaimTaskListResponse {
    /** GetClaimTaskListResult */
    GetClaimTaskListResult?: AddClaimAssigneeResult;
    /** tasks */
    tasks?: Tasks;
}
