import { FormPages } from "./FormPages";
import { FormValues } from "./FormValues";

/**
 * Form
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Form {
    /** FormPages */
    FormPages?: FormPages;
    /** FormValues */
    FormValues?: FormValues;
    /** s:base64Binary */
    DocumentBytes?: string;
}
