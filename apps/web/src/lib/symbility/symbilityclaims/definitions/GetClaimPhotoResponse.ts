import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Photos } from "./Photos";

/** GetClaimPhotoResponse */
export interface GetClaimPhotoResponse {
    /** GetClaimPhotoResult */
    GetClaimPhotoResult?: AddClaimAssigneeResult;
    /** photo */
    photo?: Photos;
}
