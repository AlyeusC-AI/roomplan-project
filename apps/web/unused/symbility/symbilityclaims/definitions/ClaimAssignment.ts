import { CreatorCompany } from "./CreatorCompany";
import { CreatorUser } from "./CreatorUser";
import { CustomFields } from "./CustomFields";
import { Diagrams } from "./Diagrams";
import { Estimates } from "./Estimates";
import { ExternalDocuments } from "./ExternalDocuments";
import { Forms } from "./Forms";
import { HandwrittenNotes } from "./HandwrittenNotes";
import { PhotoPages } from "./PhotoPages";
import { Questionnaires } from "./Questionnaires";

/**
 * ClaimAssignment
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimAssignment {
    /** AssignedBy */
    AssignedBy?: CreatorCompany;
    /** Assignee */
    Assignee?: CreatorCompany;
    /** InternalAssignee */
    InternalAssignee?: CreatorUser;
    /** s:dateTime */
    AssignmentSentDate?: string;
    /** s:dateTime */
    AssignmentReceivedDate?: string;
    /** s:dateTime */
    InsuredContactedDate?: string;
    /** s:dateTime */
    InsuredContactedUserDate?: string;
    /** s:dateTime */
    InspectionScheduledDate?: string;
    /** s:dateTime */
    InspectionScheduledUserDate?: string;
    /** s:dateTime */
    InspectionAppointmentDate?: string;
    /** s:dateTime */
    InspectionPerformedDate?: string;
    /** s:dateTime */
    InspectionPerformedUserDate?: string;
    /** s:dateTime */
    MitigationWorkStartedDate?: string;
    /** s:dateTime */
    MitigationWorkStartedUserDate?: string;
    /** s:dateTime */
    MitigationWorkCompletedDate?: string;
    /** s:dateTime */
    MitigationWorkCompletedUserDate?: string;
    /** s:dateTime */
    EstimateReadyForReviewDate?: string;
    /** s:dateTime */
    EstimateCompletedDate?: string;
    /** s:dateTime */
    EstimateApprovedDate?: string;
    /** s:dateTime */
    JobScheduledDate?: string;
    /** s:dateTime */
    JobScheduledUserDate?: string;
    /** s:dateTime */
    JobNotSoldDate?: string;
    /** s:dateTime */
    JobStartedDate?: string;
    /** s:dateTime */
    JobStartedUserDate?: string;
    /** s:dateTime */
    JobCompletedDate?: string;
    /** s:dateTime */
    JobCompletedUserDate?: string;
    /** s:dateTime */
    JobScheduledJobStartDate?: string;
    /** s:dateTime */
    JobScheduledJobCompleteDate?: string;
    /** s:dateTime */
    AssignmentCompletedDate?: string;
    /** s:dateTime */
    AssignmentCancelledDate?: string;
    /** s:dateTime */
    AssignmentReopenedDate?: string;
    /** CustomFields */
    CustomFields?: CustomFields;
    /** Diagrams */
    Diagrams?: Diagrams;
    /** Estimates */
    Estimates?: Estimates;
    /** PhotoPages */
    PhotoPages?: PhotoPages;
    /** Forms */
    Forms?: Forms;
    /** ExternalDocuments */
    ExternalDocuments?: ExternalDocuments;
    /** HandwrittenNotes */
    HandwrittenNotes?: HandwrittenNotes;
    /** Questionnaires */
    Questionnaires?: Questionnaires;
}
