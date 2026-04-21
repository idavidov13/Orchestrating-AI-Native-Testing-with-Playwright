/**
 * auth.setup.ts
 * Playwright setup script to generate storage states for authentication.
 *
 * This runs before the main test suite to:
 * 1. Authenticate via API and store access tokens
 * 2. Generate browser storage state with session cookies
 */

import * as fs from 'node:fs';
import { expect, test } from '../../fixtures/pom/test-options';
import { StorageStatePaths } from '../../enums/app/app';
import {
    createAppStorageState,
    setUserAccessToken,
} from '../../helpers/app/createStorageState';
import { admin, user } from '../../config/app';

test.describe('auth setup', () => {
    test('user setup authentication - API token', async ({ apiRequest }) => {
        await setUserAccessToken(apiRequest, user);
        expect(process.env['USER_ACCESS_TOKEN']).toBeDefined();
    });

    test('user setup authentication - browser storage state', async () => {
        await createAppStorageState(user, StorageStatePaths.APP);
        expect(fs.existsSync(StorageStatePaths.APP)).toBe(true);
    });

    test('admin setup authentication - API token', async ({ apiRequest }) => {
        await setUserAccessToken(apiRequest, admin);
        expect(process.env['ADMIN_ACCESS_TOKEN']).toBeDefined();
    });

    test('admin setup authentication - browser storage state', async () => {
        await createAppStorageState(admin, StorageStatePaths.ADMIN_APP);
        expect(fs.existsSync(StorageStatePaths.ADMIN_APP)).toBe(true);
    });
});
