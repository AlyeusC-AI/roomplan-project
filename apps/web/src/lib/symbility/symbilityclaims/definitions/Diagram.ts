import { DiagramObjects } from "./DiagramObjects";

/**
 * Diagram
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Diagram {
    /** DiagramObjects */
    DiagramObjects?: DiagramObjects;
    /** s:base64Binary */
    Bytes?: string;
}
