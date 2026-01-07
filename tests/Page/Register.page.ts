import { type Page } from "playwright";
import * as fs from 'fs';
import * as path from 'path';
import { Context } from "vm";

export class RegisterPage {
    readonly page: Page;
    readonly context: Context

    constructor(page: Page, context: Context) {
        this.page = page;
        this.context = context;
    }
    async registerAccount(userData: {
        gender: 'male' | 'female';
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) {
        if (userData.gender === 'male') {
            await this.page.locator('#gender-male').check();
        } else {
            await this.page.locator('#gender-female').check();
        }
        const userJSONtoSave = {
            email: userData.email,
            password: userData.password
        }
        const dirPath = path.join(process.cwd(), '.auth'); // thư mục .auth ở root project
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true }); // tạo folder nếu chưa tồn tại
        }
        const filePath = path.join(dirPath, 'user01.json');
        const customer01AuthenFile = ".auth/customer01.json";
        const success_messagae = this.page.locator('//div[@class="result"]');

        await this.page.getByLabel('First name:').fill(userData.firstName)
        await this.page.getByLabel('Last name:').fill(userData.lastName)
        await this.page.getByLabel('Email:').fill(userData.email)
        await this.page.locator('//input[@class="text-box single-line password" and @id="Password"]').fill(userData.password)
        await this.page.locator('//input[@class="text-box single-line password" and @id="ConfirmPassword"]').fill(userData.password)
        await this.page.locator('#register-button').click();
        await this.page.waitForLoadState('networkidle');

        // Đăng ký thành công account thì lưu thông tin user/pass vào file JSON đồng thời tạo file JSON chưa cookie 
        if (await success_messagae.isVisible()) {
            fs.writeFileSync(filePath, JSON.stringify(userJSONtoSave, null, 2))
            await this.context.storageState({ path: customer01AuthenFile });
        }
        else
            console.log("Regiter account failed")
    }
}