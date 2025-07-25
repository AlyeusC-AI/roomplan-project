import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentProject,
  AssignEquipmentDto,
} from "../types/equipment";
import { apiClient } from "./client";

// Predefined equipment names and models by category
export const EQUIPMENT_NAMES: Record<string, Record<string, string[]>> = {
  Dehumidifiers: {
    "Dri-Eaz": [
      "Revolution LGR",
      "Evolution LGR",
      "DrizAir 1200",
      "DrizAir 2000",
    ],
    Phoenix: ["DryMAX XL", "R250", "R175", "270HTX", "200 MAX"],
    BlueDri: ["BD-76", "BD-130P", "BD-85"],
    Alpine: ["Industrial 70 Pint", "Commercial 100 Pint", "Alpine 50 Pint"],
    "Soleus Air": ["DS1-70E-201", "DS2-50E-101"],
    Frigidaire: ["FFAD5033W1", "FGAC5044W1"],
    Honeywell: ["TP70AWKN", "TP50WK"],
    LG: ["UD501KOG5", "PuriCare 50-Pint"],
    Samsung: ["AY18H9984", "AY13H9980"],
    Whynter: ["ARC-12SD", "ARC-14S"],
    Danby: ["DDR050BJWDB", "DDR070BDWDB"],
    GE: ["APER50LZ", "ADEW50LY"],
    Kenmore: ["KM70", "KM50"],
    Midea: ["MAD50C1ZWS", "MAP50SR1BWT"],
    Toshiba: ["TDDP5012ES2", "TDDP5013ES2"],
    Sharp: ["DW70U", "DW60U"],
    Panasonic: ["F-YCL27N", "F-YCL16N"],
    Mitsubishi: ["MJ-EV38HR-A1", "MJ-E16VX"],
    Carrier: ["CDH-50L", "CDH-30L"],
    DeLonghi: ["DEX16F", "DDX220"],
    "Eva-Dry": ["EDV-1100", "EDV-4000"],
    "Pro Breeze": ["PB-03-US", "PB-06-US"],
    hOmeLabs: ["HME020031N", "HME020006N"],
    "Pure Enrichment": ["PureDry", "PureDry Deluxe"],
    Tenergy: ["Sorbi", "Tenergy 1.6L"],
    Afloia: ["Q10", "T8 Plus"],
    Vremi: ["VRM010184N", "VRM010183N"],
    Ivation: ["IVADM35", "IVADM45"],
    Waykar: ["PD253B", "PD100A"],
    TOSOT: ["GDN45BA-A3EBA2C", "GDN30AZ-A3EBA2E"],
    Hisense: ["DH7019K1G", "DH5020K1G"],
    TCL: ["TDW50E20", "TDW20E20"],
    "Black+Decker": ["BDEM20", "BDEM30"],
    Sunpentown: ["SD-61E", "SD-52PE"],
    "Comfort Aire": ["BHD-701-H", "BHD-501-H"],
    "Arctic King": ["WWK05CM91N", "WWK08CW91N"],
    EdgeStar: ["DEP701WP", "DEP501EW"],
    NewAir: ["AD-250", "AD-400"],
    Koolatron: ["WD80", "WD60"],
    Crosley: ["CRDEH50", "CRDEH70"],
  },
  "Air Movers": {
    "Dri-Eaz": ["Sahara Pro X3", "Velo Pro", "Ace TurboDryer"],
    Phoenix: ["AirMax Radial", "Stackable Axial", "Focus II"],
    BlueDri: ["One-29", "Mini Storm", "BD-Fan-130"],
    Alpine: ["Axial 1/2 HP", "Axial 1 HP", "Alpine Pro 3000"],
    "Air King": ["9723", "99539"],
    Lasko: ["4900 Pro Performance", "U15617"],
    Vornado: ["630 Mid-Size", "783 Full-Size"],
    Holmes: ["HAPF624R-UC", "HAPF600D-UC"],
    Bionaire: ["BW2300-N", "BWF0522E-BU"],
    Honeywell: ["HT-900", "HYF290B"],
    "Oscillating Fan": ["Generic 16-Inch", "Generic 20-Inch"],
    "Box Fan": ["Lasko 3723", "Genesis G20BOX"],
    "Tower Fan": ["Lasko T42951", "Honeywell HYF290B"],
    "Pedestal Fan": ["Rowenta VU5670", "Lasko 1827"],
    "Window Fan": ["Holmes HAWF2043", "Bionaire BW2300-N"],
    "Ceiling Fan": ["Hunter Builder", "Minka-Aire F844"],
    "Industrial Fan": ["Maxx Air HVWM 18", "Tornado 24"],
    "High Velocity Fan": ["Lasko U15617", "Stanley 655704"],
    "Axial Fan": ["Dri-Eaz Axial", "Phoenix Axial"],
    "Centrifugal Fan": ["Dri-Eaz Ace", "B-Air VP-25"],
    Dyson: ["AM07", "AM06"],
    Rowenta: ["VU5670", "VU5551"],
    Hunter: ["Builder Elite", "Builder Plus"],
    Emerson: ["CF712ORB", "CF765BQ"],
    Westinghouse: ["7801665", "7861400"],
    "Hampton Bay": ["Glendale", "Rockport"],
    "Minka-Aire": ["F844-DK", "F518-WH"],
    "Monte Carlo": ["3MAVR60BK", "5DI52PND"],
    Craftmade: ["K10748", "K10741"],
    Casablanca: ["Stealth", "Verse"],
    Fanimation: ["FP8519BL", "FP7910OB"],
    "Minka Group": ["F844-DK", "F518-WH"],
    Quorum: ["143306-8", "143306-6"],
    "Savoy House": ["52-EOF-5RV-13", "52-EOF-5RV-05"],
    "Progress Lighting": ["P2501-09", "P2502-09"],
    "Hubbardton Forge": ["350700", "350701"],
    "Corbett Lighting": ["113-12", "113-13"],
    "Sea Gull Lighting": ["3120205-962", "3120205-710"],
    "Maxim Lighting": ["8887MROI", "8887WT"],
    Kichler: ["300103OZ", "300103NI"],
    "Murray Feiss": ["F1906/3ORB", "F1906/3SN"],
  },
  "Air Scrubbers": {
    "Dri-Eaz": ["DefendAir HEPA 500", "F284"],
    Phoenix: ["Guardian HEPA System", "GuardianR Pro"],
    BlueDri: ["BD-AS-550", "BD-AS-550-BL"],
    Alpine: ["HEPA Air Purifier", "Alpine 3000"],
    "Abatement Technologies": ["PAS2400", "HEPA-AIRE H1990M"],
    "Air Systems": ["AS-550", "AS-1000"],
    "Dustless Technologies": ["D1606", "D1603"],
    Nilfisk: ["AERO 21", "AERO 26"],
    Tennant: ["V-BP-6", "V-CAN-10"],
    Kärcher: ["AF 100", "AF 300"],
    Clarke: ["CarpetMaster 215", "CarpetMaster 218"],
    Minuteman: ["C82915-00", "C82916-00"],
    ProTeam: ["Super CoachVac", "ProForce 1500XP"],
    Sanitaire: ["SC9180B", "SC899F"],
    Oreck: ["XL2100RHS", "Commercial XL"],
    Dyson: ["Pure Cool", "Pure Hot+Cool"],
    Shark: ["NV352", "NV356E"],
    Bissell: ["Cleanview", "Airswivel"],
    Hoover: ["WindTunnel 3", "WindTunnel 2"],
    Eureka: ["NEU182A", "NEU202"],
  },
};

