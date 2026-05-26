/**
 * fixtures/pom-fixture.ts
 * =======================
 * Custom Fixtures cho Page Object Model (B1 - POM Nâng Cao)
 *
 * MỤC TIÊU:
 * 1. Tự động hóa việc khởi tạo (instantiation) tất cả các Page Object classes.
 * 2. Loại bỏ hoàn toàn khối `beforeEach` lặp đi lặp lại ở tất cả các file spec.
 * 3. Cho phép destruct trực tiếp các trang cần dùng làm tham số của test case.
 *    Ví dụ: test('Luồng mua hàng', async ({ homePage, productsPage, cartPage }) => { ... });
 */

import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { TestCasesPage } from '../pages/TestCasesPage';
import { PaymentPage } from '../pages/PaymentPage';

// Định nghĩa kiểu dữ liệu cho các custom fixtures
type POMFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  contactUsPage: ContactUsPage;
  testCasesPage: TestCasesPage;
  paymentPage: PaymentPage;
};

// Kéo rộng đối tượng `test` cơ bản của Playwright với các custom fixtures
export const test = base.extend<POMFixtures>({
  page: async ({ page }, use) => {
    // Chặn tất cả các yêu cầu quảng cáo và phân tích để tăng tốc và tránh flaky test do quảng cáo
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('googleads') ||
        url.includes('doubleclick') ||
        url.includes('adservice') ||
        url.includes('googlesyndication') ||
        url.includes('analytics') ||
        url.includes('pagead') ||
        url.includes('adsbygoogle')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });
    await use(page);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  contactUsPage: async ({ page }, use) => {
    const contactUsPage = new ContactUsPage(page);
    await use(contactUsPage);
  },

  testCasesPage: async ({ page }, use) => {
    const testCasesPage = new TestCasesPage(page);
    await use(testCasesPage);
  },

  paymentPage: async ({ page }, use) => {
    const paymentPage = new PaymentPage(page);
    await use(paymentPage);
  },
});

export { expect } from '@playwright/test';
