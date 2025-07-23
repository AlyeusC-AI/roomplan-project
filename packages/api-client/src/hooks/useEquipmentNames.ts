import { equipmentService } from "../services/equipment";

export function useEquipmentNames() {
  const getEquipmentNamesByCategory = (categoryName: string): string[] => {
    return equipmentService.getEquipmentNamesByCategory(categoryName);
  };

  const getAvailableCategories = (): string[] => {
    return equipmentService.getAvailableCategories();
  };

  return {
    getEquipmentNamesByCategory,
    getAvailableCategories,
  };
}
