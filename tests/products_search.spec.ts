import { test, expect } from '../fixtures/pom-fixture';

test.describe('Products Search & Filtering - AutomationExercise.com', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('TC-08: Xem chi tiết sản phẩm đầu tiên (Verify All Products and product detail page)', async ({ productsPage }) => {
    await test.step('Bước 1: Xác minh hiển thị tiêu đề "All Products"', async () => {
      await expect(productsPage.pageTitle).toBeVisible();
    });

    await test.step('Bước 2: Click vào xem chi tiết của sản phẩm đầu tiên', async () => {
      await productsPage.viewProductDetailByIndex(0);
    });

    await test.step('Bước 3: Xác minh các trường chi tiết sản phẩm hiển thị đầy đủ', async () => {
      await expect(productsPage.detailProductName).toBeVisible();
      await expect(productsPage.detailProductCategory).toBeVisible();
      await expect(productsPage.detailProductPrice).toBeVisible();
      await expect(productsPage.detailProductAvailability).toBeVisible();
      await expect(productsPage.detailProductCondition).toBeVisible();
      await expect(productsPage.detailProductBrand).toBeVisible();

      // Log thông tin để kiểm tra học thuật
      const productName = await productsPage.detailProductName.textContent();
      const productPrice = await productsPage.detailProductPrice.textContent();
      console.log(`✓ Sản phẩm chi tiết: ${productName?.trim()} - Giá: ${productPrice?.trim()}`);
    });
  });

  test('TC-09: Tìm kiếm sản phẩm theo từ khóa (Search Product)', async ({ productsPage }) => {
    const searchKeyword = 'Blue Top';

    await test.step('Bước 1: Điền từ khóa tìm kiếm và click search', async () => {
      await productsPage.searchProduct(searchKeyword);
    });

    await test.step('Bước 2: Xác minh tiêu đề "Searched Products" xuất hiện', async () => {
      await expect(productsPage.pageTitle).toContainText('Searched Products');
    });

    await test.step('Bước 3: Xác minh sản phẩm tìm kiếm có xuất hiện trong danh sách', async () => {
      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThan(0);

      const firstProductName = await productsPage.getProductNameByIndex(0);
      expect(firstProductName.toLowerCase()).toContain(searchKeyword.toLowerCase());
      console.log(`✓ Tìm thấy ${count} sản phẩm phù hợp. Sản phẩm đầu tiên: ${firstProductName}`);
    });
  });

  test('TC-18: Xem sản phẩm theo Danh mục (View Category Products)', async ({ productsPage }) => {
    await test.step('Bước 1: Xác minh bảng danh mục (Category Panel) hiển thị ở sidebar', async () => {
      await expect(productsPage.sidebarCategoryTitle).toBeVisible();
    });

    await test.step('Bước 2: Click danh mục Women -> click Tops', async () => {
      await productsPage.selectWomenCategory('Tops');
    });

    await test.step('Bước 3: Xác minh tiêu đề danh mục hiển thị đúng', async () => {
      await expect(productsPage.pageTitle).toContainText('Women - Tops Products');
    });

    await test.step('Bước 4: Click danh mục Men -> click Tshirts', async () => {
      await productsPage.selectMenTshirtsCategory();
    });

    await test.step('Bước 5: Xác minh tiêu đề danh mục đổi sang Men', async () => {
      await expect(productsPage.pageTitle).toContainText('Men - Tshirts Products');
    });
  });

  test('TC-19: Xem sản phẩm theo Thương hiệu (View & Cart Brand Products)', async ({ productsPage }) => {
    await test.step('Bước 1: Xác minh bảng thương hiệu (Brands Panel) hiển thị ở sidebar', async () => {
      await expect(productsPage.sidebarBrandTitle).toBeVisible();
    });

    await test.step('Bước 2: Chọn thương hiệu "Polo"', async () => {
      await productsPage.selectBrand('Polo');
    });

    await test.step('Bước 3: Xác minh tiêu đề hiển thị đúng thương hiệu', async () => {
      await expect(productsPage.pageTitle).toContainText('Brand - Polo Products');
      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Bước 4: Chọn thương hiệu khác "H&M"', async () => {
      await productsPage.selectBrand('H&M');
    });

    await test.step('Bước 5: Xác minh tiêu đề đổi sang H&M và sản phẩm cập nhật', async () => {
      await expect(productsPage.pageTitle).toContainText('Brand - H&M Products');
      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('TC-21: Gửi đánh giá cho sản phẩm (Add review on product)', async ({ productsPage }) => {
    await test.step('Bước 1: Click xem chi tiết sản phẩm đầu tiên', async () => {
      await productsPage.viewProductDetailByIndex(0);
    });

    await test.step('Bước 2: Điền thông tin vào form Đánh giá ở cuối trang', async () => {
      await productsPage.submitReview(
        'QA Automation Expert',
        'qa_student_2026@test.com',
        'Sản phẩm chất lượng rất tốt, đường may chắc chắn và vải mặc rất thoáng mát.'
      );
    });

    await test.step('Bước 3: Xác minh thông báo gửi đánh giá thành công hiển thị', async () => {
      await expect(productsPage.reviewSuccessAlert).toBeVisible();
    });
  });
});
