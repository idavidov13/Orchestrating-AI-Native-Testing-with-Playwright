import { Locator, Page } from '@playwright/test';
import { Messages, Routes } from '../../enums/app/app';
import { NavigationComponent } from '../components/navigation.component';

/** Billing address inputs auto-completed from country + postal code + house number. */
export interface BillingAddress {
    country: string;
    postalCode: string;
    houseNumber: string;
}

/**
 * Page Object for the multi-step checkout flow at /checkout.
 * Covers cart review (step 1), sign-in confirmation (step 2),
 * billing address (step 3), and payment (step 4).
 */
export class CheckoutPage {
    /** Navigation component for header/nav interactions */
    readonly nav: NavigationComponent;

    constructor(private readonly page: Page) {
        this.nav = new NavigationComponent(page);
    }

    // ==================== Cart step locators ====================

    get cartProductTitle(): Locator {
        return this.page.getByTestId('product-title');
    }

    get cartProductQuantity(): Locator {
        return this.page.getByTestId('product-quantity');
    }

    get cartProductPrice(): Locator {
        return this.page.getByTestId('product-price');
    }

    get cartLineTotal(): Locator {
        return this.page.getByTestId('line-price');
    }

    get cartProceedButton(): Locator {
        return this.page.getByTestId('proceed-1');
    }

    // ==================== Sign-in step locators ====================

    get signInProceedButton(): Locator {
        return this.page.getByTestId('proceed-2');
    }

    // ==================== Billing step locators ====================

    get countrySelect(): Locator {
        return this.page.getByTestId('country');
    }

    get postalCodeInput(): Locator {
        return this.page.getByTestId('postal_code');
    }

    get houseNumberInput(): Locator {
        return this.page.getByTestId('house_number');
    }

    get streetInput(): Locator {
        return this.page.getByTestId('street');
    }

    get cityInput(): Locator {
        return this.page.getByTestId('city');
    }

    get stateInput(): Locator {
        return this.page.getByTestId('state');
    }

    get billingProceedButton(): Locator {
        return this.page.getByTestId('proceed-3');
    }

    // ==================== Payment step locators ====================

    get paymentMethodSelect(): Locator {
        return this.page.getByTestId('payment-method');
    }

    get confirmButton(): Locator {
        return this.page.getByTestId('finish');
    }

    // ==================== Feedback locators ====================

    get paymentSuccessMessage(): Locator {
        return this.page.getByText(Messages.PAYMENT_SUCCESS);
    }

    // ==================== Actions ====================

    /**
     * Navigates directly to the checkout page.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto(`${process.env.APP_URL!}${Routes.CHECKOUT}`, {
            waitUntil: 'domcontentloaded',
        });
    }

    /**
     * Advances from the cart step to the sign-in step.
     *
     * @returns {Promise<void>}
     */
    async proceedFromCart(): Promise<void> {
        await this.cartProceedButton.click();
    }

    /**
     * Advances past the sign-in step (assumes user already authenticated).
     *
     * @returns {Promise<void>}
     */
    async proceedFromSignIn(): Promise<void> {
        await this.signInProceedButton.click();
    }

    /**
     * Fills the billing address by country, postal code, and house number.
     * Street, city, and state are auto-populated by the application.
     *
     * @param {BillingAddress} address - Country code, postal code, and house number.
     * @returns {Promise<void>} Resolves when street is auto-populated.
     */
    async fillBillingAddress(address: BillingAddress): Promise<void> {
        await this.countrySelect.selectOption(address.country);
        await this.postalCodeInput.fill(address.postalCode);
        await this.houseNumberInput.fill(address.houseNumber);
    }

    /**
     * Advances from the billing step to the payment step.
     *
     * @returns {Promise<void>}
     */
    async proceedFromBilling(): Promise<void> {
        await this.billingProceedButton.click();
    }

    /**
     * Selects a payment method by its option value.
     *
     * @param {string} method - Payment method option value (e.g. 'cash-on-delivery').
     * @returns {Promise<void>}
     */
    async selectPaymentMethod(method: string): Promise<void> {
        await this.paymentMethodSelect.selectOption(method);
    }

    /**
     * Confirms the payment by clicking the finish button.
     *
     * @returns {Promise<void>}
     */
    async confirmPayment(): Promise<void> {
        await this.confirmButton.click();
    }
}
