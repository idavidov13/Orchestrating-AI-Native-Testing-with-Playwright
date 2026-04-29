import { faker } from '@faker-js/faker';
import {
    ProductRequest,
    ProductRequestSchema,
} from '../../../fixtures/api/schemas/app/productSchema';

/**
 * IDs required by the backend for a valid ProductRequest. Pass real ULIDs
 * fetched in `beforeAll` from existing brands/categories/images.
 */
export interface ProductFactoryRefs {
    brand_id: string;
    category_id: string;
    product_image_id: string;
}

/**
 * Generates a valid ProductRequest payload with randomized data using Faker.
 *
 * @param refs - Required references (brand_id, category_id, product_image_id).
 * @param overrides - Optional partial overrides.
 * @returns A ProductRequest validated against ProductRequestSchema.
 */
export const generateProduct = (
    refs: ProductFactoryRefs,
    overrides?: Partial<ProductRequest>
): ProductRequest => {
    const defaults: ProductRequest = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price({ min: 1, max: 999, dec: 2 })),
        category_id: refs.category_id,
        brand_id: refs.brand_id,
        product_image_id: refs.product_image_id,
        is_location_offer: false,
        is_rental: false,
        co2_rating: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
    };

    return ProductRequestSchema.parse({ ...defaults, ...overrides });
};
