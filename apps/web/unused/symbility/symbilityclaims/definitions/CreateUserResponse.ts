import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { UserProfile } from "./UserProfile";

/** CreateUserResponse */
export interface CreateUserResponse {
    /** CreateUserResult */
    CreateUserResult?: AddClaimAssigneeResult;
    /** userProfile */
    userProfile?: UserProfile;
}
