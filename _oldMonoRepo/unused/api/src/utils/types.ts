import { z } from 'zod'

export const RoomsFilterQueryParam = z.array(z.string()).optional()
export const OnlySelectedFilterQueryParam = z.boolean().optional()
export const SortDirectionQueryParam = z
  .union([z.literal('asc'), z.literal('desc')])
  .optional()
