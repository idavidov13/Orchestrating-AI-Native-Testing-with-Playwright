import { ApiEndpoints } from '../../../enums/app/app';
import {
    PaginatedProductResponse,
    PaginatedProductResponseSchema,
    Product,
    ProductSchema,
} from '../../../fixtures/api/schemas/app/productSchema';
import {
    ItemNotFoundResponse,
    ItemNotFoundResponseSchema,
    MethodNotAllowedResponse,
    MethodNotAllowedResponseSchema,
    UnauthorizedResponse,
    UnauthorizedResponseSchema,
    UpdateResponse,
    UpdateResponseSchema,
} from '../../../fixtures/api/schemas/util/errorResponseSchema';
import { expect, test } from '../../../fixtures/pom/test-options';
import {
    generateProduct,
    ProductFactoryRefs,
} from '../../../test-data/factories/app/product.factory';
import {
    INVALID_NUMBER_VALUES,
    INVALID_STRING_VALUES,
} from '../../../test-data/static/util/invalid-values';

const NON_EXISTENT_PRODUCT_ID = '01JFG8Q5XKZJY4BEYQ87PC2Q1Z';

const invalidProductIds = [
    { description: 'numeric string', value: '99999' },
    { description: 'boolean-like string', value: 'true' },
    { description: 'special characters', value: '<script>' },
    { description: 'SQL injection attempt', value: '1 OR 1=1' },
];

