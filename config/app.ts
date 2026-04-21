/**
 * Typed shape for a test user's credentials and identity.
 */
export interface TestUser {
    readonly email: string;
    readonly password: string;
    readonly name: string;
    readonly role: string;
}

/**
 * Application configuration object.
 * Contains URL configuration for the main application.
 *
 * For route paths and API endpoints, use enums from `enums/app/app.ts`.
 */
export const appConfig = {
    /** Frontend application URL */
    appUrl: process.env.APP_URL,
    /** Backend API URL */
    apiUrl: process.env.API_URL,
};

/** Standard user credentials from USER_* env vars */
export const user: TestUser = {
    email: process.env.USER_EMAIL!,
    password: process.env.USER_PASSWORD!,
    name: process.env.USER_NAME!,
    role: process.env.USER_ROLE!,
};

/** Admin user credentials from ADMIN_* env vars */
export const admin: TestUser = {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    name: process.env.ADMIN_NAME!,
    role: process.env.ADMIN_ROLE!,
};
