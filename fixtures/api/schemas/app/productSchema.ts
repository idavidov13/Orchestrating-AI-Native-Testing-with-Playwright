import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';
import { BrandSchema } from './brandSchema';

/**
 * Recursive category schema (CategoryResponse has nested sub_categories).
 */
type CategoryShape = {
    id: string;
    parent_id?: string | null;
    name?: string;
    slug?: string;
    sub_categories?: CategoryShape[];
};

const CategorySchema: z.ZodType<CategoryShape> = z.lazy(() =>
    z.strictObject({
        id: z.string(),
        parent_id: z.string().nullable().optional(),
        name: z.string().optional(),
        slug: z.string().optional(),
        sub_categories: z.array(CategorySchema).optional(),
    })
);

/**
 * Schema for ImageResponse (product_image on Product).
 */
export const ImageSchema = z.strictObject({
    by_name: z.string().optional(),
    by_url: z.string().optional(),
    source_name: z.string().optional(),
    source_url: z.string().optional(),
    file_name: z.string().optional(),
    title: z.string().optional(),
    id: z.string(),
});

/**
 * Schema for ProductResponse. OpenAPI lists no `required` array, so nested
 * helper fields are optional to match real API variability.
 */
export const ProductSchema = z.strictObject({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    is_location_offer: z.boolean(),
    is_rental: z.boolean(),
    in_stock: z.boolean().optional(),
    co2_rating: z.string().optional(),
    is_eco_friendly: z.boolean().optional(),
    brand: BrandSchema.optional(),
    category: CategorySchema.optional(),
    product_image: ImageSchema.optional(),
});

/**
 * Schema for the paginated product collection (GET /products).
 */
export const PaginatedProductResponseSchema = z.strictObject({
    current_page: z.number().int(),
    data: z.array(ProductSchema),
    from: z.number().int().nullable(),
    last_page: z.number().int(),
    per_page: z.number().int(),
    to: z.number().int().nullable(),
    total: z.number().int(),
});

/**
 * Schema for ProductRequest payload (POST/PUT/PATCH).
 */
export const ProductRequestSchema = z.strictObject({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category_id: z.string(),
    brand_id: z.string(),
    product_image_id: z.string(),
    is_location_offer: z.boolean(),
    is_rental: z.boolean(),
    co2_rating: z.string(),
});

// Type exports
export type Product = zOutput<typeof ProductSchema>;
export type PaginatedProductResponse = zOutput<
    typeof PaginatedProductResponseSchema
>;
export type ProductRequest = zOutput<typeof ProductRequestSchema>;
