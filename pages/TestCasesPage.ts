import { type Page, type Locator } from '@playwright/test';

export class TestCasesPage {
  readonly page: Page;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;

    // Tiêu đề trang "TEST CASES"
    this.title = page.locator('h2.title:has-text("Test Cases")').first();
  }

  /**
   * Điều hướng trực tiếp đến trang Test Cases.
   */
  async goto() {
    await this.page.goto('/test_cases', { waitUntil: 'domcontentloaded' });
    await this.title.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Xác minh trang Test Cases hiển thị thành công.
   */
  async verifyTestCasesPageVisible() {
    await this.title.waitFor({ state: 'visible', timeout: 15000 });
  }
}
