import { CompletionConditions } from "./CompletionConditions";
import { CreatorUser } from "./CreatorUser";
import { Properties } from "./Properties";

/**
 * task
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Task {
    /** CreatorUser */
    CreatorUser?: CreatorUser;
    /** s:string */
    Name?: string;
    /** s:string */
    TaskTemplateCode?: string;
    /** s:string */
    TaskGroupCode?: string;
    /** TaskPriority|s:string|Low,Medium,High,Unknown */
    Priority?: string;
    /** s:dateTime */
    DueDate?: string;
    /** TaskStatus|s:string|Pending,InProgress,Completed,Cancelled,Unknown,Assigned */
    Status?: string;
    /** s:string */
    TaskTemplateCompletedCode?: string;
    /** s:string */
    TaskTemplateCancelledCode?: string;
    /** TaskVisibility|s:string|Internal,External,Global,Unknown */
    Visibility?: string;
    /** Properties */
    Properties?: Properties;
    /** OwnerUser */
    OwnerUser?: CreatorUser;
    /** s:string */
    Comments?: string;
    /** s:dateTime */
    ClosedDate?: string;
    /** ClosedUser */
    ClosedUser?: CreatorUser;
    /** CompletionConditions */
    CompletionConditions?: CompletionConditions;
}
