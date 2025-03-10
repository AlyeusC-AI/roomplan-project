import { FromUserIdSpecification } from "./FromUserIdSpecification";
import { Properties } from "./Properties";

/**
 * taskSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface TaskSpecification {
    /** s:string */
    Name?: string;
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
    /** s:string */
    OwnerUserRole?: string;
    /** OwnerUser */
    OwnerUser?: FromUserIdSpecification;
    /** s:string */
    Comments?: string;
}
