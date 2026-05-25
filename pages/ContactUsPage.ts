import { type Page, type Locator } from '@playwright/test';

export class ContactUsPage {
  readonly page: Page;

  readonly title: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Lắng nghe hộp thoại và tự động bấm OK (accept) cho mọi xác nhận trên trang này
    this.page.on('dialog', async (dialog) => {
      console.log(`[Dialog] Tự động chấp nhận hộp thoại: ${dialog.message()}`);
      await dialog.accept();
    });

    // "GET IN TOUCH" heading
    this.title = page.locator('h2.title:has-text("Get In Touch")');

    // Form inputs
    this.nameInput = page.locator('input[data-qa="name"]');
    this.emailInput = page.locator('input[data-qa="email"]');
    this.subjectInput = page.locator('input[data-qa="subject"]');
    this.messageInput = page.locator('textarea[data-qa="message"]');
    this.fileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('input[data-qa="submit-button"]');

    // Success response elements
    this.successMessage = page.locator('.status.alert-success');
    this.homeButton = page.locator('a.btn.btn-success');
  }

  /**
   * Điều hướng trực tiếp đến trang Contact Us.
   */
  async goto() {
    await this.page.goto('/contact_us', { waitUntil: 'domcontentloaded' });
    await this.title.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Điền form liên hệ.
   */
  async fillForm(name: string, email: string, subject: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.subjectInput.fill(subject);
    await this.messageInput.fill(message);
  }

  /**
   * Upload file đính kèm.
   *
   * @param filePath - Đường dẫn tuyệt đối đến file cần upload.
   */
  async uploadAttachment(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * Click nút gửi form.
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Click nút quay về trang chủ sau khi gửi thành công.
   */
  async clickHome() {
    await this.homeButton.click();
  }
}
