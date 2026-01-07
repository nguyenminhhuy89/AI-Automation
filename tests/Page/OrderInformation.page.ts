// pages/OrderDetailsPage.ts
import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface Product {
  name: string;
  price: number;
  quantity: number;
}
export interface OrderDetails {
  orderId: string;
  products: Product[];
  orderDate?: string;
  paymentMethod: string;
  orderTotal: string;
  orderStatus: string;
}

export class OrderInfoPage {
  constructor(private page: Page) { }

  /**
   * Get Order ID
   */
  async getOrderId(): Promise<string> {
    // Selector: "Order #2162975"
    const orderIdText = await this.page.locator('//div[@class="order-number"]').textContent();
    const orderId = orderIdText?.replace('Order #', '').trim() || '';
    return orderId;
  }
  /**
   * Get all products from order details page
   */
  async getProducts(): Promise<Product[]> {
    const products: Product[] = [];

    const productRows = this.page.locator('div.section.products table tbody tr');
    const count = await productRows.count();
    console.log(count)

    for (let i = 0; i < count; i++) {
      const row = productRows.nth(i);

      const nameElement = row.locator('td.a-left.name').nth(0);
      const name = (await nameElement.textContent())?.trim() || '';

      const priceElement = row.locator('td.a-right.price');
      const priceText = (await priceElement.innerText())?.trim() || '0';
      const price = parseFloat(priceText);

      const qtyElement = row.locator('td.a-center.quantity');
      const qtyText = (await qtyElement.innerText())?.trim() || '0';
      const quantity = parseInt(qtyText);

      products.push({ name, price, quantity });
    }

    return products;
  }


  /**
   * Get Order Total
   */
  async getOrderTotal(): Promise<string> {
    // Selector: "Order Total: 32.00"
    const totalText = await this.page.locator('//span[contains(text(), "Order Total:")]/parent::td/following-sibling::td//span//strong').textContent();
    const total = totalText?.replace('Order Total:', '').trim() || '';
    return total;
  }

  /**
   * Get Order Status
   */
  async getOrderStatus(): Promise<string> {
    // Selector: "Order Status: Pending"
    const statusText = await this.page
      .locator('text=Order Status:')
      // .locator('..')
      .textContent();

    const status = statusText?.replace('Order Status:', '').trim() || '';
    return status;
  }

  /**
   * Get Payment Method
   */
  async getPaymentMethod(): Promise<string> {
    // Selector trong Billing Address section
    const paymentText = await this.page
      .locator('//li[@class="payment-method"]')
      .textContent();

    return paymentText?.trim() || '';
  }

  /**
   * Get Order Date (optional)
   */
  async getOrderDate(): Promise<string> {
    const dateText = await this.page
      .locator('text=Order Date:')
      // .locator('..')
      .textContent();

    const rawDate = dateText?.replace('Order Date:', '').trim() || '';
    const dateObj = new Date(rawDate);
    function formatToDDMMYYYY(date: Date): string {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }
    const date = formatToDDMMYYYY(dateObj)
    return date;
  }

  /**
   * Get all order details
   */
  async getAllOrderDetails(): Promise<OrderDetails> {
    const orderinfo: OrderDetails = {
      orderId: '',
      products: [],
      orderDate: '',
      paymentMethod: '',
      orderTotal: '',
      orderStatus: '',
    }
    const orderId = await this.getOrderId();
    const products = await this.getProducts();
    const orderTotal = await this.getOrderTotal();
    const orderStatus = await this.getOrderStatus();
    const paymentMethod = await this.getPaymentMethod();
    const orderDate = await this.getOrderDate();

    return {
      orderId,
      products,
      orderTotal,
      orderStatus,
      paymentMethod,
      orderDate,
    };
  }

  /**
   * Save order details to JSON
   */
  async saveOrderDetails(filename: string = 'order-infor.json'): Promise<void> {
    const orderDetails = await this.getAllOrderDetails();

    const dirPath = path.join(process.cwd(), '.auth');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(orderDetails, null, 2));

    console.log('✅ Order details saved to:', filePath);
  }

  public async isExpectedOrderSameWithOrderInformation(expectedOrder: string): Promise<boolean> {
    await this.page.goto(`https://demowebshop.tricentis.com/orderdetails/${expectedOrder}`)
    const orderDetails = await this.getAllOrderDetails()
    const OrderID = orderDetails.orderId

    const isMatched = OrderID === expectedOrder

    if (isMatched) {
      console.log('✅ Order is matched');
    } else {
      console.log('❌ Order is not matched');
    }
    return isMatched;
  }
  public async isTotalNumberSameTotalNumberInOrderInformation(expectedTotalNumber: string): Promise<boolean> {
    const orderDetails = await this.getAllOrderDetails()
    const TotalNumber = orderDetails.orderTotal
    const isEqual = TotalNumber === expectedTotalNumber

    console.log('Total number in check out step:', expectedTotalNumber);
    console.log('Total number in Order infomation page:', TotalNumber);

    if (isEqual) {
      console.log('✅ Total number is matched');
    } else {
      console.log('❌ Total number is not matched');
    }
    return isEqual;
  }
  public async isOrderDateSameToOrderDateInOrderInformation(expectedOrderDate: string): Promise<boolean> {
    const orderDetails = await this.getAllOrderDetails()
    const orderDate = orderDetails.orderDate
    const isEqual = orderDate === expectedOrderDate

    console.log('Order date in check out step:', expectedOrderDate);
    console.log('Order date in Order infomation page:', orderDate);

    if (isEqual) {
      console.log('✅ Order date is matched');
      return true;
    }
    console.log('❌ Order date is not matched');

    return false;
  }
  public async verifyProductListMatchCheckOut(filename: string = 'order-detal.json'): Promise<boolean> {
    const filePath = path.join(process.cwd(), '.auth/order-detail.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const orderDetailCheckOut = JSON.parse(fileContent);
    const productListCheckOut = orderDetailCheckOut.products

    const orderInformation = await this.getAllOrderDetails();
    const productList = orderInformation.products

    if (productList.length !== productListCheckOut.length) {
      console.log(`❌ Product count mismatch:`);
      console.log(`   Checkout: ${productList.length} products`);
      console.log(`   Order: ${productListCheckOut.length} products`);
return false;
    }
     let allMatch = true;
    for (let i = 0; i < productList.length; i++) {
      const orderProduct = productList[i];
      const checkoutProduct = productListCheckOut[i];
      
      const nameMatch = orderProduct.name === checkoutProduct.name;
      const priceMatch = orderProduct.price === checkoutProduct.price;
      const qtyMatch = orderProduct.quantity === checkoutProduct.quantity;
  
      
      const productMatch = nameMatch && priceMatch && qtyMatch;
      
      const icon = productMatch ? '✅' : '❌';
      console.log(`${icon} Product ${i + 1}: ${orderProduct.name}`);
      
      if (!productMatch) {
        console.log(`   Name:  ${nameMatch ? '✅' : '❌'} ${orderProduct.name} vs ${checkoutProduct.name}`);
        console.log(`   Price: ${priceMatch ? '✅' : '❌'} ${orderProduct.price} vs ${checkoutProduct.price}`);
        console.log(`   Qty:   ${qtyMatch ? '✅' : '❌'} ${orderProduct.quantity} vs ${checkoutProduct.quantity}`);
        allMatch = false;
      }
    }
    
    console.log('═'.repeat(70));
    
    if (allMatch) {
      console.log('✅ All products match!');
    } else {
      console.log('❌ Products do not match!');
    }
    
    return allMatch;
    
    



  }
}
