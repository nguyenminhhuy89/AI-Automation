import { expect, Locator } from "playwright/test";
import { commonLocators } from "./Page/elements.page";
import { UserFactory } from "../datatest/user_management";
import { AddressData } from "../datatest/address_data";
import { test } from "../fixtures/myfixture";
import * as testdata from '../.auth/user01.json'

test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://demowebshop.tricentis.com/register', { waitUntil: "networkidle" })
    })
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('Navigated to Register-Page', async ({ page }) => {
        // await page.goto('/register',{ waitUntil: "networkidle" })
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveTitle('Demo Web Shop. Register');
    });

    test('Verify elemtents in RegisterPage', async ({ page }) => {
        await expect(page.getByText('Gender:')).toBeVisible();
        await expect(page.getByLabel('First name:')).toBeVisible();
        await expect(page.getByLabel('Last name:')).toBeVisible();
        await expect(page.getByLabel('Email:')).toBeVisible();
        await expect(page.locator('#Password')).toBeVisible();
        await expect(page.locator('#ConfirmPassword')).toBeVisible();
        await expect(page.locator('#register-button')).toBeVisible();
    })
    test('Register - missing password', async ({ page, register }) => {
        const missingPassword = UserFactory.createInValidUser01();
        const PasswordError = page.locator('//span[@for="Password"]');
        const ConfirmPasswordErro = page.locator('//span[@for="ConfirmPassword"]');
        await register.registerAccount(missingPassword);
        await expect(PasswordError).toHaveText('Password is required.');
        await expect(ConfirmPasswordErro).toHaveText('Password is required.');
    })
    test('Register - missing email', async ({ page, register }) => {
        const missingEmail = UserFactory.createInValidUser02();
        const emaillError = page.locator('//span[@for="Email"]')
        await register.registerAccount(missingEmail);
        await expect(emaillError).toHaveText('Email is required.')
    });
    test('register missing firstname', async ({ page, register }) => {
        const missingFirstname = UserFactory.createInValidUser03();
        const firstNameError = page.locator('//span[@for="FirstName"]');
        await register.registerAccount(missingFirstname);
        await expect(firstNameError).toHaveText('First name is required.');
    });
    test('register missing lastname', async ({ page, register }) => {
        const missingLastname = UserFactory.createInValidUser04();
        const lastNameError = page.locator('//span[@for="LastName"]');
        await register.registerAccount(missingLastname);
        await expect(lastNameError).toHaveText('Last name is required.');
    });

    test('Register with valid account', async ({ page, register }) => {
        const validUser = UserFactory.createValidUser();
        await register.registerAccount(validUser);
        await expect(page.getByRole('link', { name: validUser.email })).toBeVisible();
    });
});

