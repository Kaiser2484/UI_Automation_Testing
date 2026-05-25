/**
 * playwright.config.ts
 * =====================
 * Cấu hình Playwright cho AutomationExercise.com
 *
 * LƯU Ý ĐẶC BIỆT — CLOUDFLARE BOT PROTECTION:
 * ─────────────────────────────────────────────
 * automationexercise.com dùng Cloudflare để chặn bot/automation tool.
 * Firefox bị phát hiện và nhận trang "Please wait while your request is being verified..."
 *
 * GIẢI PHÁP:
 * 1. Chỉ dùng Chromium (Chrome/Edge) vì Playwright Chromium ít bị phát hiện hơn.
 * 2. Đặt userAgent là Chrome thực để vượt qua Cloudflare fingerprinting.
 * 3. Tắt Playwright's automation flags bằng channel: 'chrome' (nếu có Chrome cài sẵn).
 * 4. Thêm launchOptions để tránh bị phát hiện là headless automation.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,   // Chạy tuần tự để tránh rate limiting
  forbidOnly: !!process.env.CI,
  retries: 1,             // Retry 1 lần vì Cloudflare có thể gây flaky test
  workers: 1,             // 1 worker để tránh bị Cloudflare rate limit
  reporter: [['list'], ['html']],

  use: {
    baseURL: 'https://automationexercise.com',

    /**
     * USER AGENT THỰC:
     * Playwright mặc định set user-agent chứa "HeadlessChrome" → Cloudflare phát hiện.
     * Đặt user-agent của Chrome thực để bypass Cloudflare.
     */
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',

    /**
     * VIEWPORT: kích thước màn hình desktop tiêu chuẩn
     */
    viewport: { width: 1280, height: 720 },

    /** Chụp ảnh khi test thất bại */
    screenshot: 'only-on-failure',

    /** Ghi video khi test thất bại */
    video: 'retain-on-failure',

    /** Ghi trace khi retry */
    trace: 'on-first-retry',

    /**
     * TIMEOUTS — tăng cao vì:
     * 1. Trang web thực trên internet (phụ thuộc network).
     * 2. Cloudflare challenge có thể mất vài giây.
     * 3. Ads load làm chậm trang.
     */
    actionTimeout: 20000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
      },
    },
  ],

  expect: {
    /**
     * Assertion timeout: 15 giây
     * Phù hợp với trang web thực có dynamic content và Cloudflare delays.
     */
    timeout: 15000,
  },
});
