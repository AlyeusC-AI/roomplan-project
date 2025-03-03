import { ClaimAssignments } from "./ClaimAssignments";
import { ClaimPayments } from "./ClaimPayments";
import { Coverages } from "./Coverages";
import { CreatorCompany } from "./CreatorCompany";
import { CreatorUser } from "./CreatorUser";
import { CustomFields } from "./CustomFields";
import { DelegatedAuthority } from "./DelegatedAuthority";
import { Diagrams } from "./Diagrams";
import { Estimates } from "./Estimates";
import { ExternalDocuments } from "./ExternalDocuments";
import { Forms } from "./Forms";
import { GermanyAdditionalFields } from "./GermanyAdditionalFields";
import { GuestCompany } from "./GuestCompany";
import { HandwrittenNotes } from "./HandwrittenNotes";
import { InsuredAddress } from "./InsuredAddress";
import { InsuredContact } from "./InsuredContact";
import { InternalAssignees } from "./InternalAssignees";
import { ItemDatabases } from "./ItemDatabases";
import { JournalEntries } from "./JournalEntries";
import { MinimumCharge } from "./MinimumCharge";
import { OverheadAndProfitInfo } from "./OverheadAndProfitInfo";
import { PhotoPages } from "./PhotoPages";
import { QuestionAnswers } from "./QuestionAnswers";
import { Questionnaires } from "./Questionnaires";
import { TaxInfo } from "./TaxInfo";
import { UploadStatus } from "./UploadStatus";
import { VoiceAnnotations } from "./VoiceAnnotations";

/**
 * claim
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Claim {
    /** ItemDatabases */
    ItemDatabases?: ItemDatabases;
    /** InternalAssignees */
    InternalAssignees?: InternalAssignees;
    /** HandwrittenNotes */
    HandwrittenNotes?: HandwrittenNotes;
    /** ExternalDocuments */
    ExternalDocuments?: ExternalDocuments;
    /** GuestCompany */
    GuestCompany?: GuestCompany;
    /** s:dateTime */
    ClosedDate?: string;
    /** s:int */
    BuiltYear?: string;
    /** PhoneType|s:string|None,Home,Business,Mobile,Other,Unknown */
    InsuredPreferredPhone?: string;
    /** Language|s:string|English,French,EnglishUnitedKingdom,German,EnglishAustralia,Polish,Dutch,Japanese,Flemish,FrenchFrance */
    InsuredLanguage?: string;
    /** InsuredAddress */
    InsuredAddress?: InsuredAddress;
    /** LossAddress */
    LossAddress?: InsuredAddress;
    /** ClaimOverallRiskCondition|s:string|None,Excellent,Average,Poor,SeeComments,Unknown */
    OverallRiskCondition?: string;
    /** TaxInfo */
    TaxInfo?: TaxInfo;
    /** OverheadAndProfitInfo */
    OverheadAndProfitInfo?: OverheadAndProfitInfo;
    /** ContentsOverheadAndProfitInfo */
    ContentsOverheadAndProfitInfo?: OverheadAndProfitInfo;
    /** MinimumCharge */
    MinimumCharge?: MinimumCharge;
    /** s:int */
    AlternateDepreciationDefaultAge?: string;
    /** s:decimal */
    AlternateDepreciationDefaultRate?: string;
    /** Coverages */
    Coverages?: Coverages;
    /** s:dateTime */
    PolicyStartDate?: string;
    /** s:dateTime */
    PolicyEndDate?: string;
    /** s:decimal */
    FlatDeductible?: string;
    /** s:decimal */
    DeductibleMinimumAmount?: string;
    /** s:decimal */
    DeductibleMaximumRate?: string;
    /** CustomFields */
    CustomFields?: CustomFields;
    /** CurrentOwner */
    CurrentOwner?: CreatorUser;
    /** Originator */
    Originator?: CreatorCompany;
    /** InsuredContact */
    InsuredContact?: InsuredContact;
    /** DelegatedAuthority */
    DelegatedAuthority?: DelegatedAuthority;
    /** Assignees */
    Assignees?: DelegatedAuthority;
    /** Peers */
    Peers?: DelegatedAuthority;
    /** Diagrams */
    Diagrams?: Diagrams;
    /** Estimates */
    Estimates?: Estimates;
    /** PhotoPages */
    PhotoPages?: PhotoPages;
    /** VoiceAnnotations */
    VoiceAnnotations?: VoiceAnnotations;
    /** Forms */
    Forms?: Forms;
    /** JournalEntries */
    JournalEntries?: JournalEntries;
    /** UploadStatus */
    UploadStatus?: UploadStatus;
    /** ClaimAssignments */
    ClaimAssignments?: ClaimAssignments;
    /** QuestionAnswers */
    QuestionAnswers?: QuestionAnswers;
    /** ClaimPayments */
    ClaimPayments?: ClaimPayments;
    /** GermanyAdditionalFields */
    GermanyAdditionalFields?: GermanyAdditionalFields;
    /** ClaimContact */
    ClaimContact?: CreatorUser;
    /** Questionnaires */
    Questionnaires?: Questionnaires;
}