test.describe('Account page with create a new address', () => {
    test.beforeEach(async ({ page, loginpage }) => {
        await loginpage.loginAccount(testdata.email, testdata.password)
        await page.waitForLoadState('networkidle')
    })
    test('Navigate to ‘My Account’ by click on header', async ({ page }) => {
        await page.locator(commonLocators.FOOTER_LINK('My account')).click();
        await expect(page.locator(commonLocators.TITLE)).toHaveText('My account - Customer info');
    });
    test('Create new address for account', async ({ page, accountpage }) => {
        await page.locator(commonLocators.MY_ACCOUNT('Addresses')).click();
        await expect(page.locator(commonLocators.TITLE)).toHaveText('My account - Addresses');
    });
    test('Filling address successful', async ({ page, accountpage }) => {
        const newAddress = AddressData.getMyAddress();
        await page.locator(commonLocators.MY_ACCOUNT('Addresses')).click();
        const beforeFillingAddressReocord = await accountpage.countAddress();
        await page.getByRole('button', { name: 'Add new' }).click();
        await accountpage.fillingAddress(newAddress);
        const afterFillingAddressReocord = await accountpage.countAddress();
        expect(afterFillingAddressReocord).toBe(beforeFillingAddressReocord + 1);
    });
    test('verify Address Card Content', async ({ page }) => {
        await page.goto('https://demowebshop.tricentis.com/customer/addresses')
        const newAddress = AddressData.getMyAddress();
        await expect(page.locator('//ul[@class="info"]//li[@class="name"]')).toContainText(newAddress.firstname);
        await expect(page.locator('//ul[@class="info"]//li[@class="email"]')).toContainText(newAddress.email);
        await expect(page.locator('//ul[@class="info"]//li[@class="phone"]')).toContainText(newAddress.phonenumber);
        await expect(page.locator('//ul[@class="info"]//li[@class="company"]')).toContainText(newAddress.company);
        await expect(page.locator('//ul[@class="info"]//li[@class="address1"]')).toContainText(newAddress.address1);
        await expect(page.locator('//ul[@class="info"]//li[@class="city-state-zip"]')).toContainText(newAddress.city);
        await expect(page.locator('//ul[@class="info"]//li[@class="country"]')).toContainText(newAddress.country);
        await expect(page.getByRole('button', {name: 'Edit'})).toBeVisible();
        await expect(page.getByRole('button', {name: 'Delete'})).toBeVisible();
    })

});
test.describe('Change password with new password', () => {
    test.beforeEach(async ({ page, loginpage }) => {
        await loginpage.loginAccount(testdata.email, testdata.password)
        await page.goto('/customer/info')
        await page.waitForLoadState('networkidle')
    })
    test('Navigate to Change Password ', async ({ page }) => {
        await page.locator(commonLocators.MY_ACCOUNT('Change password')).click();
        await expect(page.locator(commonLocators.TITLE)).toHaveText('My account - Change password');
        await expect(page.getByLabel('Old password:')).toBeVisible();
        await expect(page.getByLabel('New password:')).toBeVisible();
        await expect(page.getByLabel('Confirm password:')).toBeVisible();
        expect(page.getByRole('button', { name: 'Change password' })).toBeVisible;
    });
    test('change pass in case user input old password invalid', async ({ page, accountpage }) => {
        const errorMsg = page.locator('//div[@class="validation-summary-errors"]');
        await page.locator(commonLocators.MY_ACCOUNT('Change password')).click();
        await accountpage.changeNewPassword('Abcd12','Abcd@123456','Abcd@123456');
        expect(errorMsg).toContainText("Old password doesn't match")
    });
    test('change pass in case user newpassword and confirm new pass do not match', async ({ page, accountpage }) => {
        const errorMsg = page.locator('//span[@class="field-validation-error"]');
        await page.locator(commonLocators.MY_ACCOUNT('Change password')).click();
        await accountpage.changeNewPassword(testdata.password,'Abcd@123456','Abcd@1234567');
        expect(errorMsg).toContainText('The new password and confirmation password do not match.')
    });
    test('change pass when user input short password', async ({ page, accountpage }) => {
        const errorMsg = page.locator('//span[@class="field-validation-error"]');
        await page.locator(commonLocators.MY_ACCOUNT('Change password')).click();
        await accountpage.changeNewPassword(testdata.password,'Abc','Abc');
        expect(errorMsg).toContainText('The password should have at least 6 characters.')
    });
    test('Change password succesfully and then logout current account', async ({ page, accountpage }) => {
        const messageResult = page.locator('//div[@class="result"]')
        const emailUser = testdata.email
        await page.locator(commonLocators.MY_ACCOUNT('Change password')).click();
        await accountpage.changeNewPassword(testdata.password,'Abcd@123456','Abcd@123456');
        await expect(messageResult).toContainText('Password was changed')
        await page.locator(commonLocators.TOPMENU_LOGOUT).click();
        expect(page.getByRole('link', { name: emailUser })).toBeHidden;
    });
});
test.describe('Re-login with new password', { tag: '@login' }, () => {
    let errorMsg: Locator
    let errorDetailMsg: Locator

    test.beforeEach(async ({page}) => {
        errorMsg = page.locator('//div[@class="validation-summary-errors"]//span');
        errorDetailMsg = page.locator('//div[@class="validation-summary-errors"]//ul');
    });
    test('verify login page', async ({ page }) => {
        await page.goto('https://demowebshop.tricentis.com/login');
        await expect(page.locator('.email')).toBeVisible();
        await expect(page.locator('.password')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
    })
    test('Login without email input', async ({ page, loginpage }) => {    
        await loginpage.loginAccount("", testdata.password);
        await expect(errorMsg).toBeVisible()
        await expect(errorMsg).toContainText('Login was unsuccessful. Please correct the errors');
        await expect(errorDetailMsg).toHaveText('No customer account found')
    });
    test('Login without password input', async ({ loginpage }) => {
        await loginpage.loginAccount(testdata.email, "");
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Login was unsuccessful. Please correct the errors');
        await expect(errorDetailMsg).toHaveText('The credentials provided are incorrect');
    });
    test('login without username & password', async ({ loginpage }) => {
        await loginpage.loginAccount("","");
        await expect(errorMsg).toBeVisible()
        await expect(errorMsg).toContainText('Login was unsuccessful. Please correct the errors and try again.')
        await expect(errorDetailMsg).toHaveText('No customer account found')       
    })
    test('Login with valid username & newpassword', async ({ page,loginpage }) => {       
        await loginpage.loginAccount(testdata.email, testdata.password);
        await expect(page.getByRole('link' , { name: 'Log out'})).toBeVisible();
        await expect(page.getByRole('link', { name: testdata.email })).toBeVisible();
    });
})
