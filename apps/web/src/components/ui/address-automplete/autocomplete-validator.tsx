import { z } from "zod";

/**
 * Checks if the autocomplete address is valid. Change to your own validation logic.
 * @param address - The address object to validate.
 * @param searchInput - The search input string.
 * @returns - Returns true if the autocomplete address is valid, otherwise false.
 */
export const isValidAutocomplete = (
	address: AddressType,
	searchInput: string,
) => {
	if (searchInput.trim() === "") {
		return true;
	}

	const AddressSchema = z.object({
		address1: z.string().min(1, "Address line 1 is required"),
		address2: z.string().optional(),
		formattedAddress: z.string().min(1, "Formatted address is required"),
		city: z.string().min(1, "City is required"),
		region: z.string().min(1, "Region is required"),
		postalCode: z.string().min(1, "Postal code is required"),
		country: z.string().min(1, "Country is required"),
		lat: z.number().nonnegative(),
		lng: z.number().nonnegative(),
	});

	const result = AddressSchema.safeParse(address);
	return result.success;
};