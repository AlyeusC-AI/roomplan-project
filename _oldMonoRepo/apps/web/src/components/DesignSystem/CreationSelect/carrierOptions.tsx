export const carrierOptions = [
  createOption("All State"),
  createOption("State Farm"),
];

export const wallOptions = [
  createOption("Drywall"),
  createOption("Plaster"),
  createOption("Plaster w/lath"),
  createOption("Panel"),
];

export const floorOptions = [
  createOption("Oak"),
  createOption("Laminate"),
  createOption("Tile"),
  createOption("Vinyl Sheet"),
  createOption("Carpet"),
  createOption("Engineered Hardwood"),
];

function createOption(label: string) {
  return {
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  };
}
