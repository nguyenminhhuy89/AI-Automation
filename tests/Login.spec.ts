import { test, expect } from "@playwright/test";
import { LoginPage } from "./Page/Login.page";
import * as testdata from '../.auth/user01.json';
import { chromium } from 'playwright';

// Quyen da o day

test('Test login authen file', async ({ context }) => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage()
  const login = new LoginPage(page, context);
  // const customer01AuthenFile = ".auth/customer01.json"
  await login.loginAccount(testdata.email, testdata.password);
  // await context.storageState ({path: customer01AuthenFile});
})
test.only('Login', async ({ page }) => {
  await page.goto('/login');
  console.log(">>>[Test Login]: Chuẩn bị điền thông tin đăng nhập...")
  await page.getByLabel('Email:').fill(testdata.email);
  await page.getByLabel('Password:').fill(testdata.password);
  console.log(">>>[Test Login]: Điền thông tin đăng nhập thành công")
  await page.pause();
  await page.locator('//input[@class="button-1 login-button"]').click();
  
  await page.waitForLoadState('networkidle')
  console.log(">>>[Test Login]: Đăng nhập thành công")
  
  await expect(page.getByRole('link', {name: 'Log out'})).toBeVisible()
  console.log(">>>[Test Login]: Chuyển đến Homepage >> Link login invisible")
})