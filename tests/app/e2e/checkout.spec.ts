import { faker } from '@faker-js/faker';
import { expect, test } from '../../../fixtures/pom/test-options';
import { user } from '../../../config/app';
import { Messages } from '../../../enums/app/app';

const PRODUCT_NAME = 'Combination Pliers';

const billingAddress = {
    country: 'AT',
    postalCode: '1010',
    houseNumber: faker.number.int({ min: 1, max: 99 }).toString(),
};

const PAYMENT_METHOD = 'cash-on-delivery';

test.describe('checkout flow', () => {
    test.beforeEach(async ({ appPage }) => {
        await appPage.openHomePage();
    });

    test(
        'should complete a purchase end-to-end',
        { tag: '@e2e' },
        async ({ page, appPage, productPage, checkoutPage }) => {
            await test.step('GIVEN authenticated user lands on the home page', async () => {
                await expect(page.getByText(user.name)).toBeVisible();
            });

            await test.step('WHEN user opens a product and adds it to the cart', async () => {
                await appPage.openProductByName(PRODUCT_NAME);
                await expect(productPage.title).toHaveText(PRODUCT_NAME);
                await productPage.addToCart();
                await expect(productPage.nav.cartCount).toHaveText('1');
            });

            await test.step('AND user opens the cart and verifies the item', async () => {
                await productPage.nav.openCart();
                await expect(checkoutPage.cartProductTitle).toHaveText(
                    PRODUCT_NAME
                );
                await expect(checkoutPage.cartProductQuantity).toHaveValue('1');
                const unitPrice =
                    (await checkoutPage.cartProductPrice.textContent()) ?? '';
                await expect(checkoutPage.cartLineTotal).toHaveText(unitPrice);
            });

            await test.step('AND user proceeds through cart and sign-in steps', async () => {
                await checkoutPage.proceedFromCart();
                await expect(checkoutPage.signInProceedButton).toBeVisible();
                await checkoutPage.proceedFromSignIn();
            });

            await test.step('AND user fills the billing address', async () => {
                await checkoutPage.fillBillingAddress(billingAddress);
                await expect(checkoutPage.streetInput).not.toHaveValue('');
                await expect(checkoutPage.cityInput).not.toHaveValue('');
                await checkoutPage.proceedFromBilling();
            });

            await test.step('AND user selects a payment method and confirms', async () => {
                await checkoutPage.selectPaymentMethod(PAYMENT_METHOD);
                await expect(checkoutPage.confirmButton).toBeEnabled();
                await checkoutPage.confirmPayment();
            });

            await test.step(`THEN user sees "${Messages.PAYMENT_SUCCESS}"`, async () => {
                await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
            });
        }
    );
});
