import { expect } from "playwright/test";
import { test } from '../fixtures/myfixture';
import { OrderInfoPage } from "./Page/OrderInformation.page";
import * as orderDetail from '../.auth/order-detail.json';
import * as testdata from '../.auth/user01.json';

test.describe('verify order page', () => {
    test.beforeEach(async ({ page, loginpage }) => {
        await loginpage.loginAccount(testdata.email, testdata.password)
        await page.goto('/customer/orders')
        await page.waitForLoadState('networkidle')
    })

    test('verify Order items on Order page having at least 02 completed Orders ', async ({ page }) => {
        await expect(page.locator('h1', { hasText: 'My account - Orders' })).toBeVisible();
        const orderItems = await page.locator('.order-item').count();
        expect(orderItems).toBeGreaterThanOrEqual(2)
    });
    //vrf đơn hàng mới tạo là order đầu tiên trong order page
    test('vrf newly created order is the first order in order page', async ({ orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber;
        const isFirst = await orderDetailPage.verifyNewlyCreatedOrderIsFirst(newlyOrderCreated);
        expect(isFirst).toBeTruthy();
    });
    //vrf đơn hàng mới tạo có Total number bằng với total number của order đầu tiên trong Order Page
    test('verify order total is the same with lastest order total when check out completed', async ({ orderDetailPage }) => {
        const totalInCheckoutPage = orderDetail.total;
        const isEqual = await orderDetailPage.verifyTotalInCheckOutIsTheSameTotalInTheFirstOrder(totalInCheckoutPage);
        expect(isEqual).toBeTruthy();
    });
    //vrf đơn hàng mới tạo có stt pending
    test(' vrf newly order created have status pending', async ({ orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber;
        const Status = await orderDetailPage.getLastestOrderStatus(newlyOrderCreated)
        expect(Status).toBe('Pending')
    })
    test('verify details button navigated to user to order information page', async ({ page, orderInfoPage, orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber;
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated);
        await expect(page).toHaveURL(`https://demowebshop.tricentis.com/orderdetails/${newlyOrderCreated}`);
        await orderInfoPage.saveOrderDetails()
        await expect(page.locator('//h1')).toHaveText('Order information');
    });
    test('vrf orderID is the same orderID when check-out completed', async ({ page }) => {
        const orderinfopage = new OrderInfoPage(page)
        const newlyOrderCreated = orderDetail.orderNumber;
        const isMatched = await orderinfopage.isExpectedOrderSameWithOrderInformation(newlyOrderCreated)
        expect(isMatched).toBeTruthy();
    });
    test('vrf Total number in Order Information page is the same Total number when check-out completed', async ({ orderInfoPage, orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber;
        const expectedTotalNumber = orderDetail.total;
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated);
        const isEqual = await orderInfoPage.isTotalNumberSameTotalNumberInOrderInformation(expectedTotalNumber);
        expect(isEqual).toBeTruthy();
    });
    test('vrf order date is the same order date when check-out completed', async ({ orderInfoPage, orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber;
        const expectedOrderDate = orderDetail.orderDate;
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated);
        const isEqual = await orderInfoPage.isOrderDateSameToOrderDateInOrderInformation(expectedOrderDate);
        expect(isEqual).toBeTruthy();
    })
    test('vrf order status in Order infomation is pending', async ({ orderInfoPage, orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated);
        const orderInfo = await orderInfoPage.getAllOrderDetails()
        const orderStatus = orderInfo.orderStatus
        expect(orderStatus).toBe('Pending')
    })
    test('vrf product list is matched between Order information & Order details when check-out completed', async ({orderInfoPage, orderDetailPage}) => {
        const newlyOrderCreated = orderDetail.orderNumber
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated);
        const isMatched =  await orderInfoPage.verifyProductListMatchCheckOut()
        expect(isMatched).toBeTruthy()
    })
    //Click ‘Re-order’ to update Order
    test('verify click re-order button navigate user to shopping cart', async ({ page, orderDetailPage }) => {
        const newlyOrderCreated = orderDetail.orderNumber
        await orderDetailPage.clickOrderDetailBtn(newlyOrderCreated)
        await expect(page.getByRole('button', { name: 'Re-order' })).toBeVisible()
        await page.getByRole('button', { name: 'Re-order' }).click({timeout:3000});
        await expect(page).toHaveURL('https://demowebshop.tricentis.com/cart')
    })
    // verify danh sách sản phẩm giống trong giỏ hàng giống với order information

    //verify bấm 'continue shopping' ==> qua trang search

    // tìm và thêm 1 sản phẩm

    // verify danh sách sản phẩm sau khi thêm sẽ tăng thêm 1

    

    


})