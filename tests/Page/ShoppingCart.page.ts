import { type Page, type Locator } from "playwright";
import { commonLocators } from "./elements.page";
import * as fs from 'fs';
import * as path from 'path';

export interface Product {
    name: string;
    price: number;
    quantity: number;
}
export interface OrderInfo {
    orderNumber: string;
    products: Product[];
    orderDate: string;
    payment: string;
    total: string;
};


export class CartPage {
    readonly page: Page;
    readonly removeButtons: Locator
    readonly updateCartButton: Locator

    constructor(page: Page) {
        this.page = page;
        this.removeButtons = page.locator('//td[@class="remove-from-cart"]//input');
        this.updateCartButton = page.locator('.update-cart-button');
    }
    public async gotoShoppingCart() {
        await this.page.goto('/cart', { waitUntil: "networkidle" })
    }
    public async gotoCategory(CATEGORY_NAME: string) {
        await this.page.goto('/')
        await this.page.locator(commonLocators.TOPMENU_CATEGORY(`${CATEGORY_NAME}`)).click();
        await this.page.waitForLoadState('networkidle')
    }
    public async viewProduct(productName: string| any) {
        await this.page.locator(commonLocators.PRODUCT_THUMBNAIL_NAME(productName)).click();
        // await this.page.locator(`//h2/a[contains(text(),'${productName}')]`).click()

    }
    public async addProductToCart(productName: string) {
        const productContainer = this.page.locator('.product-item, .product-essential')
            .filter({ hasText: productName });

        // Tìm nút "Add to cart" trong vùng chứa đó và nhấn.
        await productContainer.getByRole('button', { name: 'Add to cart' }).first().click();
        await this.page.waitForLoadState("networkidle")
    }
    public async removeProduct(productName: string) {
        await this.page.locator(`//a[text()="${productName}"]/parent::td/preceding-sibling::td//input`).check();
        await this.page.locator('.update-cart-button').click();
    }
    public async editProductQuantity(productName: String, quantity: String) {
        await this.page.locator(`//a[text()="${productName}"]/parent::td/following-sibling::td[@class="qty nobr"]/input`).fill(`${quantity}`)
        await this.page.locator('.update-cart-button').click();
        await this.page.waitForSelector(`//a[text()="${productName}"]/parent::td/following-sibling::td[@class="qty nobr"]/input`)
    }
    public async searchProduct(productName: string) {
        await this.page.locator('#small-searchterms').fill(productName);
        await this.page.locator('.search-box-button').click();
        await this.page.waitForLoadState('networkidle')
    }
    public async gotoSearch(searchKeyword: string) {
        await this.page.goto(`https://demowebshop.tricentis.com/search?q=${searchKeyword}`, { waitUntil: "networkidle" })
    }
    public async countProductinSearchResult(): Promise<number> {
        return this.page.locator('//div[@class="item-box"]').count()
    }
    public async countItemInShoppingCart(productName: string) {
        const countItems = await this.page.locator(`//a[contains(text(), "${productName}")]/ancestor::tr[@class="cart-item-row"]`).count();
        console.log(`Product "${productName}" count is:${countItems}`)
        return countItems
    }
    public async countProductInCart(): Promise<number> {
        const count = await this.page.locator('//tbody/tr[@class="cart-item-row"]').count()
        return count
    }
    public async removeAllItems() {
        const count = await this.removeButtons.count();
        if (count > 0) {
            // Check all remove checkboxes
            for (let i = 0; i < count; i++) {
                await this.removeButtons.nth(i).check();
            }
            await this.updateCartButton.click();
            await this.page.waitForLoadState('networkidle');
        }
    }
    public async clickCheckoutBtn() {
        await this.page.locator('//input[@id="termsofservice"]').check()
        await this.page.getByRole('button', { name: 'Checkout' }).click()
        await this.page.waitForSelector('//div[@id="billing-buttons-container"]//input', {
            state: 'visible',
            timeout: 10000
        });
        // await this.page.waitForLoadState('networkidle')
    }
    public async processCheckout6Steps() {
        const orderinfo: OrderInfo = {
            orderNumber: '',
            products: [],
            orderDate: '',
            payment: '',
            total: '',
        };
        await this.page.locator('//div[@id="billing-buttons-container"]//input').click()
        await this.page.locator('//div[@id="shipping-buttons-container"]//input').click()
        await this.page.locator('//div[@id="shipping-method-buttons-container"]//input').click()
        await this.page.locator('//div[@id="payment-method-buttons-container"]//input').click()
        await this.page.locator('//div[@id="payment-info-buttons-container"]//input').click()
        await this.page.waitForSelector('tr.cart-item-row', {
            state: 'visible',
            timeout: 10000
        });
        //get product, Total price và payment medthod
        const productList = await this.getProducts()
        const totalPrice = await this.getTotalPrice()
        const paymentMethod = await this.getPaymentMethod()

        await this.page.locator('//div[@id="confirm-order-buttons-container"]//input').click()
        await this.page.waitForLoadState('networkidle')
        //get orderID sau khi checkout thành công
        const orderNumberID = await this.getOrderIdNumber()
        //get orderDate
        const orderDate = await this.getOrderDate()

        // Assign to object sau khi checkout thành công
        orderinfo.total = totalPrice;
        orderinfo.orderNumber = orderNumberID;
        orderinfo.products = productList;
        orderinfo.orderDate = orderDate;
        orderinfo.payment = paymentMethod;

        fs.writeFileSync(
            '.auth/order-detail.json',
            JSON.stringify(orderinfo, null, 2)
        );
    }
    //----------

