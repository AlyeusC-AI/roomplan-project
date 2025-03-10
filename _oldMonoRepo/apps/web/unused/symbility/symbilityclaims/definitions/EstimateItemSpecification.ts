import { EstimateItemContents } from "./EstimateItemContents";
import { EstimateItemDepreciation } from "./EstimateItemDepreciation";
import { EstimateItemNoteSpecifications } from "./EstimateItemNoteSpecifications";
import { ExternalEstimateItemSpecification } from "./ExternalEstimateItemSpecification";
import { Links } from "./Links";
import { Links2 } from "./Links2";

/**
 * EstimateItemSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateItemSpecification {
    /** s:int */
    DiagramObjectID?: string;
    /** s:int */
    DiagramID?: string;
    /** s:int */
    CustomDiagramID?: string;
    /** s:string */
    CustomDiagramObjectName?: string;
    /** ItemUnitOfMeasure|s:string|SquareFoot,LinearFoot,SquareYard,Each,Hour,CubicInch,CubicYard,CubicFoot,Day,Week,Gallon,Pair,Roll,Room,Load,LinearInch,Ton,Square,SquareInch,Mile,Bag,SRoll,Section,Set,Sheet,VerticalLinearFoot,DoubleRoll,Bolt,Box,Bundle,BoardFeet,Piece,Minute,Percentage,Acre,OneHundred,LinearFeet100,SquareFeet100,Pound,LumpSum,OneThousand,BoardFeet1000,LinearFeet1000,Month,SquareFeet1000,Pack,SquareFootFormContactConcrete,LinearCentimeter,LinearMeter,LinearKilometer,SquareCentimeter,SquareMeter,CubicMeter,LinearMillimeter,Number,Sum,Tsubo,Shakutsubo,Kilogram,Gram,Milliliter,Liter,CubicCentimeter,CubicDecimeter,TatamiMat,PintsPerDay,LitersPerDay,CubicFeetPerMinute,CubicMetersPerHour,SquareMeterXWeek,PieceXWeek,KiloWattHour,MeterPerWeek,PiecePerDay,Unknown */
    UnitOfMeasure?: string;
    /** s:int */
    ClaimCoverageID?: string;
    /** s:int */
    ClaimSubcoverageID?: string;
    /** s:boolean */
    Provisional?: string;
    /** s:boolean */
    IncludeSubtractions?: string;
    /** s:decimal */
    Waste?: string;
    /** s:decimal */
    MaterialsQuantityBundleSize?: string;
    /** s:decimal */
    UnitMaterials?: string;
    /** s:decimal */
    UnitLabor?: string;
    /** s:decimal */
    UnitHours?: string;
    /** s:decimal */
    UnitEquipment?: string;
    /** s:decimal */
    UnitMarketConditions?: string;
    /** s:boolean */
    ApplyTax1?: string;
    /** s:boolean */
    ApplyTax2?: string;
    /** s:boolean */
    ApplyTax3?: string;
    /** s:boolean */
    ApplyTax4?: string;
    /** s:boolean */
    ApplyOverheadAndProfit?: string;
    /** EstimateItemDepreciation */
    EstimateItemDepreciation?: EstimateItemDepreciation;
    /** Links */
    Links?: Links;
    /** Links2 */
    Links2?: Links2;
    /** s:boolean */
    Credit?: string;
    /** s:decimal */
    Quantity?: string;
    /** s:string */
    PaidWhenIncurredReason?: string;
    /** s:string */
    PaidWhenIncurredGroup?: string;
    /** s:boolean */
    CostIncurred?: string;
    /** EstimateItemContents */
    EstimateItemContents?: EstimateItemContents;
    /** EstimateItemNoteSpecifications */
    EstimateItemNoteSpecifications?: EstimateItemNoteSpecifications;
    /** ExternalEstimateItemSpecification */
    ExternalEstimateItemSpecification?: ExternalEstimateItemSpecification;
}
