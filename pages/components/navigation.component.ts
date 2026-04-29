import { Locator, Page } from '@playwright/test';

/**
 * Component Object for the main navigation bar.
 * Covers both unauthenticated (Sign in visible) and authenticated (user menu visible) states.
 *
 * Components are smaller, reusable pieces that can be composed into Page Objects.
 * Use this pattern for headers, footers, sidebars, modals, and other repeated UI elements.
 *
 * @example
 * ```ts
 * // Usage in a Page Object
 * export class DashboardPage {
 *     readonly nav: NavigationComponent;
 *
 *     constructor(private readonly page: Page) {
 *         this.nav = new NavigationComponent(page);
 *     }
 * }
 *
 * // In tests
 * await dashboardPage.nav.clickHome();
 * ```
 */
export class NavigationComponent {
    constructor(private readonly page: Page) {}

    // ==================== Locators ====================

    get container(): Locator {
        return this.page.getByRole('navigation');
    }

    get homeLink(): Locator {
        return this.page.getByRole('link', { name: 'Home' });
    }

    get categoriesButton(): Locator {
        return this.page.getByRole('button', { name: 'Categories' });
    }

    get handToolsLink(): Locator {
        return this.page.getByTestId('nav-hand-tools');
    }

    get powerToolsLink(): Locator {
        return this.page.getByTestId('nav-power-tools');
    }

    get otherLink(): Locator {
        return this.page.getByTestId('nav-other');
    }

    get specialToolsLink(): Locator {
        return this.page.getByTestId('nav-special-tools');
    }

    get rentalsLink(): Locator {
        return this.page.getByTestId('nav-rentals');
    }

    get contactLink(): Locator {
        return this.page.getByRole('link', { name: 'Contact' });
    }

    get signInLink(): Locator {
        return this.page.getByRole('link', { name: 'Sign in' });
    }

    get userMenuButton(): Locator {
        return this.page.getByTestId('nav-menu');
    }

    get myAccountLink(): Locator {
        return this.page.getByRole('link', { name: 'My account' });
    }

    get myFavoritesLink(): Locator {
        return this.page.getByRole('link', { name: 'My favorites' });
    }

    get myProfileLink(): Locator {
        return this.page.getByRole('link', { name: 'My profile' });
    }

    get myInvoicesLink(): Locator {
        return this.page.getByRole('link', { name: 'My invoices' });
    }

    get myMessagesLink(): Locator {
        return this.page.getByRole('link', { name: 'My messages' });
    }

    get signOutLink(): Locator {
        return this.page.getByTestId('nav-sign-out');
    }

    get cartLink(): Locator {
        return this.page.getByTestId('nav-cart');
    }

    get cartCount(): Locator {
        return this.page.getByTestId('cart-quantity');
    }

    // ==================== Actions ====================

    /**
     * Navigates to the home page via the navigation link.
     *
     * @returns {Promise<void>}
     */
    async clickHome(): Promise<void> {
        await this.homeLink.click();
    }

    /**
     * Navigates to the contact page via the navigation link.
     *
     * @returns {Promise<void>}
     */
    async clickContact(): Promise<void> {
        await this.contactLink.click();
    }

    /**
     * Opens the user dropdown menu.
     *
     * @returns {Promise<void>}
     */
    async openUserMenu(): Promise<void> {
        await this.userMenuButton.click();
    }

    /**
     * Performs sign out by opening user menu and clicking sign out.
     *
     * @returns {Promise<void>}
     */
    async signOut(): Promise<void> {
        await this.openUserMenu();
        await this.signOutLink.click();
    }

    /**
     * Opens the cart page via the navigation cart icon.
     *
     * @returns {Promise<void>}
     */
    async openCart(): Promise<void> {
        await this.cartLink.click();
    }
}