    // Giá chi tiết từng sản phẩm trong Giỏ hàng (Total = price x Quantity)
    public async getProductTotalPrice(productName: string): Promise<number> {
        const row = this.page.getByRole('row', { name: new RegExp(productName, "i") });
        // Get Price
        const priceText = await row.locator('//td[@class="unit-price nobr"]').innerText();
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        // Get Quantity
        const quantityInput = row.locator('input.qty-input')
        const quantityValue = await quantityInput.inputValue()
        const quantity = parseInt(quantityValue, 10);
        // get Total = price x Quantity
        const total = price * quantity;
        console.log(`Sản phẩm "${productName}": Giá = ${price}, Số lượng = ${quantity}, Tổng = ${total}`);
        return total;
    };

    // Giá tất cả các sản phẩm trong Giỏ hàng
    public async getTotalPriceAllProduct(): Promise<number> {
        const countTotalProduct = await this.page.locator('.cart-item-row').count();
        let sumTotalAllProduct = 0;
        for (let i = 0; i < countTotalProduct; i++) {
            const productsTotalPriceText = await this.page.locator('span.product-subtotal').nth(i).innerText()
            const productsTotalPrice = parseFloat(productsTotalPriceText.replace(/[^\d.]/g, ''))
            sumTotalAllProduct += productsTotalPrice
        }
        // console.log(`Tổng số tiền các sản phẩm là: ${sumTotalAllProduct}`);
        return sumTotalAllProduct
    };
    // Sub-Total price trong Shopping Cart 
    public async getSubTotalPrice(): Promise<number> {
        const subtotalPrice_Text = await this.page.locator('//span[text()="Sub-Total:"]/parent::td/following-sibling::td//span//span').innerText();
        const subtotalPrice = parseFloat(subtotalPrice_Text.replace(/[^\d.]/g, ''));
        return subtotalPrice
    }
    //----------

    //get Payment method tại step Confirm order
    private async getPaymentMethod(): Promise<string> {
        const paymentMethodElement = this.page.locator('//li[@class="payment-method"]');
        const paymentMethodText = await paymentMethodElement.innerText();
        const paymentMethod =
            paymentMethodText?.replace('Order status:', '').trim() || '';
        console.log(`Payment Methods: ${paymentMethod}`)
        return paymentMethod
    };

    // lấy danh sách sản phẩm tại step Confirm order
    private async getProducts(): Promise<Product[]> {
        const products: Product[] = [];

        // Locator cho tất cả product rows
        const productRows = this.page.locator('tr.cart-item-row');
        const count = await productRows.count();

        console.log(`count= ${count}`)

        for (let i = 0; i < count; i++) {
            const row = productRows.nth(i);

            // Get product name
            const name = await row.locator('td.product a.product-name').innerText();

            // Get price
            const priceText = await row.locator('td.unit-price').innerText();
            const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

            // Get quantity
            const qtyText = await row.locator('td.qty').innerText();
            const quantity = parseFloat(qtyText.replace(/[^\d.]/g, ''));

            products.push({
                name,
                price,
                quantity,
                // total
            });
            console.log(`Sản phẩm: ${name}`)
        }
        return products;
    }

    // lấy total Price tại step Confirm order
    private async getTotalPrice(): Promise<string> {
        const totalPriceText = await this.page.locator('//span[normalize-space()="Total:"]/parent::td/following-sibling::td//span//span').innerText();
        const totalPrice = totalPriceText.replace(/[^\d.]/g, '');
        return totalPrice
    }

    // lấy orderDate sau khi check-out thành công
    private async getOrderDate(): Promise<string> {
        const orderDate = Date();
        const dateObj = new Date(orderDate);
        function formatToDDMMYYYY(date: Date): string {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        }

        const formattedDate = formatToDDMMYYYY(dateObj);

        console.log(formattedDate);

        return formattedDate
    }
    // lấy Order ID number sau khi check-out thành công
    private async getOrderIdNumber(): Promise<string> {
        const orderIdNumberElement = this.page.locator('//ul[@class="details"]//li').first();
        const orderIdNumberText = await orderIdNumberElement.innerText();
        const orderNumberID =
            orderIdNumberText.replace(/\D/g, '');
        return orderNumberID
    };

    //Get Shopping Cart quantity in header link
    public async getCartQtyInHeader(): Promise<number> {
        const cartQuantityText = await this.page.locator('span.cart-qty').innerText()
        const cartQtyHeader = parseInt(cartQuantityText.replace(/[^\d]/g, ''), 10);
        // console.log(`🛒 Số lượng sản phẩm trong giỏ: ${cartQtyHeader}`);
        return cartQtyHeader
    };
    public async getOrderID() {
        const filePath = path.join(process.cwd(), '.auth', 'order-detail.json');
        const orderData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const orderID = orderData.orderNumber;
        console.log("Order ID mới =", orderID);
        return orderID
    }

}