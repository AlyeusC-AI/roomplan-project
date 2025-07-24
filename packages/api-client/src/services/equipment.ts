import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentProject,
  AssignEquipmentDto,
} from "../types/equipment";
import { apiClient } from "./client";

// Predefined equipment names by category
export const EQUIPMENT_NAMES = {
  Dehumidifiers: [
    "Alpine",
    "BlueDri",
    "Dri-Eaz",
    "Phoenix",
    "Soleus Air",
    "Frigidaire",
    "Honeywell",
    "LG",
    "Samsung",
    "Whynter",
    "Danby",
    "Haier",
    "GE",
    "Kenmore",
    "Midea",
    "Toshiba",
    "Sharp",
    "Panasonic",
    "Mitsubishi",
    "Carrier",
    "DeLonghi",
    "Eva-Dry",
    "Pro Breeze",
    "hOmeLabs",
    "Pure Enrichment",
    "Tenergy",
    "Afloia",
    "Vremi",
    "Ivation",
    "Waykar",
    "TOSOT",
    "Hisense",
    "TCL",
    "Black+Decker",
    "Sunpentown",
    "Comfort Aire",
    "Arctic King",
    "EdgeStar",
    "NewAir",
    "Koolatron",
    "Crosley",
  ],
  "Air Movers": [
    "Dri-Eaz",
    "Phoenix",
    "BlueDri",
    "Alpine",
    "Air King",
    "Lasko",
    "Vornado",
    "Holmes",
    "Bionaire",
    "Honeywell",
    "Oscillating Fan",
    "Box Fan",
    "Tower Fan",
    "Pedestal Fan",
    "Window Fan",
    "Ceiling Fan",
    "Industrial Fan",
    "High Velocity Fan",
    "Axial Fan",
    "Centrifugal Fan",
    "Dyson",
    "Rowenta",
    "Hunter",
    "Emerson",
    "Westinghouse",
    "Hampton Bay",
    "Minka-Aire",
    "Monte Carlo",
    "Craftmade",
    "Casablanca",
    "Fanimation",
    "Minka Group",
    "Quorum",
    "Savoy House",
    "Progress Lighting",
    "Hubbardton Forge",
    "Corbett Lighting",
    "Sea Gull Lighting",
    "Maxim Lighting",
    "Kichler",
    "Murray Feiss",
  ],
  "Air Scrubbers": [
    "Dri-Eaz",
    "Phoenix",
    "BlueDri",
    "Alpine",
    "Abatement Technologies",
    "Air Systems",
    "Dustless Technologies",
    "Nilfisk",
    "Tennant",
    "Kärcher",
    "Clarke",
    "Minuteman",
    "ProTeam",
    "Sanitaire",
    "Oreck",
    "Dyson",
    "Shark",
    "Bissell",
    "Hoover",
    "Eureka",
    "Miele",
    "Electrolux",
    "Samsung",
    "LG",
    "Panasonic",
    "Sharp",
    "Toshiba",
    "Hitachi",
    "Daikin",
    "Mitsubishi",
    "Fujitsu",
    "Gree",
    "Carrier",
    "Trane",
    "Lennox",
    "Rheem",
    "Goodman",
    "American Standard",
    "Bryant",
    "Amana",
    "Rheem",
  ],
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

  async getEquipmentHistory(equipmentId: string) {
    return apiClient.get<EquipmentProject[]>(
      `/equipment/${equipmentId}/history`
    );
  }

  // Get predefined equipment names by category
  getEquipmentNamesByCategory(categoryName: string): string[] {
    return EQUIPMENT_NAMES[categoryName as keyof typeof EQUIPMENT_NAMES] || [];
  }

  // Get all available category names
  getAvailableCategories(): string[] {
    return Object.keys(EQUIPMENT_NAMES);
  }
}

export const equipmentService = new EquipmentService();
