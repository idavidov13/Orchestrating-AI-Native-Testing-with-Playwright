import { chromium, expect } from '@playwright/test';
import { ApiEndpoints, StorageStatePaths } from '../../enums/app/app';
import { LoginPage } from '../../pages/app/login.page';
import { ApiRequestFn } from '../../fixtures/api/api-types';
import {
    LoginResponse,
    LoginResponseSchema,
} from '../../fixtures/api/schemas/app/userSchema';
import { TestUser } from '../../config/app';

/**
 * Creates and saves the browser storage state after successful login.
 * This is used for authentication setup before running tests.
 *
 * The storage state includes cookies and localStorage, allowing subsequent
 * tests to start in an authenticated state without performing login.
 *
 * @returns {Promise<void>} Resolves when storage state is saved.
 *
 * @example
 * ```ts
 * // In auth.setup.ts
 * test('Setup authentication', async () => {
 *   await createAppStorageState();
 * });
 * ```
 */
export async function createAppStorageState(
    user: TestUser,
    storagePath: StorageStatePaths
): Promise<void> {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.loginAndVerify(user);

    await context.storageState({ path: storagePath });
    await browser.close();
}

/**
 * Authenticates via API and stores the access token in environment variables.
 * Use this for API tests that require authentication headers.
 *
 * The token is stored in `process.env.ACCESS_TOKEN` and can be used
 * with the `headers` parameter in API requests.
 *
 * @param {ApiRequestFn} apiRequest - The API request function from fixtures.
 * @returns {Promise<void>} Resolves when token is stored.
 *
 * @example
 * ```ts
 * // In auth.setup.ts
 * test('Setup API authentication', async ({ apiRequest }) => {
 *   await setUserAccessToken(apiRequest);
 * });
 *
 * // In API tests
 * const { status, body } = await apiRequest<UserData>({
 *   method: 'GET',
 *   url: '/api/users/me',
 *   baseUrl: process.env.API_URL,
 *   headers: process.env.ACCESS_TOKEN,
 * });
 * ```
 */
export async function setUserAccessToken(
    apiRequest: ApiRequestFn,
    user: TestUser
): Promise<void> {
    const { status, body } = await apiRequest<LoginResponse>({
        method: 'POST',
        url: ApiEndpoints.LOGIN,
        baseUrl: process.env.API_URL,
        body: {
            email: user.email,
            password: user.password,
        },
    });

    expect(status).toBe(200);
    expect(LoginResponseSchema.parse(body)).toBeTruthy();

    process.env[`${user.role.toUpperCase()}_ACCESS_TOKEN`] = body.access_token;
}
