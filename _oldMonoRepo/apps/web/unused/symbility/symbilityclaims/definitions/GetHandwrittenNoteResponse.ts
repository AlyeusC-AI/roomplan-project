import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { HandwrittenNote } from "./HandwrittenNote";

/** GetHandwrittenNoteResponse */
export interface GetHandwrittenNoteResponse {
    /** GetHandwrittenNoteResult */
    GetHandwrittenNoteResult?: AddClaimAssigneeResult;
    /** handwrittenNote */
    handwrittenNote?: HandwrittenNote;
}
