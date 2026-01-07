import { type Page } from "playwright";
import { AddressUser } from "../../datatest/address_data";
import * as fs from 'fs';
import * as path from 'path';

export class AccountPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page

    }
    public async click_addNewAdress() {
        await this.page.locator('.add-button').click();
        await this.page.waitForLoadState('networkidle');
    }
    public async fillingAddress(address_detail: AddressUser) {
        await this.page.getByLabel('First name:').fill(address_detail.firstname);
        await this.page.getByLabel('Last name:').fill(address_detail.lastname);
        await this.page.getByLabel('Email:').fill(address_detail.email);
        await this.page.getByLabel('Company').fill(address_detail.company);
        await this.page.getByLabel('Country:').selectOption(address_detail.country);
        await this.page.locator('//input[@class="text-box single-line" and @id="Address_City"]').fill(address_detail.city);
        await this.page.locator('//input[@class="text-box single-line" and @id="Address_Address1"]').fill(address_detail.address1);
        await this.page.locator('//input[@class="text-box single-line" and @id="Address_ZipPostalCode"]').fill(address_detail.zipcode);
        await this.page.locator('//input[@class="text-box single-line" and @id="Address_PhoneNumber"]').fill(address_detail.phonenumber);
        await this.page.locator('//input[@class="button-1 save-address-button"]').click();
    }
    public async countAddress(): Promise<number> {
        const addressRecord = this.page.locator('//div[@class="section address-item"]');
        return await addressRecord.count();
    };
//     public async changeNewPassword(oldPass: string, newPass: string, confirmNewPass: string) {
//     const dirPath = path.join(process.cwd(), '.auth');
//     const filePath = path.join(dirPath, 'user01.json');

//     // Đọc file JSON hiện tại
//     const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

//     // Nhập dữ liệu vào form
//     await this.page.getByText('Old password:').fill(oldPass);
//     await this.page.getByText('New password:').fill(newPass);
//     await this.page.getByText('Confirm password:').fill(confirmNewPass);
//     await this.page.locator('input.change-password-button').click();

//     // Kiểm tra xem đổi mật khẩu có thành công không
//     const successMsg = this.page.locator('//div[@class="result"]');

//     try {
//         // Chờ message success hiển thị trong vòng 3 giây
//         await expect(successMsg).toBeVisible({ timeout: 3000 });

//         // Thành công → ghi lại file JSON
//         const userJSONtoSave = {
//             email: userData.email,
//             password: confirmNewPass
//         };

//         fs.writeFileSync(filePath, JSON.stringify(userJSONtoSave, null, 2));

//         console.log('Đổi mật khẩu thành công. Đã cập nhật file user01.json.');
//         return {success: true}
//     } catch (err) {
//         // Không tìm thấy success message → coi như thất bại
//         const errorMsg = await this.page.locator('//span[@class="field-validation-error"]').innerText().catch(() => 'Không xác định');
//         return {success: false, error: errorMsg}
//     };
// }}

public async changeNewPassword(oldPass: string, newPass: string, confirmNewPass: string) {
    const dirPath = path.join(process.cwd(), '.auth');
    const filePath = path.join(dirPath, 'user01.json');
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Điền form đổi mật khẩu
    await this.page.getByText('Old password:').fill(oldPass);
    await this.page.getByText('New password:').fill(newPass);
    await this.page.getByText('Confirm password:').fill(confirmNewPass);
    await this.page.locator('input.change-password-button').click();

    // Định nghĩa các locator
    const successMsg = this.page.locator('//div[@class="result"]');
    const confirmError = this.page.locator('//span[@class="field-validation-error"]');
    const oldPasswordError = this.page.locator('//div[@class="validation-summary-errors"]');

    // Chờ UI cập nhật
    await this.page.waitForTimeout(300);

    // 1) Trường hợp đổi mật khẩu thành công
    if (await successMsg.isVisible()) {
        fs.writeFileSync(
            filePath,
            JSON.stringify(
                { email: userData.email, password: confirmNewPass },
                null,
                2
            )
        );

        console.log("Đổi mật khẩu thành công");
        return {
            success: true,
            message: "Password changed successfully"
        };
    }

    // 2) Lỗi do New password và Confirm password không khớp
    else if (await confirmError.isVisible()) {
        const msg = await confirmError.innerText();
        console.log("Đổi mật khẩu thất bại:", msg);

        return {
            success: false,
            message: msg
        };
    }

    // 3) Lỗi do nhập sai mật khẩu cũ
    else if (await oldPasswordError.isVisible()) {
        const msg = await oldPasswordError.innerText();
        console.log("Sai mật khẩu cũ:", msg);

        return {
            success: false,
            message: msg
        };
    }

    // 4) Lỗi không xác định (fallback)
    else {
        console.log("Đổi mật khẩu thất bại: Không xác định");
        return {
            success: false,
            message: "Không xác định"
        };
    }
}}
