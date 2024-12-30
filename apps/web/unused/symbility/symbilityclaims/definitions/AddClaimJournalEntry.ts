import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { JournalEntrySpecification } from "./JournalEntrySpecification";

/** AddClaimJournalEntry */
export interface AddClaimJournalEntry {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** journalEntrySpecification */
    journalEntrySpecification?: JournalEntrySpecification;
}
