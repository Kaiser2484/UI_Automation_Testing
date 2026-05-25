import { type Page, type Locator, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class PaymentPage {
  readonly page: Page;

  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payButton: Locator;

  readonly successMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Credit card forms
    this.nameOnCardInput = page.locator('input[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('input[data-qa="card-number"]');
    this.cvcInput = page.locator('input[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('input[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('input[data-qa="expiry-year"]');
    this.payButton = page.locator('button[data-qa="pay-button"]');

    // Success response elements
    this.successMessage = page.locator('h2[data-qa="order-placed"] b, p:has-text("Congratulations! Your order has been confirmed!")');
    this.downloadInvoiceButton = page.locator('a.btn:has-text("Download Invoice")');
    this.continueButton = page.locator('a[data-qa="continue-button"]');
  }

  /**
   * Điền thông tin thẻ thanh toán và xác nhận đặt hàng.
   */
  async payAndConfirm(name: string, cardNumber: string, cvc: string, month: string, year: string) {
    await this.nameOnCardInput.fill(name);
    await this.cardNumberInput.fill(cardNumber);
    await this.cvcInput.fill(cvc);
    await this.expiryMonthInput.fill(month);
    await this.expiryYearInput.fill(year);
    await this.payButton.click();
  }

  /**
   * Xác minh đơn hàng đã đặt thành công.
   */
  async verifyOrderPlaced() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Tải xuống hóa đơn đơn hàng (Invoice PDF) và lưu trữ.
   *
   * HƯỚNG DẪN PLAYWRIGHT DOWNLOAD:
   * 1. Lắng nghe sự kiện page.waitForEvent('download')
   * 2. Click nút tải xuống hóa đơn.
   * 3. Chờ download hoàn thành.
   * 4. Lưu file tải về vào thư mục mong muốn.
   */
  async downloadInvoice(targetDirectory: string): Promise<string> {
    // Bước 1: Khởi động trình lắng nghe tải file
    const downloadPromise = this.page.waitForEvent('download');

    // Bước 2: Click nút tải xuống
    await this.downloadInvoiceButton.click();

    // Bước 3: Chờ quá trình tải hoàn thành
    const download = await downloadPromise;

    // Bước 4: Lưu file tải về
    const suggestedFileName = download.suggestedFilename();
    const filePath = path.join(targetDirectory, suggestedFileName);
    await download.saveAs(filePath);

    console.log(`✓ Đã tải hóa đơn thành công tại: ${filePath}`);
    return filePath;
  }

  /**
   * Click nút Continue để kết thúc luồng mua hàng.
   */
  async clickContinue() {
    await this.continueButton.click();
  }
}
