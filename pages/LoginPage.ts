/**
 * LoginPage.ts - Page Object Model cho trang Đăng Nhập (Login)
 * =============================================================
 *
 * PAGE OBJECT MODEL (POM) LÀ GÌ?
 * --------------------------------
 * POM là một Design Pattern phổ biến trong UI Automation Testing.
 * Ý tưởng cốt lõi: Mỗi trang web (page) được đại diện bởi MỘT class riêng biệt.
 * Class này chứa:
 *   1. LOCATORS: Các phần tử UI trên trang (nút, ô nhập, thông báo lỗi, ...).
 *   2. METHODS (hành động): Các thao tác người dùng có thể thực hiện trên trang.
 *
 * TẠI SAO DÙNG POM?
 * - TÁCH BIỆT (Separation of Concerns): Locators/Actions nằm ở Page class,
 *   còn Assertions nằm ở file test → dễ đọc, dễ bảo trì.
 * - TÁI SỬ DỤNG (Reusability): Nhiều test có thể dùng chung cùng một Page class.
 * - DỄ BẢO TRÌ (Maintainability): Nếu UI thay đổi (ví dụ: đổi id của nút Login),
 *   ta chỉ cần sửa ở MỘT chỗ duy nhất trong Page class, không cần sửa từng file test.
 */

import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  // ========================================================================
  // KHAI BÁO THUỘC TÍNH (PROPERTIES)
  // ========================================================================

  /**
   * 'page' là đối tượng chính của Playwright, đại diện cho một tab trình duyệt.
   * Tất cả thao tác (click, fill, goto, ...) đều thông qua đối tượng này.
   * Dùng 'readonly' vì page không nên bị gán lại sau khi khởi tạo.
   */
  readonly page: Page;

  /**
   * Khai báo các LOCATOR cho từng phần tử UI trên trang Login.
   *
   * TẠI SAO dùng Locator thay vì string selector cũ?
   * - Locator là API hiện đại của Playwright (thay thế page.$(), page.$$() đã lỗi thời).
   * - Locator có cơ chế auto-waiting: tự đợi phần tử xuất hiện trước khi tương tác.
   * - Locator tự retry nếu phần tử chưa sẵn sàng → test ổn định hơn (ít flaky).
   */
  readonly usernameInput: Locator;   // Ô nhập tên đăng nhập
  readonly passwordInput: Locator;   // Ô nhập mật khẩu
  readonly loginButton: Locator;     // Nút "Login"
  readonly errorMessage: Locator;    // Thông báo lỗi (hiện khi đăng nhập sai)
  readonly loginLogo: Locator;       // Logo "Swag Labs" trên trang login

  // ========================================================================
  // CONSTRUCTOR (HÀM KHỞI TẠO)
  // ========================================================================

  /**
   * Constructor nhận vào đối tượng 'page' từ Playwright.
   * Tại đây, ta khởi tạo tất cả locator MỘT LẦN DUY NHẤT.
   *
   * TẠI SAO khởi tạo locator trong constructor?
   * - Đảm bảo tính nhất quán: mọi method trong class đều dùng chung locator.
   * - Nếu UI thay đổi selector, ta chỉ sửa ở đây → nguyên tắc DRY (Don't Repeat Yourself).
   */
  constructor(page: Page) {
    this.page = page;

    // data-test là thuộc tính (attribute) tùy chỉnh mà SauceDemo đặt sẵn cho testing.
    // Dùng data-test thay vì id/class vì nó KHÔNG bị ảnh hưởng bởi CSS hay refactor giao diện.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // Logo dùng class selector vì không có data-test attribute.
    this.loginLogo = page.locator('.login_logo');
  }

  // ========================================================================
  // METHODS (CÁC PHƯƠNG THỨC HÀNH ĐỘNG)
  // ========================================================================
  // Các method này đại diện cho HÀNH ĐỘNG của người dùng trên trang.
  // Chúng KHÔNG chứa assertion (expect) → tách biệt Action và Verification.

  /**
   * Điều hướng (navigate) đến trang Login.
   *
   * TẠI SAO dùng '/' thay vì URL đầy đủ?
   * - Vì ta đã cấu hình baseURL trong playwright.config.ts.
   * - page.goto('/') sẽ tự động ghép thành 'https://www.saucedemo.com/'.
   * - Giúp dễ dàng đổi môi trường (dev, staging, production) mà không sửa code test.
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Thực hiện hành động đăng nhập với username và password được truyền vào.
   *
   * TẠI SAO tách riêng thành một method?
   * - Hành động "đăng nhập" được dùng lại ở NHIỀU test case khác nhau
   *   (test đăng nhập thành công, thất bại, tài khoản bị khóa, ...).
   * - Nếu quy trình đăng nhập thay đổi (ví dụ: thêm CAPTCHA), ta chỉ sửa ở đây.
   *
   * @param username - Tên đăng nhập
   * @param password - Mật khẩu
   */
  async login(username: string, password: string) {
    // fill() sẽ xóa nội dung cũ rồi nhập nội dung mới → an toàn hơn type().
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    // click() tự đợi nút có thể click được (visible, enabled) rồi mới click.
    await this.loginButton.click();
  }

  /**
   * Lấy nội dung text của thông báo lỗi.
   *
   * TẠI SAO trả về Promise<string>?
   * - textContent() là hàm bất đồng bộ (async), trả về nội dung text của phần tử.
   * - Dùng '?? ""' (nullish coalescing) để trả về chuỗi rỗng nếu phần tử không tồn tại,
   *   tránh lỗi null/undefined gây crash test.
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
