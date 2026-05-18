/**
 * playwright.config.ts
 * =====================
 * File cấu hình trung tâm của Playwright Test Runner.
 *
 * TẠI SAO cần file này?
 * - Playwright đọc file này để biết: chạy test ở thư mục nào, dùng trình duyệt gì,
 *   URL gốc là gì, và xuất báo cáo (report) theo định dạng nào.
 * - Tách cấu hình ra file riêng giúp dễ bảo trì và thay đổi mà KHÔNG cần sửa code test.
 *
 * CẬP NHẬT MỚI: Thêm cấu hình cho Visual Regression Testing (VRT)
 * - snapshotPathTemplate : Quy định vị trí lưu file ảnh baseline, tập trung
 *                          vào thư mục __screenshots__ để dễ quản lý version control.
 * - expect.toHaveScreenshot: Cấu hình ngưỡng so sánh pixel mặc định toàn cục.
 * - reporter             : Kết hợp 'list' + 'html' để xem kết quả cả trong
 *                          terminal lẫn báo cáo web (có ảnh diff khi VRT fail).
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
  /**
   * Dùng MẢNG reporter để kết hợp nhiều định dạng báo cáo cùng lúc:
   * - 'list' : In kết quả từng test ra terminal ngay khi chạy (tiện cho debug).
   * - 'html' : Tạo báo cáo trang web đẹp, CÓ ẢNH DIFF khi VRT fail.
   *            Mở bằng lệnh: npx playwright show-report
   *
   * VỚI VISUAL REGRESSION TESTING, báo cáo HTML ĐẶC BIỆT HỮU ÍCH vì nó
   * hiển thị ảnh EXPECTED vs ACTUAL vs DIFF side-by-side khi test fail →
   * giúp developer thấy NGAY vùng nào trên UI bị thay đổi.
   */
  reporter: [['list'], ['html']],

  /**
   * snapshotPathTemplate: Quy định TÊN VÀ VỊ TRÍ file ảnh baseline.
   *
   * Với Playwright phiên bản hiện tại, Playwright tự động lưu ảnh baseline tại:
   *   tests/<tên-file-spec>-snapshots/<browser>/<tên-ảnh>
   *
   * Ví dụ cho lệnh toHaveScreenshot('vrt-01-login-page.png') trong visual.spec.ts:
   *   tests/visual.spec.ts-snapshots/vrt-01-login-page-chromium-win32.png
   *
   * TẠI SAO KHÔNG tùy chỉnh snapshotPathTemplate?
   * - Cấu hình mặc định của Playwright hoạt động tốt và nhất quán giữa các phiên bản.
   * - Tên file tự động bao gồm {platform} và {browser} → tránh nhầm lẫn khi commit Git.
   * - Nếu muốn tùy chỉnh, có thể bật snapshotPathTemplate sau khi hiểu rõ cú pháp:
   *   snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{projectName}/{snapshotName}',
   */


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

  /* --- CẤU HÌNH NGƯỠNG SO SÁNH ẢNH TOÀN CỤC (VRT) --- */
  /**
   * Các giá trị này là MẶC ĐỊNH TOÀN CỤC cho tất cả lời gọi toHaveScreenshot().
   * Từng test trong visual.spec.ts có thể OVERRIDE bằng cách truyền options riêng.
   *
   * maxDiffPixels : Tối đa 100 pixel được phép khác nhau (fallback an toàn).
   * threshold     : Mỗi pixel được sai lệch tối đa 20% về màu sắc.
   *
   * Trong visual.spec.ts, ta dùng maxDiffPixels: 50 (chặt hơn) để test nghiêm ngặt hơn.
   */
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
});
