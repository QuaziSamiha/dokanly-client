import { z } from 'zod';

// We define the Enum locally for the frontend to avoid importing Prisma types
export const StatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

/**
 * Base Validation Rules
 */
const baseSchema = {
  minOrderAmount: z.coerce
    .number()
    .min(1, 'Minimum amount must be at least 1')
    .max(1000000, 'Amount is too high'),
    
  description: z
    .string()
    .optional()
    .or(z.literal('')), // Allows empty string as valid optional

  status: StatusEnum.default('INACTIVE'),
};

/**
 * 1. ADD SCHEMA (Create)
 * Requires: minOrderAmount
 * Optional: description
 */
export const CreateFreeDeliverySchema = z.object({
  minOrderAmount: baseSchema.minOrderAmount,
  description: baseSchema.description,
  status: baseSchema.status,
});

/**
 * 2. EDIT SCHEMA (Update)
 * Only allows status to be changed (as per your requirement)
 */
export const UpdateFreeDeliverySchema = z.object({
  status: baseSchema.status,
});

// TypeScript types derived from schemas
export type CreateFreeDeliveryType = z.infer<typeof CreateFreeDeliverySchema>;
export type UpdateFreeDeliveryType = z.infer<typeof UpdateFreeDeliverySchema>;