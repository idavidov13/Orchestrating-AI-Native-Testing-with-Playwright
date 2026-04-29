import { ApiEndpoints } from '../../../enums/app/app';
import {
    BrandsResponse,
    BrandsResponseSchema,
} from '../../../fixtures/api/schemas/app/brandSchema';
import {
    MethodNotAllowedResponse,
    MethodNotAllowedResponseSchema,
    ResourceNotFoundResponse,
    ResourceNotFoundResponseSchema,
} from '../../../fixtures/api/schemas/util/errorResponseSchema';
import { expect, test } from '../../../fixtures/pom/test-options';

test.describe('GET /brands', () => {
    test(
        'should return 200 and an array of brands',
        { tag: '@api' },
        async ({ apiRequest }) => {
            const { status, body } = await apiRequest<BrandsResponse>({
                method: 'GET',
                url: ApiEndpoints.BRANDS,
                baseUrl: process.env.API_URL,
            });

            expect(status).toBe(200);
            expect(BrandsResponseSchema.parse(body)).toBeTruthy();
            expect(Array.isArray(body)).toBe(true);
        }
    );

    test(
        'should return 405 for unsupported method PUT on /brands',
        { tag: '@api' },
        async ({ apiRequest }) => {
            const { status, body } = await apiRequest<MethodNotAllowedResponse>({
                method: 'PUT',
                url: ApiEndpoints.BRANDS,
                baseUrl: process.env.API_URL,
            });

            expect(status).toBe(405);
            expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
        }
    );

    /* eslint-disable playwright/no-skipped-test */
    // FIXME: OpenAPI lists 404 ResourceNotFoundResponse for GET /brands, but the
    // collection endpoint has no path parameter to invalidate -- 404 is not
    // reachable in practice. Re-enable if backend exposes a triggering condition.
    test.skip(
        'should return 404 ResourceNotFoundResponse',
        { tag: '@api' },
        async ({ apiRequest }) => {
            const { status, body } = await apiRequest<ResourceNotFoundResponse>({
                method: 'GET',
                url: ApiEndpoints.BRANDS,
                baseUrl: process.env.API_URL,
            });

            expect(status).toBe(404);
            expect(ResourceNotFoundResponseSchema.parse(body)).toBeTruthy();
        }
    );
});
