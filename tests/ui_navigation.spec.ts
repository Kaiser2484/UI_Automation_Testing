import { test, expect } from '../fixtures/pom-fixture';

test.describe('UI Navigation & Utility Actions - AutomationExercise.com', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('TC-10: Đăng ký nhận tin tức tại Trang chủ (Subscription Home)', async ({ homePage }) => {
    await test.step('Bước 1: Cuộn xuống footer, điền email và click Subscribe', async () => {
      await homePage.subscribe('subscriber_home@test.com');
    });

    await test.step('Bước 2: Xác minh thông báo đăng ký nhận tin thành công', async () => {
      await expect(homePage.subscriptionSuccessAlert).toBeVisible();
      console.log('✓ Đăng ký nhận tin tức (Subscription) thành công tại Trang chủ.');
    });
  });

  test('TC-11: Đăng ký nhận tin tức tại Giỏ hàng (Subscription Cart)', async ({ homePage, cartPage }) => {
    await test.step('Bước 1: Chuyển hướng đến trang Giỏ hàng', async () => {
      await cartPage.goto();
    });

    await test.step('Bước 2: Cuộn xuống footer giỏ hàng và đăng ký nhận tin', async () => {
      await homePage.subscribe('subscriber_cart@test.com');
    });

    await test.step('Bước 3: Xác minh thông báo thành công hiển thị', async () => {
      await expect(homePage.subscriptionSuccessAlert).toBeVisible();
      console.log('✓ Đăng ký nhận tin tức (Subscription) thành công tại trang Giỏ hàng.');
    });
  });

  test('TC-25: Kiểm tra tính năng Scroll Down và Scroll Up dùng nút Arrow ở góc dưới', async ({ homePage }) => {
    await test.step('Bước 1: Xác minh trang chủ đã load thành công', async () => {
      await homePage.verifyHomePageVisible();
    });

    await test.step('Bước 2: Cuộn chuột xuống cuối cùng trang web', async () => {
      await homePage.scrollToBottom();
      await expect(homePage.subscriptionTitle).toBeVisible();
    });

    await test.step('Bước 3: Click vào nút mũi tên cuộn lên (Scroll Up Arrow) ở góc phải', async () => {
      await homePage.clickScrollUpArrow();
    });

    await test.step('Bước 4: Xác minh trang tự động cuộn lên đầu và tiêu đề slider hiển thị', async () => {
      await expect(homePage.sliderHeadingText).toBeVisible();
      console.log('✓ Tính năng Scroll Up sử dụng nút mũi tên hoạt động trơn tru.');
    });
  });

  test('TC-26: Kiểm tra tính năng Scroll Down và Scroll Up trực tiếp không dùng nút Arrow', async ({ homePage }) => {
    await test.step('Bước 1: Xác minh trang chủ đã load thành công', async () => {
      await homePage.verifyHomePageVisible();
    });

    await test.step('Bước 2: Cuộn chuột xuống cuối cùng trang web', async () => {
      await homePage.scrollToBottom();
      await expect(homePage.subscriptionTitle).toBeVisible();
    });

    await test.step('Bước 3: Cuộn chuột trực tiếp lên đầu trang web (Scroll Up Directly)', async () => {
      await homePage.scrollToTopDirectly();
    });

    await test.step('Bước 4: Xác minh trang tự động cuộn lên đầu và tiêu đề slider hiển thị', async () => {
      await expect(homePage.sliderHeadingText).toBeVisible();
      console.log('✓ Tính năng Scroll Up trực tiếp qua Javascript cuộn mượt mà.');
    });
  });
});
