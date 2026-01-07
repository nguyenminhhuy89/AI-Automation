import { type Page, BrowserContext, Locator } from "playwright";
import { expect } from "playwright/test";


export class LoginPage {
    readonly page: Page;
    readonly context: BrowserContext
    readonly accountLink: Locator

    constructor(page: Page, context: BrowserContext) {
        this.page = page
        this.context = context
        this.accountLink = page.locator('//div[@class="header-links"]//a[@href="/customer/info"]');
    }
    private async createAuthenFile() {
        const customer01AuthenFile = ".auth/customer01.json"
        await this.context.storageState({ path: customer01AuthenFile });

    }
    async isLoginSuccess(): Promise<boolean> {
        return await this.accountLink.isVisible();
    }
    // async loginAccount(email: string, password: string): Promise<boolean> {
    //     try {
    //         await this.page.goto('/login');
    //         await this.page.getByLabel('Email:').fill(email);
    //         await this.page.getByLabel('Password:').fill(password);
    //         await this.page.locator('//input[@class="button-1 login-button"]').click();
    //         await this.page.waitForLoadState('networkidle')
    //         const isSuccessfull = await this.isLoginSuccess();
    //         if (isSuccessfull) {
    //             await this.createAuthenFile();
    //             console.log('Login successfully and authen file has been created')
    //             return true
    //         } else {
    //             console.error('Login failed');
    //             return false
    //         }
    //     } catch (error) {
    //         console.error('Login failed')
    //         throw error
    //     }
    // }
    async loginAccount(email: string, password: string) {
        
            await this.page.goto('/login');
            await this.page.getByLabel('Email:').fill(email);
            await this.page.getByLabel('Password:').fill(password);
            await this.page.locator('//input[@class="button-1 login-button"]').click();
            await this.page.waitForLoadState('networkidle')
    }

    async emaillAccountisAvailable(email: string) {
        await expect(this.accountLink).toBeVisible({ timeout: 5000 });
        await expect(this.accountLink).toHaveText(email)
    }

}