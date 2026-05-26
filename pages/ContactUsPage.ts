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
  submittedSuccessfully: boolean = false; // Cờ kiểm tra kết quả submit

  constructor(page: Page) {
    this.page = page;

    // "GET IN TOUCH" heading
    this.title = page.locator('h2.title:has-text("Get In Touch")');

    // Form inputs
    this.nameInput = page.locator('input[data-qa="name"]');
    this.emailInput = page.locator('input[data-qa="email"]');
    this.subjectInput = page.locator('input[data-qa="subject"]');
    this.messageInput = page.locator('textarea[data-qa="message"]');
    this.fileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('input[data-qa="submit-button"]');

    // Success response div — jQuery sẽ show element này sau khi dialog được accept
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
   * Click nút gửi form, chờ dialog xuất hiện, accept, rồi chờ DOM cập nhật.
   * Dùng force:true để bypass mọi ad overlay có thể che khuất nút Submit.
   */
  async submit() {
    // Cuộn nút Submit vào vùng nhìn thấy, tránh bị che khuất bởi ads
    await this.submitButton.scrollIntoViewIfNeeded();

    // Đăng ký one-time dialog handler TRƯỚC khi click
    const dialogHandled = new Promise<void>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        console.log(`[Dialog] Tự động chấp nhận hộp thoại: ${dialog.message()}`);
        await dialog.accept();
        resolve();
      });
    });

    // Click submit với force:true để vượt qua mọi overlay che khuất
    await this.submitButton.click({ force: true });

    // Chờ dialog được accept, timeout 15s để tránh deadlock nếu dialog không xuất hiện
    await Promise.race([
      dialogHandled,
      this.page.waitForTimeout(15000), // fallback: tiếp tục sau 15s nếu dialog không đến
    ]);

    // Chờ thêm 1.5s để jQuery show() successMessage hoàn tất trước khi assertion
    await this.page.waitForTimeout(1500);
  }

  /**
   * Click nút quay về trang chủ sau khi gửi thành công.
   */
  async clickHome() {
    await this.homeButton.click();
  }
}
