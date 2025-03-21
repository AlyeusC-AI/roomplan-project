export type DamageType = "fire" | "water" | "mold" | "other";

export const DAMAGE_TYPES = [
  { label: "Fire Damage", value: "fire" },
  { label: "Water Damage", value: "water" },
  { label: "Mold Damage", value: "mold" },
  { label: "Other", value: "other" },
] as const; 