import { test, expect } from '../fixtures/pom-fixture';
import * as path from 'path';

test.describe('Contact Us & Info Pages - AutomationExercise.com', () => {
  test.beforeEach(async ({ homePage }) => {
    test.setTimeout(60000); // Tăng timeout cho TC-06 có upload file và dialog handling
    await homePage.goto();
  });

  test('TC-06: Điền Form Liên Hệ và Tải File Lên (Contact Us Form)', async ({ homePage, contactUsPage }) => {
    await test.step('Bước 1: Xác minh trang chủ đã hiển thị', async () => {
      await homePage.verifyHomePageVisible();
    });

    await test.step('Bước 2: Click vào mục "Contact Us" ở navbar', async () => {
      await homePage.clickContactUs();
      await expect(contactUsPage.title).toBeVisible();
    });

    await test.step('Bước 3: Nhập thông tin chi tiết vào form liên hệ', async () => {
      await contactUsPage.fillForm(
        'QA Automation Student',
        'qa_student_2026@test.com',
        'Câu hỏi hỗ trợ bài tập lớn SQA',
        'Kính gửi giảng viên, đây là thông điệp tự động gửi từ kịch bản kiểm thử tự động của em.'
      );
    });

    await test.step('Bước 4: Upload tệp tin đính kèm (sử dụng package.json có sẵn)', async () => {
      // Sử dụng file package.json có sẵn trong thư mục gốc của project để đính kèm
      const uploadPath = path.resolve(process.cwd(), 'package.json');
      await contactUsPage.uploadAttachment(uploadPath);
    });

    await test.step('Bước 5: Click Submit và tự động đồng ý hộp thoại xác nhận (Alert Dialog)', async () => {
      // submit() tự xử lý dialog và đợi jQuery show successMessage
      await contactUsPage.submit();
    });

    await test.step('Bước 6: Xác minh thông báo gửi liên hệ thành công hiển thị', async () => {
      await expect(contactUsPage.successMessage).toBeVisible();
    });

    await test.step('Bước 7: Click nút quay về trang chủ và kiểm tra', async () => {
      await contactUsPage.clickHome();
      await homePage.verifyHomePageVisible();
    });
  });

  test('TC-07: Xác minh điều hướng trang Test Cases thành công (Verify Test Cases Page)', async ({ homePage, testCasesPage }) => {
    await test.step('Bước 1: Xác minh trang chủ hiển thị', async () => {
      await homePage.verifyHomePageVisible();
    });

    await test.step('Bước 2: Click vào mục "Test Cases" trên menu', async () => {
      await homePage.clickTestCases();
    });

    await test.step('Bước 3: Kiểm tra tiêu đề và trang Test Cases hiển thị đầy đủ', async () => {
      await testCasesPage.verifyTestCasesPageVisible();
    });
  });
});
