/**
 * tests/data_driven.spec.ts
 * =========================
 * Kịch Bản Kiểm Thử Hướng Dữ Liệu (Data-Driven Testing - DDT)
 *
 * MỤC TIÊU SQA:
 * 1. Tách biệt hoàn toàn dữ liệu kiểm thử (Test Data) khỏi mã kịch bản (Test Code).
 * 2. Thực thi cùng một kiểm thử nhiều lần với các tập dữ liệu đầu vào khác nhau.
 * 3. Tận dụng B1 Custom Fixtures để viết mã nguồn cực kỳ gọn gàng và dễ bảo trì.
 */

import { test, expect } from '../fixtures/pom-fixture';

test.describe('Data-Driven Testing (DDT) - AutomationExercise.com', () => {
  // ==========================================================================
  // DATASET 1: DANH SÁCH TỪ KHÓA TÌM KIẾM SẢN PHẨM
  // ==========================================================================
  const SEARCH_KEYWORDS = ['Blue Top', 'Men Tshirt', 'Sleeveless'];

  SEARCH_KEYWORDS.forEach((keyword) => {
    test(`DDT-01: Tìm kiếm sản phẩm theo từ khóa động — "${keyword}"`, async ({ productsPage }) => {
      await test.step('Bước 1: Đi tới trang danh sách sản phẩm', async () => {
        await productsPage.goto();
      });

      await test.step(`Bước 2: Điền từ khóa "${keyword}" và nhấn tìm kiếm`, async () => {
        await productsPage.searchProduct(keyword);
      });

      await test.step(`Bước 3: Xác minh tiêu đề trang hiển thị tìm kiếm thành công`, async () => {
        await expect(productsPage.pageTitle).toContainText('Searched Products');
      });

      await test.step(`Bước 4: Xác minh có sản phẩm hiển thị và sản phẩm đầu tiên khớp với từ khóa`, async () => {
        const count = await productsPage.getProductCount();
        expect(count).toBeGreaterThan(0);

        const firstProductName = await productsPage.getProductNameByIndex(0);
        expect(firstProductName.toLowerCase()).toContain(keyword.toLowerCase());
        console.log(`✓ [DDT Search] Tìm thấy ${count} sản phẩm phù hợp với từ khóa "${keyword}".`);
      });
    });
  });

  // ==========================================================================
  // DATASET 2: DANH SÁCH THÔNG TIN LIÊN HỆ GỬI FORM
  // ==========================================================================
  const CONTACT_SUBMISSIONS = [
    {
      name: 'Nguyen Van A',
      email: 'van.a@test.com',
      subject: 'Inquiry - SQA Assignment',
      message: 'Xin chào, đây là thư liên hệ hỏi về lịch nộp đồ án môn học.',
    },
    {
      name: 'Tran Thi B',
      email: 'thi.b@test.com',
      subject: 'Bug Report - Live Platform',
      message: 'Hệ thống Live của thầy bị hiển thị thiếu hình ảnh sản phẩm.',
    },
  ];

  CONTACT_SUBMISSIONS.forEach((data, index) => {
    test(`DDT-02: Điền Form Liên Hệ tự động với bộ dữ liệu #${index + 1} — ${data.name}`, async ({ contactUsPage }) => {
      await test.step('Bước 1: Điều hướng trực tiếp đến trang liên hệ', async () => {
        await contactUsPage.goto();
      });

      await test.step(`Bước 2: Điền dữ liệu liên hệ của ${data.name}`, async () => {
        await contactUsPage.fillForm(data.name, data.email, data.subject, data.message);
      });

      await test.step('Bước 3: Gửi form và tự động đồng ý xác nhận Alert', async () => {
        await contactUsPage.submit();
      });

      await test.step('Bước 4: Xác minh thông báo gửi thành công xuất hiện', async () => {
        await expect(contactUsPage.successMessage).toBeVisible();
        console.log(`✓ [DDT Contact] Gửi thành công tin nhắn hỗ trợ từ: ${data.name}.`);
      });
    });
  });
});