class EquipmentService {
  async create(data: CreateEquipmentDto & { organizationId: string }) {
    return apiClient.post<Equipment>("/equipment", data);
  }

  async findAll(organizationId: string, categoryId?: string) {
    let url = `/equipment/organization/${organizationId}`;
    if (categoryId) url += `?categoryId=${categoryId}`;
    return apiClient.get<Equipment[]>(url);
  }

  async findOne(id: string) {
    return apiClient.get<Equipment>(`/equipment/${id}`);
  }

  async update(id: string, data: UpdateEquipmentDto) {
    return apiClient.patch<Equipment>(`/equipment/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Equipment>(`/equipment/${id}`);
  }

  async assignEquipment(data: AssignEquipmentDto) {
    return apiClient.post<EquipmentProject>("/equipment/assign", data);
  }

  async getEquipmentAssignments(projectId: string) {
    return apiClient.get<EquipmentProject[]>(
      `/equipment/project/${projectId}/assignments`
    );
  }

  async removeEquipmentAssignment(id: string) {
    return apiClient.delete<EquipmentProject>(`/equipment/assignment/${id}`);
  }

  async updateEquipmentAssignmentStatus(
    id: string,
    status: "PLACED" | "ACTIVE" | "REMOVED"
  ) {
    return apiClient.patch<EquipmentProject>(
      `/equipment/assignment/${id}/status`,
      {
        status,
      }
    );
  }

  async getEquipmentStatusChangeHistory(assignmentId: string) {
    return apiClient.get<any[]>(
      `/equipment/assignment/${assignmentId}/status-history`
    );
  }

  async getEquipmentHistory(equipmentId: string) {
    return apiClient.get<EquipmentProject[]>(
      `/equipment/${equipmentId}/history`
    );
  }

  // Get predefined brands by category
  getEquipmentBrandsByCategory(categoryName: string): string[] {
    return Object.keys(EQUIPMENT_NAMES[categoryName] || {});
  }
  // Get predefined models by category and brand
  getEquipmentModelsByCategoryAndBrand(
    categoryName: string,
    brand: string
  ): string[] {
    const brands = EQUIPMENT_NAMES[categoryName] || {};
    return brands[brand] || [];
  }
  // Get all available category names
  getAvailableCategories(): string[] {
    return Object.keys(EQUIPMENT_NAMES);
  }
}

export const equipmentService = new EquipmentService();
