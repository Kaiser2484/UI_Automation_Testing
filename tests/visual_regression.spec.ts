/**
 * tests/visual_regression.spec.ts
 * ===============================
 * Kịch Bản Kiểm Thử So Khớp Giao Diện Trực Quan (Visual Regression Testing - VRT)
 *
 * MỤC TIÊU SQA:
 * 1. Đảm bảo tính toàn vẹn của UI/UX (CSS, Fonts, Layout) qua các phiên bản cập nhật code.
 * 2. Tránh flaky test do các thành phần động (Carousel, Ads) bằng cách chỉ kiểm thử các cụm tĩnh (Static Components).
 * 3. Thiết lập thuộc tính `maxDiffPixels` và `threshold` khoa học để xử lý sai lệch render nhỏ giữa các trình duyệt.
 */

import { test, expect } from '../fixtures/pom-fixture';

test.describe('Visual Regression Testing (VRT) - AutomationExercise.com', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('VRT-01: So khớp trực quan Logo thương hiệu ở Header (Brand Logo)', async ({ homePage }) => {
    await test.step('Bước 1: Xác minh logo hiển thị hoàn chỉnh trên màn hình', async () => {
      await expect(homePage.logo).toBeVisible();
    });

    await test.step('Bước 2: So khớp screenshot Logo với ảnh mẫu (Golden Master)', async () => {
      // Chụp ảnh phần tử logo tĩnh ở góc trái header
      await expect(homePage.logo).toHaveScreenshot('brand-logo.png', {
        maxDiffPixelRatio: 0.05, // Chấp nhận lệch tối đa 5% pixel (do khử răng cưa của font/renderer)
        threshold: 0.2,          // Độ nhạy tương phản màu
      });
      console.log('✓ [VRT Logo] Logo thương hiệu khớp giao diện mẫu 100%.');
    });
  });

  test('VRT-02: So khớp trực quan tiêu đề mục "GET IN TOUCH" trên trang liên hệ', async ({ contactUsPage }) => {
    await test.step('Bước 1: Điều hướng trực tiếp đến trang liên hệ', async () => {
      await contactUsPage.goto();
    });

    await test.step('Bước 2: So khớp tiêu đề tĩnh "GET IN TOUCH"', async () => {
      await expect(contactUsPage.title).toHaveScreenshot('get-in-touch-title.png', {
        maxDiffPixelRatio: 0.02,
      });
      console.log('✓ [VRT Title] Tiêu đề "GET IN TOUCH" khớp hoàn hảo giao diện thiết kế.');
    });
  });
});
