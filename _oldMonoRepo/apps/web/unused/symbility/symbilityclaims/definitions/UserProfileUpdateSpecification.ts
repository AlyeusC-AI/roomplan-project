
/**
 * userProfileUpdateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface UserProfileUpdateSpecification {
    /** UserGroup|s:string|Administrator,PowerUser,Standard,Junior,Restricted,Guest,TechnicalAdmin,Unknown,StandardAnalytics,Deployment,SupplierManager,ConfigurationAdmin,ReadOnly,ITHelpdesk,OperationalManager,StandardAdmin,StandardLight */
    UserGroup?: string;
    /** s:boolean */
    Enabled?: string;
    /** s:dateTime */
    ExpiryDate?: string;
    /** s:boolean */
    UseExpiryDate?: string;
    /** s:boolean */
    ViewSecureClaims?: string;
}
