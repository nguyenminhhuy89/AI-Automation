import { Page } from '@playwright/test';

export interface OrderInfo {
    orderNumber: string;
    status: string;
    date: Date;
    dateString: string;
    total: string;
};

export class OrderDetailPage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page;

    }

    public async getOrderId() {
        const orderIDText = await this.page.locator('//div[@class="section order-item"]//strong').first().innerText();
        const orderId = orderIDText.replace("Order Number:", "").trim();
        console.log("Order ID =", orderId);
        return orderId;
    }

    
    public async getOrderTotal() {
        const orderTotalText = await this.page.locator('li:has-text("Order Total:")').first().innerText();
        const orderTotal = orderTotalText.replace("Order Total:", "").trim();
        console.log("Order Total =", orderTotal);
        return orderTotal;
    };
    // lấy thông tin tất cả các orders tại trang order detail
    public async getAllOrders(): Promise<OrderInfo[]> {
        const orders: OrderInfo[] = [];
        const orderItems = this.page.locator('.section.order-item');
        const count = await orderItems.count();

        for (let i = 0; i < count; i++) {
            const orderItem = orderItems.nth(i);

            // Get order number
            const titleText = await orderItem.locator('.title').textContent();
            const orderNumber = titleText?.replace('Order Number:', '').trim() || '';

            // Get status
            const statusText = await orderItem.locator('li:has-text("Order status:")').textContent();
            const status = statusText?.replace('Order status:', '').trim() || '';

            // Get date
            const dateText = await orderItem.locator('li:has-text("Order Date:")').textContent();
            const dateString = dateText?.replace('Order Date:', '').trim() || '';
            const date = new Date(dateString);

            // Get total
            const totalText = await orderItem.locator('li:has-text("Order Total:")').textContent();
            const total = totalText?.replace('Order Total:', '').trim() || '';

            orders.push({
                orderNumber,
                status,
                date,
                dateString,
                total
            });
        }
        return orders;
    };
    // So sánh order mới tạo với order đầu tiền trong Order Page
    public async verifyNewlyCreatedOrderIsFirst(newlyOrder: string): Promise<boolean> {
        await this.page.goto('https://demowebshop.tricentis.com/customer/orders');

        const firstOrderTitle = await this.page.locator('.order-item .title').first().textContent();
        const firstOrderNumber = firstOrderTitle?.replace('Order Number:', '').trim() || '';

        console.log('Newly created order number:', newlyOrder);
        console.log('First order number:', firstOrderNumber);
        const isFirst = firstOrderNumber === newlyOrder;

        if (isFirst) {
            console.log('✅ Newly created order is first');
        } else {
            console.log('❌ Newly created order is NOT first');
        }
        return isFirst;
    };
    // So sánh total number tại bước check out bằng với order total của order đầu tiên trong Order Page
    public async verifyTotalInCheckOutIsTheSameTotalInTheFirstOrder(totalNewlyOrder: string): Promise<boolean> {
        const allOrder = await this.getAllOrders();
        const theFirstOrder = allOrder[0];
        const totalNumberFirstOrder = theFirstOrder.total;

        console.log('Total number in check out step:', totalNewlyOrder);
        console.log('Total number of the first order in Order page:', totalNumberFirstOrder);

        const isEqual = totalNewlyOrder === totalNumberFirstOrder;

        if (isEqual) {
            console.log('✅ Total in check out step is equal with total of the first ordr in Order page');
        } else {
            console.log('❌ Total in check out step is not equal with total of the first ordr in Order page');
        }
        return isEqual
    };
    //vrf đơn hàng mới tạo có stt pending
    public async getLastestOrderStatus(newlyOrder: string): Promise<string> {
        const allOrder = await this.getAllOrders();
        const theFirstOrder = allOrder[0];
        const statusLastestOrder = theFirstOrder.status;
        return statusLastestOrder
    };
    //Click order detail button
    public async clickOrderDetailBtn(orderID: string): Promise<void> {
        const orderDetailsBtn = this.page.locator(`//strong[contains(text(), 'Order Number: ${orderID}')]/parent::div/following-sibling::div//input`)
        await this.page.goto('https://demowebshop.tricentis.com/customer/orders');
        await orderDetailsBtn.click({timeout: 3000})
    }

    // So sánh total number trong order information = total number ở bước check-out




}

