export const wallOptions = [
  { label: "Drywall", value: "drywall" },
  { label: "Plaster", value: "plaster" },
  { label: "Plaster w/lath", value: "plasterwlath" },
  { label: "Panel", value: "panel" },
];

export const floorOptions = [
  { label: "Oak", value: "oak" },
  { label: "Laminate", value: "laminate" },
  { label: "Tile", value: "tile" },
  { label: "Vinyl Sheet", value: "vinylsheet" },
  { label: "Carpet", value: "carpet" },
  { label: "Engineered Hardwood", value: "engineeredhardwood" },
];

export type MaterialOption = {
  label: string;
  value: string;
}; 