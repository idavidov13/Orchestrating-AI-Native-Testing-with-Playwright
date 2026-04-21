import { test as base } from '@playwright/test';
import { AppPage } from '../../pages/app/app.page';
import { LoginPage } from '../../pages/app/login.page';

/**
 * Framework fixtures for page objects.
 * Add new page object types here as you create them.
 */
export type FrameworkFixtures = {
    /** Main application page object (home / product listing) */
    appPage: AppPage;
    /** Login page object */
    loginPage: LoginPage;
    resetStorageState: () => Promise<void>;
};

/**
 * Extended test with page object fixtures.
 * Import this in your test files to access page objects.
 *
 * @example
 * ```ts
 * import { test, expect } from '../fixtures/pom/test-options';
 *
 * test('example test', async ({ appPage }) => {
 *   await appPage.openHomePage();
 * });
 * ```
 */
export const test = base.extend<FrameworkFixtures>({
    appPage: async ({ page }, use) => {
        await use(new AppPage(page));
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    resetStorageState: async ({ context }, use) => {
        await use(async () => {
            await context.clearCookies();
            await context.clearPermissions();
        });
    },
});
