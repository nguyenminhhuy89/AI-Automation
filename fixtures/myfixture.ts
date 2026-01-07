import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../tests/Page/Login.page';
import { RegisterPage } from '../tests/Page/Register.page';
import { AccountPage } from '../tests/Page/Account.page';
import { CartPage } from '../tests/Page/ShoppingCart.page';
import { PRODUCTS } from '../datatest/products';
import { OrderDetailPage } from '../tests/Page/OrderShortDetail.page';
import { OrderInfoPage } from '../tests/Page/OrderInformation.page';
import { ProductPage } from '../tests/Page/Product.page';

type MyFixture = {
    loginpage: LoginPage;
    register: RegisterPage;
    accountpage: AccountPage;
    productpage: ProductPage
    cartpage: CartPage;
    cartPageWith2Products: CartPage;
    orderDetailPage: OrderDetailPage;
    orderInfoPage: OrderInfoPage

}
export const test = base.extend<MyFixture>({

    loginpage: async ({ page, context }, use) => {
        const login = new LoginPage(page, context);

        await use(login);
        if (await page.getByRole('link', { name: 'Log out' }).isVisible().catch(() => false)) {
            await page.getByRole('link', { name: 'Log out' }).click();
        }
        await page.close();
    },
    register: async ({ page, context }, use: any) => {
        const register = new RegisterPage(page, context)
        await use(register);
    },
    accountpage: async ({ page }, use: any) => {
        const accountpage = new AccountPage(page)
        await page.goto('/customer/info')
        await use(accountpage)
    },
    productpage: async ({page}, use: any) => {
        const productpage = new ProductPage(page)
        await use(productpage)
    },
    cartpage: async ({ page }, use: any) => {
        const cartpage = new CartPage(page)
        await use(cartpage)
    },

    cartPageWith2Products: async ({ page, cartpage }, use: any) => {
        const cartPageWith2Products = new CartPage(page)
        await cartpage.gotoShoppingCart()
       
        await page.goto(PRODUCTS.book1.url)
        await cartpage.addProductToCart(PRODUCTS.book1.name)
        await page.goto(PRODUCTS.Laptop.url)
        await cartpage.addProductToCart(PRODUCTS.Laptop.name)
        await use(cartPageWith2Products)
        await cartpage.removeAllItems()

    },
    orderDetailPage: async ({page}, use: any) => {
        const orderDetailPage = new OrderDetailPage(page)
        await use(orderDetailPage)
    },
    orderInfoPage: async ({page}, use: any) => {
        const orderInfoPage = new OrderInfoPage(page)
        await use(orderInfoPage)
    }

});
