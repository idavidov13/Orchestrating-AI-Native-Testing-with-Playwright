import { Locator, Page } from '@playwright/test';
import { Routes } from '../../enums/app/app';
import { NavigationComponent } from '../components/navigation.component';

/**
 * Page Object for the product detail page at /product/:id.
 * Contains locators and methods for viewing a product and adding it to the cart.
 */
export class ProductPage {
    /** Navigation component for header/nav interactions */
    readonly nav: NavigationComponent;

    constructor(private readonly page: Page) {
        this.nav = new NavigationComponent(page);
    }

    // ==================== Locators ====================

    get title(): Locator {
        return this.page.getByRole('heading', { level: 1 });
    }

    get addToCartButton(): Locator {
        return this.page.getByRole('button', { name: 'Add to cart' });
    }

    get quantityInput(): Locator {
        return this.page.getByRole('spinbutton', { name: 'Quantity' });
    }

    get increaseQuantityButton(): Locator {
        return this.page.getByRole('button', { name: 'Increase quantity' });
    }

    get decreaseQuantityButton(): Locator {
        return this.page.getByRole('button', { name: 'Decrease quantity' });
    }

    // ==================== Actions ====================

    /**
     * Navigates directly to a product detail page by product id.
     *
     * @param {string} productId - Product ULID from the URL.
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(productId: string): Promise<void> {
        await this.page.goto(
            `${process.env.APP_URL!}${Routes.PRODUCT}/${productId}`,
            {
                waitUntil: 'domcontentloaded',
            }
        );
    }

    /**
     * Adds the current product to the cart and waits for the cart counter
     * in the navigation to update.
     *
     * @returns {Promise<void>} Resolves when the cart badge reflects the new item.
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}
