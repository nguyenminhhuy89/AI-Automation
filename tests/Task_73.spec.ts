import { expect} from "playwright/test";
import { commonLocators } from "./Page/elements.page";
import { test } from '../fixtures/myfixture'
import { PRODUCTS } from "../datatest/products";
// sang
test.describe('Access to "Shopping cart" then remove and editting product quantity', () => {
    test.use({ storageState: ".auth/customer01.json" })
    test('Navigated to Shopping cart with 2 products already available',{tag:'@test_order',}, async ({ cartPageWith2Products }) => {
        await cartPageWith2Products.gotoShoppingCart();
        const countProductinCart = await cartPageWith2Products.countProductInCart()
        expect(countProductinCart).toBe(2)
    });
    test('Remove product', async ({ page, cartPageWith2Products }) => {
        const productItem = page.locator(commonLocators.PRODUCT_ITEM_SHOPPING_CART(PRODUCTS.book1.name))
        await cartPageWith2Products.gotoShoppingCart();
        await cartPageWith2Products.removeProduct(PRODUCTS.book1.name)
        await expect(productItem).not.toBeVisible();
    })
    test('edit product quantity', async ({ page, cartPageWith2Products }) => {
        const QtyField = page.locator(`//a[text()="${PRODUCTS.Laptop.name}"]/parent::td/following-sibling::td[@class="qty nobr"]/input`);
        const newQuantity = '4';
        await cartPageWith2Products.gotoShoppingCart();
        await expect(QtyField).toBeEditable();
        await cartPageWith2Products.editProductQuantity(PRODUCTS.Laptop.name, newQuantity);
        await expect(QtyField).toHaveValue(newQuantity);
    });
    test('Search product and add searched product to cart', async ({ page, cartPageWith2Products }) => {
        const searchKeyword = "computer";
        await cartPageWith2Products.gotoSearch(searchKeyword);
        await cartPageWith2Products.viewProduct(PRODUCTS.Computer1.name);
        await cartPageWith2Products.addProductToCart(PRODUCTS.Computer1.name);
        await cartPageWith2Products.gotoShoppingCart();
        const computerItemInShoppingCart = page.locator(commonLocators.PRODUCT_ITEM_SHOPPING_CART(PRODUCTS.Computer1.name));
        await expect(computerItemInShoppingCart).toBeVisible();
    });
    test('Verify Sub-total price is equal total price of products', async ({ cartPageWith2Products }) => {
        await cartPageWith2Products.gotoShoppingCart();
        const subTotalPrice = await cartPageWith2Products.getSubTotalPrice();
        const totalPriceAllProduct = await cartPageWith2Products.getTotalPriceAllProduct();
        expect(subTotalPrice).toEqual(totalPriceAllProduct)
    });
    // Checkout step (verify that can not process checkout step when termsofservice is not checked)
    test('verify that can not process checkout step when termsofservice is not checked', async ({ page, cartPageWith2Products }) => {
        await cartPageWith2Products.gotoShoppingCart();
        const termsDialog = page.getByRole('dialog', { name: 'Terms of service' })
        await page.getByRole('button', { name: 'Checkout' }).click();
        await expect(termsDialog).toBeVisible()
    });
    // Checkout step (verify that can not process checkout step when termsofservice is not checked)
    test('verify that process checkout step when termsofservice is checked', async ({ page, cartPageWith2Products }) => {
        await cartPageWith2Products.gotoShoppingCart();
        const productInShoppingCart = await cartPageWith2Products.countProductInCart()
        expect(productInShoppingCart).toBe(2)
        await cartPageWith2Products.clickCheckoutBtn();
        await expect(page).toHaveURL('/onepagecheckout')
    });
    test('verify that process checkout completed and return OrderID Number ',{tag:'@test_order',}, async ({ page, cartPageWith2Products }) => {
        await cartPageWith2Products.gotoShoppingCart();
        await cartPageWith2Products.getCartQtyInHeader() //<= Kiểm tra cart quantity header trước khi check-out
        await cartPageWith2Products.clickCheckoutBtn();
        await cartPageWith2Products.processCheckout6Steps();
        const orderCompletedMessage = page.getByText('Your order has been successfully processed!')
        await expect(orderCompletedMessage).toBeVisible()
        await cartPageWith2Products.getCartQtyInHeader() //<= Kiểm tra cart quantity header sau khi check-out
    });
    test('veridy page check-out completed', async ({page, cartpage}) => {
        await page.goto('/checkout/completed/');
        await expect(page.getByRole('link', {name: 'Click here for order details.'})).toBeVisible();
        await page.getByRole('link', {name: 'Click here for order details.'}).click();
        const orderID = await cartpage.getOrderID();
        await expect(page).toHaveURL(`https://demowebshop.tricentis.com/orderdetails/${orderID}`);
    })
    test('verify click Continue btn at Checkout completed page to navigated user to Homepage', async ({page, cartpage}) => {
        await page.goto('/checkout/completed/');
        await expect(page.getByRole('button', {name: 'Continue'})).toBeVisible();
        await page.getByRole('button', {name: 'Continue'}).click();
        await expect(page).toHaveURL('https://demowebshop.tricentis.com/')
    })
})