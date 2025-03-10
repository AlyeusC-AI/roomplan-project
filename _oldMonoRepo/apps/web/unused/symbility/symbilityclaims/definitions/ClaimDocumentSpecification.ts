import { EstimateItemNoteIDsToDelete } from "./EstimateItemNoteIDsToDelete";

/**
 * claimDocumentSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimDocumentSpecification {
    /** DiagramIDs */
    DiagramIDs?: EstimateItemNoteIDsToDelete;
    /** EstimateIDs */
    EstimateIDs?: EstimateItemNoteIDsToDelete;
    /** HandwrittenNoteIDs */
    HandwrittenNoteIDs?: EstimateItemNoteIDsToDelete;
    /** PhotoPageIDs */
    PhotoPageIDs?: EstimateItemNoteIDsToDelete;
    /** FormIDs */
    FormIDs?: EstimateItemNoteIDsToDelete;
    /** PaymentIDs */
    PaymentIDs?: EstimateItemNoteIDsToDelete;
}
