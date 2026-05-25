import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  readonly logo: Locator;
  readonly signupLoginLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly contactUsLink: Locator;
  readonly testCasesLink: Locator;

  readonly featuredItemsSection: Locator;

  // ========================================================================
  // 1. PHẦN SUBSCRIPTION (ĐĂNG KÝ NHẬN TIN TỨC) Ở FOOTER
  // ========================================================================
  readonly subscriptionTitle: Locator;
  readonly subscriptionEmailInput: Locator;
  readonly subscriptionSubmitButton: Locator;
  readonly subscriptionSuccessAlert: Locator;

  // ========================================================================
  // 2. PHẦN KIỂM THỬ SCROLL UP / SCROLL DOWN
  // ========================================================================
  readonly scrollUpArrow: Locator;
  readonly sliderHeadingText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Logo & Navbar links
    this.logo = page.locator('.logo.pull-left');
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.productsLink    = page.locator('a[href="/products"]');
    this.cartLink        = page.locator('a[href="/view_cart"]');
    this.contactUsLink   = page.locator('a[href="/contact_us"]');
    this.testCasesLink   = page.locator('a[href="/test_cases"]').first();

    // Sections
    this.featuredItemsSection = page.locator('.features_items');

    // Subscription Locators
    this.subscriptionTitle = page.locator('.single-widget h2:has-text("Subscription")');
    this.subscriptionEmailInput = page.locator('input#susbscribe_email');
    this.subscriptionSubmitButton = page.locator('button#subscribe');
    this.subscriptionSuccessAlert = page.locator('.alert-success:has-text("successfully subscribed")');

    // Scroll Elements
    this.scrollUpArrow = page.locator('a#scrollUp');
    this.sliderHeadingText = page.locator('.carousel-inner .active h2:has-text("Full-Fledged practice website")').first();
  }

  /**
   * Điều hướng trực tiếp đến Trang Chủ.
   */
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Xác minh trang chủ hiển thị thành công.
   */
  async verifyHomePageVisible() {
    await this.dismissAdIfPresent();
    // Link "Home" luôn tồn tại bất kể đã đăng nhập hay chưa
    await this.page.locator('a[href="/"]').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Đóng popup quảng cáo nếu có.
   */
  async dismissAdIfPresent() {
    try {
      const adCloseButton = this.page.locator('#dismiss-button');
      const isVisible = await adCloseButton.isVisible({ timeout: 2000 });
      if (isVisible) {
        await adCloseButton.click();
      }
    } catch {
      // Gracefully continue
    }
  }

  /**
   * Điều hướng qua navbar.
   */
  async clickSignupLogin() {
    await this.signupLoginLink.first().click();
  }

  async clickProducts() {
    await this.productsLink.first().click();
  }

  async clickCart() {
    await this.cartLink.first().click();
  }

  async clickContactUs() {
    await this.contactUsLink.first().click();
  }

  async clickTestCases() {
    await this.testCasesLink.click();
  }

  // ========================================================================
  // HÀNH ĐỘNG SUBSCRIPTION
  // ========================================================================

  /**
   * Cuộn xuống footer để điền form Subscribe.
   */
  async subscribe(email: string) {
    await this.subscriptionTitle.scrollIntoViewIfNeeded();
    await this.subscriptionEmailInput.fill(email);
    await this.subscriptionSubmitButton.click();
  }

  // ========================================================================
  // HÀNH ĐỘNG SCROLL
  // ========================================================================

  /**
   * Cuộn xuống cuối trang (Bottom).
   */
  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    // Đợi một khoảng thời gian ngắn để scroll hoàn tất
    await this.page.waitForTimeout(500);
  }

  /**
   * Cuộn lên đầu trang (Top) sử dụng nút Mũi tên góc phải.
   */
  async clickScrollUpArrow() {
    await this.scrollUpArrow.waitFor({ state: 'visible', timeout: 5000 });
    await this.scrollUpArrow.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Cuộn lên đầu trang (Top) trực tiếp bằng Javascript.
   */
  async scrollToTopDirectly() {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await this.page.waitForTimeout(500);
  }
}
