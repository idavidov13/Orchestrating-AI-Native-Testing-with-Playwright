import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/**
 * Schema for a single Brand entity (OpenAPI BrandResponse).
 */
export const BrandSchema = z.strictObject({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

/**
 * Schema for GET /brands -- array of BrandResponse.
 */
export const BrandsResponseSchema = z.array(BrandSchema);

// Type exports
export type Brand = zOutput<typeof BrandSchema>;
export type BrandsResponse = zOutput<typeof BrandsResponseSchema>;
