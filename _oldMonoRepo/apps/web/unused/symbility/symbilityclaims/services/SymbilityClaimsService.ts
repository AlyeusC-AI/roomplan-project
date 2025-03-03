import { SymbilityClaimsServiceSoap } from "../ports/SymbilityClaimsServiceSoap";
import { SymbilityClaimsServiceSoap12 } from "../ports/SymbilityClaimsServiceSoap12";

export interface SymbilityClaimsService {
    readonly SymbilityClaimsServiceSoap: SymbilityClaimsServiceSoap;
    readonly SymbilityClaimsServiceSoap12: SymbilityClaimsServiceSoap12;
}
