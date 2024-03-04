import { Photos } from "./Photos";

/**
 * Photo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Photo {
    /** Photos[] */
    Photos?: Array<Photos>;
    /** s:base64Binary */
    DocumentBytes?: string;
}