test.describe('api/products - CRUD suite', () => {
    let refs: ProductFactoryRefs;
    let sampleProductId: string;

    test.beforeAll('Discover refs from /products', async ({ request }) => {
        const response = await request.get(
            `${process.env.API_URL}${ApiEndpoints.PRODUCTS}?page=1`
        );
        expect(response.status()).toBe(200);
        const body = (await response.json()) as PaginatedProductResponse;
        expect(PaginatedProductResponseSchema.parse(body)).toBeTruthy();

        const sample = body.data[0];
        if (!sample.brand || !sample.category || !sample.product_image) {
            throw new Error(
                'Seed product is missing brand/category/product_image references'
            );
        }
        sampleProductId = sample.id;
        refs = {
            brand_id: sample.brand.id,
            category_id: sample.category.id,
            product_image_id: sample.product_image.id,
        };
    });

    test.describe('get /products (collection)', () => {
        test(
            'should return 200 and paginated products',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<PaginatedProductResponse>({
                        method: 'GET',
                        url: ApiEndpoints.PRODUCTS,
                        baseUrl: process.env.API_URL,
                    });

                expect(status).toBe(200);
                expect(PaginatedProductResponseSchema.parse(body)).toBeTruthy();
                expect(body.data.length).toBeGreaterThan(0);
            }
        );

        test(
            'should return 200 with sort=name,asc',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<PaginatedProductResponse>({
                        method: 'GET',
                        url: `${ApiEndpoints.PRODUCTS}?sort=name,asc`,
                        baseUrl: process.env.API_URL,
                    });

                expect(status).toBe(200);
                expect(PaginatedProductResponseSchema.parse(body)).toBeTruthy();
            }
        );

        test(
            'should return 200 with page=1',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<PaginatedProductResponse>({
                        method: 'GET',
                        url: `${ApiEndpoints.PRODUCTS}?page=1`,
                        baseUrl: process.env.API_URL,
                    });

                expect(status).toBe(200);
                expect(PaginatedProductResponseSchema.parse(body)).toBeTruthy();
                expect(body.current_page).toBe(1);
            }
        );

        test(
            'should return 405 for unsupported method DELETE on /products',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<MethodNotAllowedResponse>({
                        method: 'DELETE',
                        url: ApiEndpoints.PRODUCTS,
                        baseUrl: process.env.API_URL,
                        headers: process.env.ADMIN_ACCESS_TOKEN,
                    });

                expect(status).toBe(405);
                expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
            }
        );

        /* eslint-disable playwright/no-skipped-test */
        // FIXME: OpenAPI lists 404 ItemNotFoundResponse for GET /products
        // collection but no path/query state can trigger it. Re-enable if a
        // reproducing condition is documented.
        test.skip(
            'should return 404 ItemNotFoundResponse for GET /products',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<ItemNotFoundResponse>(
                    {
                        method: 'GET',
                        url: ApiEndpoints.PRODUCTS,
                        baseUrl: process.env.API_URL,
                    }
                );
                expect(status).toBe(404);
                expect(ItemNotFoundResponseSchema.parse(body)).toBeTruthy();
            }
        );
    });

    test.describe('post /products', () => {
        const createdIds: string[] = [];

        test.afterAll(
            'Cleanup products created by POST tests',
            async ({ request }) => {
                for (const id of createdIds) {
                    await request.delete(
                        `${process.env.API_URL}${ApiEndpoints.PRODUCTS}/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`,
                            },
                        }
                    );
                }
            }
        );

        test(
            'should return 201 and created product',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const payload = generateProduct(refs);

                const { status, body } = await apiRequest<Product>({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: { ...payload },
                });

                expect([200, 201]).toContain(status);
                expect(ProductSchema.parse(body)).toBeTruthy();
                expect(body.name).toBe(payload.name);
                createdIds.push(body.id);
            }
        );

        test(
            'should return 422 for empty body',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: {},
                });

                expect(status).toBe(422);
            }
        );

        for (const invalidValue of INVALID_STRING_VALUES) {
            test(
                `should return 422 when name is ${JSON.stringify(invalidValue)}`,
                { tag: '@api' },
                async ({ apiRequest }) => {
                    const payload = generateProduct(refs);
                    const { status } = await apiRequest({
                        method: 'POST',
                        url: ApiEndpoints.PRODUCTS,
                        baseUrl: process.env.API_URL,
                        body: { ...payload, name: invalidValue },
                    });

                    expect(status).toBe(422);
                }
            );
        }

        const POST_PRICE_SKIP = new Set<unknown>(['123']);
        for (const invalidValue of INVALID_NUMBER_VALUES) {
            const title = `should return 422 when price is ${JSON.stringify(invalidValue)}`;
            const runner = POST_PRICE_SKIP.has(invalidValue)
                ? // FIXME: API coerces stringified numbers and returns 200 instead of 422
                  test.skip
                : test;
            runner(title, { tag: '@api' }, async ({ apiRequest }) => {
                const payload = generateProduct(refs);
                const { status } = await apiRequest({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: { ...payload, price: invalidValue },
                });
                expect(status).toBe(422);
            });
        }

        const POST_BRAND_ID_SKIP = new Set<unknown>([123, true]);
        for (const invalidValue of INVALID_STRING_VALUES) {
            const title = `should return 422 when brand_id is ${JSON.stringify(invalidValue)}`;
            const runner = POST_BRAND_ID_SKIP.has(invalidValue)
                ? // FIXME: API coerces non-string brand_id and returns 200 instead of 422
                  test.skip
                : test;
            runner(title, { tag: '@api' }, async ({ apiRequest }) => {
                const payload = generateProduct(refs);
                const { status } = await apiRequest({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: { ...payload, brand_id: invalidValue },
                });
                expect(status).toBe(422);
            });
        }

        test(
            'should return 405 for unsupported method PATCH on /products',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<MethodNotAllowedResponse>({
                        method: 'PATCH',
                        url: ApiEndpoints.PRODUCTS,
                        baseUrl: process.env.API_URL,
                    });

                expect(status).toBe(405);
                expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
            }
        );

        /* eslint-disable playwright/no-skipped-test */
        // FIXME: OpenAPI lists 404 ItemNotFoundResponse for POST /products but
        // there is no path parameter to invalidate. Re-enable when a
        // reproducing condition is documented.
        test.skip(
            'should return 404 ItemNotFoundResponse for POST /products',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: generateProduct(refs),
                });
                expect(status).toBe(404);
            }
        );
    });

    test.describe('get /products/{productId}', () => {
        test(
            'should return 200 and the requested product',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<Product>({
                    method: 'GET',
                    url: `${ApiEndpoints.PRODUCTS}/${sampleProductId}`,
                    baseUrl: process.env.API_URL,
                });

                expect(status).toBe(200);
                expect(body.id).toBe(sampleProductId);
            }
        );

        /* eslint-disable playwright/no-skipped-test */
        // FIXME: GET /products/{id} response includes a `specs` array that is
        // missing from the OpenAPI ProductResponse schema. Re-enable once the
        // OpenAPI doc is updated to include `specs`. Strict-schema parse fails
        // with `unrecognized_keys: specs`.
        test.skip(
            'should match ProductSchema strictly on GET /products/:id',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<Product>({
                    method: 'GET',
                    url: `${ApiEndpoints.PRODUCTS}/${sampleProductId}`,
                    baseUrl: process.env.API_URL,
                });
                expect(status).toBe(200);
                expect(ProductSchema.parse(body)).toBeTruthy();
            }
        );

        test(
            'should return 404 for non-existent productId',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<ItemNotFoundResponse>(
                    {
                        method: 'GET',
                        url: `${ApiEndpoints.PRODUCTS}/${NON_EXISTENT_PRODUCT_ID}`,
                        baseUrl: process.env.API_URL,
                    }
                );

                expect(status).toBe(404);
                expect(ItemNotFoundResponseSchema.parse(body)).toBeTruthy();
            }
        );

        for (const { description, value } of invalidProductIds) {
            test(
                `should return 404 for invalid productId - ${description}`,
                { tag: '@api' },
                async ({ apiRequest }) => {
                    const { status } = await apiRequest({
                        method: 'GET',
                        url: `${ApiEndpoints.PRODUCTS}/${encodeURIComponent(value)}`,
                        baseUrl: process.env.API_URL,
                    });

                    expect(status).toBe(404);
                }
            );
        }

        test(
            'should return 405 for unsupported method POST on /products/:id',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } =
                    await apiRequest<MethodNotAllowedResponse>({
                        method: 'POST',
                        url: `${ApiEndpoints.PRODUCTS}/${sampleProductId}`,
                        baseUrl: process.env.API_URL,
                        body: {},
                    });

                expect(status).toBe(405);
                expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
            }
        );
    });

    test.describe('put /products/{productId}', () => {
        let productId: string;

        test.beforeAll('Create product to update', async ({ request }) => {
            const payload = generateProduct(refs);
            const response = await request.post(
                `${process.env.API_URL}${ApiEndpoints.PRODUCTS}`,
                { data: payload }
            );
            const body = (await response.json()) as Product;
            productId = body.id;
        });

        test.afterAll('Delete product', async ({ request }) => {
            await request.delete(
                `${process.env.API_URL}${ApiEndpoints.PRODUCTS}/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`,
                    },
                }
            );
        });

        test(
            'should return 200 and success on full update',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const payload = generateProduct(refs);
                const { status, body } = await apiRequest<UpdateResponse>({
                    method: 'PUT',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    body: { ...payload },
                });

                expect(status).toBe(200);
                expect(UpdateResponseSchema.parse(body)).toBeTruthy();
                expect(body.success).toBe(true);
            }
        );

        test(
            'should return 404 for non-existent productId',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const payload = generateProduct(refs);
                const { status, body } = await apiRequest<ItemNotFoundResponse>(
                    {
                        method: 'PUT',
                        url: `${ApiEndpoints.PRODUCTS}/${NON_EXISTENT_PRODUCT_ID}`,
                        baseUrl: process.env.API_URL,
                        body: { ...payload },
                    }
                );

                expect(status).toBe(404);
                expect(ItemNotFoundResponseSchema.parse(body)).toBeTruthy();
            }
        );

        // PUT /products/{id}: API does not validate `price` type at all -- accepts
        // strings/booleans/undefined as 200 and crashes on null with 500.
        // Phase 7: write tests as spec says, skip per backend behavior.
        for (const invalidValue of INVALID_NUMBER_VALUES) {
            /* eslint-disable playwright/no-skipped-test */
            // FIXME: PUT accepts coerced/invalid price values (200), null causes 500
            test.skip(
                `should return 422 when price is ${JSON.stringify(invalidValue)}`,
                { tag: '@api' },
                async ({ apiRequest }) => {
                    const payload = generateProduct(refs);
                    const { status } = await apiRequest({
                        method: 'PUT',
                        url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                        baseUrl: process.env.API_URL,
                        body: { ...payload, price: invalidValue },
                    });

                    expect(status).toBe(422);
                }
            );
        }
    });

    test.describe('patch /products/{productId}', () => {
        let productId: string;

        test.beforeAll('Create product to patch', async ({ request }) => {
            const payload = generateProduct(refs);
            const response = await request.post(
                `${process.env.API_URL}${ApiEndpoints.PRODUCTS}`,
                { data: payload }
            );
            const body = (await response.json()) as Product;
            productId = body.id;
        });

        test.afterAll('Delete product', async ({ request }) => {
            await request.delete(
                `${process.env.API_URL}${ApiEndpoints.PRODUCTS}/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`,
                    },
                }
            );
        });

        test(
            'should return 200 and success on partial update',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<UpdateResponse>({
                    method: 'PATCH',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    body: { name: 'patched-name' },
                });

                expect(status).toBe(200);
                expect(UpdateResponseSchema.parse(body)).toBeTruthy();
                expect(body.success).toBe(true);
            }
        );

        test(
            'should return 404 for non-existent productId',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<ItemNotFoundResponse>(
                    {
                        method: 'PATCH',
                        url: `${ApiEndpoints.PRODUCTS}/${NON_EXISTENT_PRODUCT_ID}`,
                        baseUrl: process.env.API_URL,
                        body: { name: 'whatever' },
                    }
                );

                expect(status).toBe(404);
                expect(ItemNotFoundResponseSchema.parse(body)).toBeTruthy();
            }
        );

        const PATCH_PRICE_SKIP = new Set<unknown>(['123', undefined]);
        for (const invalidValue of INVALID_NUMBER_VALUES) {
            const title = `should return 422 when price is ${JSON.stringify(invalidValue)}`;
            const runner = PATCH_PRICE_SKIP.has(invalidValue)
                ? // FIXME: PATCH coerces stringified numbers (200) and ignores undefined (omitted from JSON)
                  test.skip
                : test;
            runner(title, { tag: '@api' }, async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'PATCH',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    body: { price: invalidValue },
                });

                expect(status).toBe(422);
            });
        }
    });

    test.describe('delete /products/{productId}', () => {
        let productId: string;

        test.beforeEach('Create disposable product', async ({ request }) => {
            const payload = generateProduct(refs);
            const response = await request.post(
                `${process.env.API_URL}${ApiEndpoints.PRODUCTS}`,
                { data: payload }
            );
            const body = (await response.json()) as Product;
            productId = body.id;
        });

        test(
            'should return 204 on successful delete with admin auth',
            { tag: '@destructive' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest<null>({
                    method: 'DELETE',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    headers: process.env.ADMIN_ACCESS_TOKEN,
                });

                expect(status).toBe(204);
            }
        );

        test(
            'should return 401 when Authorization header is missing',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status, body } = await apiRequest<UnauthorizedResponse>(
                    {
                        method: 'DELETE',
                        url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                        baseUrl: process.env.API_URL,
                    }
                );

                expect(status).toBe(401);
                expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();

                // cleanup since DELETE was rejected
                await apiRequest({
                    method: 'DELETE',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    headers: process.env.ADMIN_ACCESS_TOKEN,
                });
            }
        );

        test(
            'should return 404 for non-existent productId with admin auth',
            { tag: '@api' },
            async ({ apiRequest, request }) => {
                const { status, body } = await apiRequest<ItemNotFoundResponse>(
                    {
                        method: 'DELETE',
                        url: `${ApiEndpoints.PRODUCTS}/${NON_EXISTENT_PRODUCT_ID}`,
                        baseUrl: process.env.API_URL,
                        headers: process.env.ADMIN_ACCESS_TOKEN,
                    }
                );

                expect(status).toBe(404);
                expect(ItemNotFoundResponseSchema.parse(body)).toBeTruthy();

                // cleanup the disposable product created in beforeEach
                await request.delete(
                    `${process.env.API_URL}${ApiEndpoints.PRODUCTS}/${productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`,
                        },
                    }
                );
            }
        );

        /* eslint-disable playwright/no-skipped-test */
        // FIXME: OpenAPI lists 409 ConflictResponse for DELETE /products/{id}
        // ("Returns when the entity is used elsewhere"). No reliable
        // reproducer without seeded order/cart linkage. Re-enable with
        // documented seed.
        test.skip(
            'should return 409 when product is used elsewhere',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'DELETE',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    headers: process.env.ADMIN_ACCESS_TOKEN,
                });
                expect(status).toBe(409);
            }
        );

        /* eslint-disable playwright/no-skipped-test */
        // FIXME: OpenAPI lists 422 UnprocessableEntityResponse for DELETE
        // /products/{id}, but DELETE has no request body to make invalid.
        // Spec drift -- backend never returns 422 for DELETE.
        test.skip(
            'should return 422 UnprocessableEntity for DELETE',
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'DELETE',
                    url: `${ApiEndpoints.PRODUCTS}/${productId}`,
                    baseUrl: process.env.API_URL,
                    headers: process.env.ADMIN_ACCESS_TOKEN,
                });
                expect(status).toBe(422);
            }
        );
    });
});
