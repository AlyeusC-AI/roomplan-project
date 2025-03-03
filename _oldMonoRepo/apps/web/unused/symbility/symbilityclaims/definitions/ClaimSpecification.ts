import { Assignments } from './Assignments'
import { Attendees } from './Attendees'
import { BrokerCompanyIdSpecification } from './BrokerCompanyIdSpecification'
import { CompanyIdSpecification } from './CompanyIdSpecification'
import { Coverages } from './Coverages'
import { CustomFields } from './CustomFields'
import { GermanyAdditionalFields } from './GermanyAdditionalFields'
import { InsuredAddress } from './InsuredAddress'
import { MinimumCharge } from './MinimumCharge'
import { OverheadAndProfitInfo } from './OverheadAndProfitInfo'
import { Peers } from './Peers'
import { QuestionAnswers } from './QuestionAnswers'
import { TaxInfo } from './TaxInfo'
import { WritingCompanySpecification } from './WritingCompanySpecification'

/**
 * claimSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimSpecification {
  /** WritingCompanySpecification */
  WritingCompanySpecification?: WritingCompanySpecification
  /** BrokerCompanyIDSpecification */
  BrokerCompanyIDSpecification?: BrokerCompanyIdSpecification
  /** s:int */
  BuiltYear?: string
  /** PhoneType|s:string|None,Home,Business,Mobile,Other,Unknown */
  InsuredPreferredPhone?: string
  /** Language|s:string|English,French,EnglishUnitedKingdom,German,EnglishAustralia,Polish,Dutch,Japanese,Flemish,FrenchFrance */
  InsuredLanguage?: string
  /** InsuredAddress */
  InsuredAddress?: InsuredAddress
  /** LossAddress */
  LossAddress?: InsuredAddress
  /** ClaimOverallRiskCondition|s:string|None,Excellent,Average,Poor,SeeComments,Unknown */
  OverallRiskCondition?: string
  /** TaxInfo */
  TaxInfo?: TaxInfo
  /** OverheadAndProfitInfo */
  OverheadAndProfitInfo?: OverheadAndProfitInfo
  /** ContentsOverheadAndProfitInfo */
  ContentsOverheadAndProfitInfo?: OverheadAndProfitInfo
  /** MinimumCharge */
  MinimumCharge?: MinimumCharge
  /** s:boolean */
  UseAlternateDepreciation?: string
  /** s:int */
  AlternateDepreciationDefaultAge?: string
  /** Coverages */
  Coverages?: Coverages
  /** s:dateTime */
  PolicyStartDate?: string
  /** s:dateTime */
  PolicyEndDate?: string
  /** s:decimal */
  FlatDeductible?: string
  /** s:decimal */
  DeductibleMinimumAmount?: string
  /** s:decimal */
  DeductibleMaximumRate?: string
  /** CustomFields */
  CustomFields?: CustomFields
  /** Originator */
  Originator?: CompanyIdSpecification
  /** OriginatorParticipantUsers */
  OriginatorParticipantUsers?: Attendees
  /** Peers */
  Peers?: Peers
  /** Assignments */
  Assignments?: Assignments
  /** QuestionAnswers */
  QuestionAnswers?: QuestionAnswers
  /** GermanyAdditionalFields */
  GermanyAdditionalFields?: GermanyAdditionalFields
}
