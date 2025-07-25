import { equipmentService } from "../services/equipment";

export function useEquipmentNames() {
  const getEquipmentBrandsByCategory = (categoryName: string): string[] => {
    return equipmentService.getEquipmentBrandsByCategory(categoryName);
  };

  const getEquipmentModelsByCategoryAndBrand = (
    categoryName: string,
    brand: string
  ): string[] => {
    return equipmentService.getEquipmentModelsByCategoryAndBrand(
      categoryName,
      brand
    );
  };

  const getAvailableCategories = (): string[] => {
    return equipmentService.getAvailableCategories();
  };

  return {
    getEquipmentBrandsByCategory,
    getEquipmentModelsByCategoryAndBrand,
    getAvailableCategories,
  };
}
