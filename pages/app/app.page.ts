import { Locator, Page } from '@playwright/test';
import { NavigationComponent } from '../components/navigation.component';

/**
 * Page Object for the application home page (product listing).
 * Contains locators and methods for the main landing page.
 *
 * This also demonstrates the component composition pattern where reusable
 * UI components (like NavigationComponent) are composed into page objects.
 */
export class AppPage {
    /** Navigation component for header/nav interactions */
    readonly nav: NavigationComponent;

    constructor(private readonly page: Page) {
        this.nav = new NavigationComponent(page);
    }

    // ==================== Locators ====================

    get searchInput(): Locator {
        return this.page.getByPlaceholder('Search');
    }

    get searchButton(): Locator {
        return this.page.getByRole('button', { name: 'Search' });
    }

    get sortDropdown(): Locator {
        return this.page.getByRole('combobox', { name: 'sort' });
    }

    // ==================== Actions ====================

    /**
     * Navigates to the application home page using the configured APP_URL.
     * Waits for the page to reach DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async openHomePage(): Promise<void> {
        await this.page.goto(process.env.APP_URL!, {
            waitUntil: 'domcontentloaded',
        });
    }
}
