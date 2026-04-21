/**
 * playwright.config.ts
 * =====================
 * File cấu hình trung tâm của Playwright Test Runner.
 *
 * TẠI SAO cần file này?
 * - Playwright đọc file này để biết: chạy test ở thư mục nào, dùng trình duyệt gì,
 *   URL gốc là gì, và xuất báo cáo (report) theo định dạng nào.
 * - Tách cấu hình ra file riêng giúp dễ bảo trì và thay đổi mà KHÔNG cần sửa code test.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  /* --- THƯ MỤC CHỨA CÁC FILE TEST --- */
  // Playwright sẽ quét tất cả file *.spec.ts trong thư mục này để chạy.
  testDir: './tests',

  /* --- CHẠY SONG SONG (PARALLEL) --- */
  // Cho phép chạy đồng thời nhiều test để tiết kiệm thời gian.
  // Trong môi trường CI, ta giới hạn lại để tránh xung đột tài nguyên.
  fullyParallel: true,

  /* --- CẤM test.only TRÊN CI --- */
  // Nếu vô tình để lại test.only, build trên CI sẽ thất bại ngay → tránh bỏ sót test.
  forbidOnly: !!process.env.CI,

  /* --- SỐ LẦN THỬ LẠI (RETRY) --- */
  // Trên CI: retry 2 lần nếu test thất bại (giảm flaky test).
  // Trên local: không retry để phát hiện lỗi nhanh hơn.
  retries: process.env.CI ? 2 : 0,

  /* --- SỐ WORKER (TIẾN TRÌNH) --- */
  // Trên CI: chỉ dùng 1 worker để ổn định.
  // Trên local: Playwright tự quyết định dựa trên CPU.
  workers: process.env.CI ? 1 : undefined,

  /* --- BÁO CÁO KẾT QUẢ TEST (REPORTER) --- */
  // 'html' tạo báo cáo trực quan dưới dạng trang web, dễ xem pass/fail.
  // Có thể mở bằng lệnh: npx playwright show-report
  reporter: 'html',

  /* --- CÀI ĐẶT CHUNG CHO MỌI PROJECT (TRÌNH DUYỆT) --- */
  use: {
    /**
     * BASE URL: URL gốc của trang web cần test.
     * TẠI SAO? Thay vì viết đầy đủ 'https://www.saucedemo.com/' trong mỗi test,
     * ta chỉ cần gọi page.goto('/') → code ngắn gọn, dễ thay đổi khi đổi môi trường.
     */
    baseURL: 'https://www.saucedemo.com',

    /**
     * CHỤP ẢNH MÀN HÌNH KHI TEST THẤT BẠI.
     * TẠI SAO? Giúp debug nhanh bằng cách xem trạng thái UI tại thời điểm lỗi.
     */
    screenshot: 'only-on-failure',

    /**
     * GHI LẠI TRACE (DẤU VẾT) KHI RETRY.
     * TẠI SAO? Trace chứa ảnh chụp, network request, DOM snapshot → rất hữu ích
     * để tái hiện lỗi mà không cần chạy lại test thủ công.
     */
    trace: 'on-first-retry',
  },

  /* --- CẤU HÌNH CÁC TRÌNH DUYỆT ĐỂ TEST --- */
  // Mỗi "project" là một trình duyệt riêng biệt.
  // Playwright sẽ chạy TẤT CẢ test trên từng trình duyệt được liệt kê ở đây.
  projects: [
    {
      name: 'chromium',
      // devices['Desktop Chrome'] chứa các cài đặt viewport, user-agent
      // phù hợp với trình duyệt Chrome trên máy tính.
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      // Tương tự, mô phỏng Firefox trên desktop.
      use: { ...devices['Desktop Firefox'] },
    },

    // GHI CHÚ: Có thể bật thêm WebKit (Safari) nếu cần test đa nền tảng:
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
