import { BrokerCompanyIdSpecification } from './BrokerCompanyIdSpecification'
import { CustomFields } from './CustomFields'
import { GermanyAdditionalFields } from './GermanyAdditionalFields'
import { InsuredAddress } from './InsuredAddress'
import { QuestionAnswers } from './QuestionAnswers'
import { WritingCompanySpecification } from './WritingCompanySpecification'

/**
 * claimUpdateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimUpdateSpecification {
  /** s:dateTime */
  LossDate?: string
  /** TimeZone|s:string|Hawaii,Alaska,PacificTime,MountainTime,Arizona,CentralTime,Saskatchewan,Mexico,EasternTime,IndianaEast,AtlanticTime,Newfoundland,GreenwichMeanTime,GreenwichStandardTime,CentralEuropeanTime,RomanceTime,WesternEurope,SouthAfrica,GtbStandardTime,WesternAustralia,Tokyo,AusCentralStandardTime,CentralAustralia,AusEasternStandardTime,EasternAustralia,Tasmania,Utc,UseApiAccountCompanyTimeZone */
  LossDateTimeZone?: string
  /** s:int */
  BuiltYear?: string
  /** s:boolean */
  Reinspection?: string
  /** PhoneLabel|s:string|Business2,BusinessFax,Home2,HomeFax,Other,Pager,Unknown */
  InsuredOtherPhoneLabel?: string
  /** PhoneType|s:string|None,Home,Business,Mobile,Other,Unknown */
  InsuredPreferredPhone?: string
  /** Language|s:string|English,French,EnglishUnitedKingdom,German,EnglishAustralia,Polish,Dutch,Japanese,Flemish,FrenchFrance */
  InsuredLanguage?: string
  /** InsuredAddress */
  InsuredAddress?: InsuredAddress
  /** s:boolean */
  AddInsuredAsParticipant?: string
  /** s:boolean */
  LossDifferentThanInsured?: string
  /** LossAddress */
  LossAddress?: InsuredAddress
  /** ClaimOverallRiskCondition|s:string|None,Excellent,Average,Poor,SeeComments,Unknown */
  OverallRiskCondition?: string
  /** s:date */
  PolicyStartDate?: string
  /** s:date */
  PolicyEndDate?: string
  /** s:int */
  PolicyTimesRenewed?: string
  /** s:boolean */
  UseAlternateDepreciation?: string
  /** s:int */
  AlternateDepreciationDefaultAge?: string
  /** CustomFields */
  CustomFields?: CustomFields
  /** WritingCompanySpecification */
  WritingCompanySpecification?: WritingCompanySpecification
  /** BrokerCompanyIDSpecification */
  BrokerCompanyIDSpecification?: BrokerCompanyIdSpecification
  /** QuestionAnswers */
  QuestionAnswers?: QuestionAnswers
  /** GermanyAdditionalFields */
  GermanyAdditionalFields?: GermanyAdditionalFields
  /** s:boolean */
  Secure?: string
}
