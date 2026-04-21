import { expect, test } from '../../../fixtures/pom/test-options';
import { INVALID_LOGIN_ATTEMPTS } from '../../../test-data/static/app/invalidCredentials';

/**
 * Example functional test suite for login functionality.
 * Replace this with your actual login tests.
 */
test.describe('functional login', () => {
    test.beforeEach(async ({ resetStorageState, loginPage }) => {
        await resetStorageState();
        await loginPage.open();
    });

    test(
        'should login successfully with valid credentials',
        { tag: '@smoke' },
        async ({ loginPage }) => {
            await test.step('WHEN user enters valid credentials', async () => {
                await loginPage.login(
                    process.env.USER_EMAIL!,
                    process.env.USER_PASSWORD!
                );
            });

            await test.step('THEN user should see username displayed', async () => {
                await expect(loginPage.nav.userMenuButton).toBeVisible();
            });
        }
    );

    for (const { description, email, password } of INVALID_LOGIN_ATTEMPTS) {
        test(
            `should show error for invalid credentials - ${description}`,
            { tag: '@regression' },
            async ({ loginPage }) => {
                await test.step(`WHEN user enters invalid credentials - email: ${email}`, async () => {
                    await loginPage.login(email, password);
                });

                await test.step('THEN error message should be displayed', async () => {
                    await expect(loginPage.errorMessage).toBeVisible();
                });
            }
        );
    }
});
