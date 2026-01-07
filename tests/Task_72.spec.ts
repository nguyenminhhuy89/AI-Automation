import { expect, Locator } from "playwright/test";
import { commonLocators } from "./Page/elements.page";
import { test } from '../fixtures/myfixture'
import { PRODUCTS } from "../datatest/products";

test.describe('Confirm that user click on a Category in main menu and add the first product to shopping cart', () => {
    test.use({ storageState: ".auth/customer01.json" })
    let FictionBook: string
    test.beforeEach(async ({ page }) => {
        FictionBook = PRODUCTS.book2.name
    })
    test('Navigated to Book Category from Homepage', async ({ page }) => {
        await page.goto('/', { waitUntil: "networkidle" });
        await page.locator(commonLocators.TOPMENU_CATEGORY('Books')).click();
        await expect(page).toHaveURL('/books')
        await expect(page.locator('div.page-title')).toHaveText('Books')
    });
    test('vrf Sort by dropdownlist available and display default value is: Position ', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        const SortByDropdownList = page.locator('#products-orderby')
        await expect(SortByDropdownList).toBeVisible();
        await expect(SortByDropdownList).toContainText('Position')
    });
    test('vrf "Display per page" dropdownlist available and display default value is: 8 ', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        const DisplayDropdownList = page.locator('#products-pagesize')
        await expect(DisplayDropdownList).toBeVisible();
        await expect(DisplayDropdownList).toContainText('8')
    });
    test('vrf product-list will change acccording to "Display per page" dropdownlist changes 8 -> 4 ', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        const productItem = page.locator('.item-box');
        const DisplayDropdownList = page.locator('#products-pagesize')
        const productDisplayBeforeChange = await productItem.count();
        expect(productDisplayBeforeChange).toBeGreaterThan(4);
        await DisplayDropdownList.selectOption('4')
        await page.waitForSelector('.item-box')
        const productDisplayAfterChange = await productItem.count();
        expect(productDisplayAfterChange).toBe(4);
    })
    test('vrf "View as mode" invisible display default value is "Grid"', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        const viewAsMode = page.locator('#products-viewmode')
        await expect(viewAsMode).toBeVisible();
        await expect(viewAsMode).toContainText('Grid')
        await expect(page.locator('div.product-grid')).toBeVisible();
        await expect(page.locator('div.product-list')).not.toBeVisible();
    });
    test('vrf "View as mode" invisible display default value is "List"', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        const viewAsMode = page.locator('#products-viewmode')
        await expect(viewAsMode).toBeVisible();
        await viewAsMode.selectOption('List');
        await page.waitForSelector('div.product-list');
        await expect(viewAsMode).toContainText('List')
        await expect(page.locator('div.product-grid')).not.toBeVisible();
        await expect(page.locator('div.product-list')).toBeVisible();
    });
    test('Select and view product in selected Books category', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        await cartpage.viewProduct(FictionBook);
        await expect(page.locator('h1', { hasText: `${FictionBook}` })).toBeVisible();
        await expect(page).toHaveURL(`/${FictionBook}`, { ignoreCase: true })
    });
    test('vrf product information', async ({ page, cartpage }) => {
        await cartpage.gotoCategory('Books');
        await cartpage.viewProduct(FictionBook);
        const product = page.locator('div.product-essential');
        await expect(product.locator('div.picture')).toBeVisible();
        await expect(product.locator('div.product-name')).toHaveText(FictionBook);
        await expect(product.locator('div.stock')).toBeVisible();
        await expect(product.locator('div.product-reviews-overview')).toBeVisible();
        await expect(product.locator('div.prices')).toBeVisible();
        await expect(product.getByRole('textbox', { name: 'Qty' })).toBeVisible();
        await expect(product.getByRole('button', { name: 'Add to cart' })).toBeVisible();
        await expect(product.getByRole('button', { name: 'Email a friend' })).toBeVisible();
        await expect(product.getByRole('button', { name: 'Add to compare list' })).toBeVisible();
    })
    test('verify product status is in-stock', async ({ cartpage, productpage }) => {
        await cartpage.gotoCategory('Books');
        await cartpage.viewProduct(FictionBook);
        const isInStock = await productpage.checkProductStatus(FictionBook)
        expect(isInStock).toBeTruthy()
    })
    test('verify is adding in-stock product to cart successfully', { tag: '@addtocart' }, async ({ page, cartpage, productpage }) => {
        await cartpage.gotoCategory('Books');
        await cartpage.viewProduct(FictionBook);
        const cartQtyBefore = await cartpage.getCartQtyInHeader();
        console.log('Adding 1st product to shopping cart...')
        await cartpage.addProductToCart(FictionBook);
        const toastMessage = page.locator('#bar-notification');
        await expect(toastMessage).toHaveText('The product has been added to your shopping cart');
        const cartQtyAfter = await cartpage.getCartQtyInHeader();
        expect(cartQtyAfter).toBe(cartQtyBefore + 1);
        await productpage.verifyProductVisibleInMiniCart(FictionBook);
    })
});
test.describe('Searching product and add second product to shopping cart', () => {
    test.use({ storageState: ".auth/customer01.json" })
    let searchBar: Locator
    let toastMessage: Locator
    test.beforeEach(async ({ page }) => {
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');
        searchBar = page.locator('div.search-box form')
        toastMessage = page.locator('#bar-notification')
    });
    test('Confirm that search bar is visible and accepted value user inputted', async ({ page }) => {
        const searchContent = 'computer';
        const searchTextBox = searchBar.locator('//input[@type="text"]')
        const searchButton = searchBar.getByRole('button', { name: 'Search' })
        await expect(searchBar).toBeVisible()
        await expect(searchButton).toBeVisible()
        await expect(searchButton).toBeEnabled()
        await expect(searchTextBox).toBeVisible()
        await searchTextBox.fill(`${searchContent}`)
        await expect(searchTextBox).toHaveValue(`${searchContent}`)
    });
    test('confirm that the search bar returns the results that the user has entered', async ({ page, cartpage }) => {
        const searchContent = 'computer'
        await expect(searchBar).toBeVisible();
        await cartpage.searchProduct(searchContent);
        const countItemsInSearchResult: number = await cartpage.countProductinSearchResult()
        expect(countItemsInSearchResult).toBeGreaterThanOrEqual(1);
    });
    test('vrf the search results returned no products', async ({ page, cartpage }) => {
        const searchContent = 'iphone';
        await expect(searchBar).toBeVisible();
        await cartpage.searchProduct(searchContent);
        const countItemsInSearchResult: number = await cartpage.countProductinSearchResult()
        expect(countItemsInSearchResult).toBe(0);
        const searchResultMsg = await page.locator('div.search-results strong').textContent()
        expect(searchResultMsg).toContain('No products were found that matched your criteria.')
    });
    //kiểm tra sản phẩm đang in-stock hay out-stock›
    test('verify product status is in-stock', async ({ cartpage, productpage }) => {
        const searchContent = 'leather'
        await cartpage.gotoSearch(searchContent)
        const productRamdom = await productpage.getRandomProduct()
        await cartpage.viewProduct(productRamdom)
        const isInStock = await productpage.checkProductStatus(productRamdom)
        expect(isInStock).toBeFalsy()
    });
    test('Add out of stock product to return error', { tag: '@addtocart' }, async ({ page, cartpage }) => {
        const outOfStock = 'leather'
        await cartpage.searchProduct(`${outOfStock}`);
        await cartpage.addProductToCart(`${outOfStock}`)
        await page.waitForSelector('#bar-notification')
        await expect(toastMessage).toHaveText('Out of stock')
    });
    test('Add the 2nd product to shopping cart successfully', { tag: '@addtocart' }, async ({ page, cartpage, productpage }) => {
        const inStock = 'laptop'
        await cartpage.searchProduct(`${inStock}`);
        console.log('Adding 2nd product to shopping cart...')
        await cartpage.addProductToCart(`${inStock}`)
        await page.waitForSelector('#bar-notification')
        await expect(toastMessage).toHaveText('The product has been added to your shopping cart')
        await productpage.verifyProductVisibleInMiniCart(inStock);
    });
    test('Confirm that total product in shopping cart after adding two product', async ({ page, cartpage }) => {
        const countTotalProduct = await page.locator('.cart-item-row').count()
        expect(countTotalProduct).toBeGreaterThanOrEqual(2)
        console.log(`Total product is: ${countTotalProduct}`)
        await cartpage.removeAllItems()
        console.log('Remove all items in shoppingcart successfully!')
    });
})

