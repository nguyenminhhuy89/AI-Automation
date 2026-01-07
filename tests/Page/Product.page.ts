import { expect, Locator, type Page } from "@playwright/test";
import { CartPage } from "./ShoppingCart.page";

export class ProductPage {
    readonly page: Page;
    readonly shoppingCart: Locator
    readonly goToCartButton: Locator

    constructor(page: Page) {
        this.page = page
        this.shoppingCart = page.locator('#topcartlink');
        this.goToCartButton = page.locator('#flyout-cart input[value="Go to cart"]');
    }
    async goToCart() {
        await this.shoppingCart.hover();
        await this.goToCartButton.click();
    };
    //Check sản phẩm mới thêm vào có trong shopping cart trên header
    public async verifyProductVisibleInMiniCart(productName: string) {
        await this.shoppingCart.hover();
        const product = this.page.locator('div.mini-shopping-cart div.name',).filter({ hasText: productName });
        await expect(product).toBeVisible()
        const cartpage = new CartPage(this.page)
        const cartQty = await cartpage.getCartQtyInHeader()
        console.log(`🛒 Số lượng sản phẩm trong giỏ: ${cartQty}`);
    };
    //Kiểm tra trạng thái sản phẩm in-stock hay out of stock
    public async checkProductStatus(productName: string): Promise<boolean> {
        const productStatusText = await this.page.locator('div.product-essential div.stock').textContent()
        const productStatus = productStatusText?.replace('Availability:', '').trim() || '';
        console.log(`Product status is: ${productStatus}`)
        const isInStock = productStatus === 'In stock'
        if (isInStock) {
            console.log('🛒 Product is in stock')
        } else {
            console.log('🛒 Product is out of stock')
        }
        return isInStock
    }
    // select random sản phẩm trong search result
    public async getRandomProduct(): Promise<string> {
        let productTitle: string
        const productItems = this.page.locator('.product-item');
        const productCount = await productItems.count();
        // Generate random index
        const randomIndex = Math.floor(Math.random() * productCount);
        console.log(`Clicking on product at index: ${randomIndex}`);
        // Get product title before clicking
        const selectedProduct = productItems.nth(randomIndex);
        productTitle = await selectedProduct.locator('.product-title a').textContent() || '';
        console.log(`Selected product: ${productTitle}`);
        return productTitle
    }
}