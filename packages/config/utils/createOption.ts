export const createOption = (label: string) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ""),
});
