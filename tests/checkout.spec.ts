/**
 * checkout.spec.ts - Test Suite cho luồng Giỏ Hàng (Cart) và Thanh Toán (Checkout)
 * ==================================================================================
 *
 * ĐÂY LÀ E2E TEST (End-to-End Test) - Kiểm thử từ đầu đến cuối.
 *
 * E2E TEST LÀ GÌ?
 * - Mô phỏng TOÀN BỘ hành trình thực tế của người dùng.
 * - Bắt đầu từ đăng nhập → thêm vào giỏ → thanh toán → xác nhận đơn hàng.
 * - Khác với Unit Test (test từng hàm) và Integration Test (test ghép nối),
 *   E2E Test kiểm tra TOÀN BỘ HỆ THỐNG hoạt động đúng từ UI đến backend.
 *
 * CẤU TRÚC TEST:
 * 1. Cart Tests (Happy + Negative): Thêm/xóa sản phẩm, xác minh giỏ hàng.
 * 2. Checkout Tests (Happy + Negative): Thanh toán thành công + validation lỗi.
 * 3. Full E2E Flow: Luồng hoàn chỉnh từ Login → Checkout Complete.
 *
 * NGUYÊN TẮC:
 * - Dùng beforeEach() để đăng nhập trước MỖI test → đảm bảo test độc lập (isolated).
 * - Assertions kiểm tra STATE (trạng thái) chứ không chỉ kiểm tra ACTION (hành động).
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// Import dữ liệu test từ file JSON
import users from '../data/users.json';
import checkoutData from '../data/checkout.json';

// ============================================================================
// SETUP CHUNG: beforeEach() - Chạy trước MỖI test case
// ============================================================================
/**
 * TẠI SAO dùng beforeEach() thay vì đăng nhập trong từng test?
 * - DRY Principle: Không lặp lại code đăng nhập trong mọi test.
 * - Test Isolation (Cách ly test): Mỗi test bắt đầu từ trạng thái ĐÃ ĐĂNG NHẬP.
 *   Nếu một test thất bại, nó KHÔNG ảnh hưởng đến các test khác.
 * - beforeEach() chạy RIÊNG BIỆT cho mỗi test → mỗi test có session đăng nhập mới.
 */
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.validUser.username, users.validUser.password);
  // Đợi đến trang Inventory để đảm bảo đăng nhập thành công
  await expect(page).toHaveURL(/.*inventory.html/);
});

// ============================================================================
// CART TESTS - Kiểm thử Giỏ Hàng
// ============================================================================
test.describe('Giỏ Hàng (Cart) - Happy Path', () => {
  /**
   * TEST CASE 1: Thêm một sản phẩm vào giỏ hàng và xác minh.
   *
   * KIỂM TRA STATE, KHÔNG CHỈ ACTION:
   * - Không chỉ kiểm tra "nút Add to cart click được" (action).
   * - Mà kiểm tra "badge hiển thị số 1" VÀ "sản phẩm đúng tên trong giỏ" (state).
   */
  test('TC-Cart-01: Thêm 1 sản phẩm vào giỏ và xác minh badge + nội dung giỏ', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Thêm sản phẩm thứ nhất vào giỏ
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);

    // === XÁC MINH STATE 1: Badge hiển thị số "1" ===
    // TẠI SAO kiểm tra badge? Vì badge phản ánh trạng thái giỏ hàng NGAY trên trang Inventory.
    const badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe(1);

    // Mở giỏ hàng để xác minh nội dung
    await inventoryPage.goToCart();

    // === XÁC MINH STATE 2: Đang ở trang Cart ===
    await expect(page).toHaveURL(/.*cart.html/);

    // === XÁC MINH STATE 3: Đúng sản phẩm nằm trong giỏ ===
    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toContain(checkoutData.products.item1.name);
    expect(await cartPage.getCartItemCount()).toBe(1);
  });

  /**
   * TEST CASE 2: Thêm NHIỀU sản phẩm vào giỏ hàng.
   *
   * TẠI SAO cần test thêm nhiều sản phẩm?
   * - Test với 1 item có thể pass do trùng hợp. Test với 2+ items đảm bảo
   *   tính năng hoạt động đúng với SỐ LƯỢNG KHÁC NHAU (boundary testing).
   */
  test('TC-Cart-02: Thêm 2 sản phẩm và xác minh badge cập nhật đúng', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Thêm sản phẩm thứ nhất
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    // Thêm sản phẩm thứ hai
    await inventoryPage.addProductToCartByName(checkoutData.products.item2.name);

    // === XÁC MINH: Badge cập nhật thành "2" sau khi thêm sản phẩm thứ 2 ===
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);

    // Mở giỏ hàng
    await inventoryPage.goToCart();

    // === XÁC MINH: Giỏ hàng chứa ĐÚNG 2 sản phẩm với ĐÚNG tên ===
    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toHaveLength(2);
    expect(itemNames).toContain(checkoutData.products.item1.name);
    expect(itemNames).toContain(checkoutData.products.item2.name);
  });

  /**
   * TEST CASE 3: Xóa sản phẩm khỏi giỏ hàng.
   *
   * TẠI SAO cần test chức năng xóa?
   * - Đảm bảo người dùng có thể sửa đổi giỏ hàng trước khi thanh toán.
   * - Kiểm tra giỏ hàng cập nhật đúng sau khi xóa (state change).
   */
  test('TC-Cart-03: Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Thêm 2 sản phẩm
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.addProductToCartByName(checkoutData.products.item2.name);

    // Mở giỏ hàng
    await inventoryPage.goToCart();
    expect(await cartPage.getCartItemCount()).toBe(2);

    // Xóa sản phẩm thứ nhất
    await cartPage.removeItemByName(checkoutData.products.item1.name);

    // === XÁC MINH STATE: Giỏ hàng chỉ còn 1 sản phẩm ===
    expect(await cartPage.getCartItemCount()).toBe(1);

    // === XÁC MINH: Sản phẩm còn lại là ĐÚNG sản phẩm thứ 2 (không bị xóa nhầm) ===
    const remainingNames = await cartPage.getCartItemNames();
    expect(remainingNames).toContain(checkoutData.products.item2.name);
    expect(remainingNames).not.toContain(checkoutData.products.item1.name);
  });
});

// ============================================================================
// CHECKOUT TESTS - HAPPY PATH (Thanh toán thành công)
// ============================================================================
test.describe('Thanh Toán (Checkout) - Happy Path', () => {
  /**
   * TEST CASE 4: Luồng E2E hoàn chỉnh - Đăng nhập → Thêm giỏ → Checkout → Hoàn tất.
   *
   * ĐÂY LÀ TEST QUAN TRỌNG NHẤT (Critical Path Test):
   * - Mô phỏng TOÀN BỘ hành trình mua hàng của người dùng thực.
   * - Nếu test này FAIL → hệ thống có lỗi nghiêm trọng (showstopper bug).
   *
   * CÁC ĐIỂM KIỂM TRA (CHECKPOINTS):
   * ✓ Sản phẩm được thêm đúng vào giỏ
   * ✓ Thông tin khách hàng được nhập thành công
   * ✓ Tổng tiền = Subtotal + Tax (tính toán đúng)
   * ✓ Thông báo "Thank you for your order!" xuất hiện
   */
  test('TC-Checkout-01: Luồng E2E hoàn chỉnh - Thanh toán 2 sản phẩm thành công', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // ========================
    // GIAI ĐOẠN 1: THÊM VÀO GIỎ HÀNG
    // ========================

    // Thêm 2 sản phẩm vào giỏ
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.addProductToCartByName(checkoutData.products.item2.name);

    // Xác minh badge hiển thị "2"
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);

    // ========================
    // GIAI ĐOẠN 2: XÁC MINH GIỎ HÀNG
    // ========================

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);

    // Xác minh giỏ hàng có đúng 2 sản phẩm
    const cartNames = await cartPage.getCartItemNames();
    expect(cartNames).toHaveLength(2);

    // ========================
    // GIAI ĐOẠN 3: CHECKOUT STEP 1 - NHẬP THÔNG TIN
    // ========================

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Điền thông tin khách hàng từ file JSON (Data-Driven)
    await checkoutPage.fillCustomerInformation(
      checkoutData.validCustomer.firstName,
      checkoutData.validCustomer.lastName,
      checkoutData.validCustomer.postalCode
    );
    await checkoutPage.clickContinue();

    // ========================
    // GIAI ĐOẠN 4: CHECKOUT STEP 2 - XÁC MINH TỔNG QUAN
    // ========================

    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Xác minh tiêu đề trang
    await expect(checkoutPage.title).toHaveText('Checkout: Overview');

    // Xác minh sản phẩm trong đơn hàng (kiểm tra data integrity)
    const overviewNames = await checkoutPage.getCheckoutItemNames();
    expect(overviewNames).toHaveLength(2);
    expect(overviewNames).toContain(checkoutData.products.item1.name);
    expect(overviewNames).toContain(checkoutData.products.item2.name);

    // === KIỂM TRA TỔNG TIỀN (CRITICAL ASSERTION) ===
    /**
     * TẠI SAO kiểm tra tổng tiền là quan trọng nhất?
     * - Trong ứng dụng thương mại điện tử, tính toán giá SAI là lỗi nghiêm trọng.
     * - Công thức: Total = Subtotal + Tax
     * - Ta trích xuất giá trị số và kiểm tra phép cộng → phát hiện lỗi tính toán.
     */
    const subtotalText = await checkoutPage.getSubtotal();
    const taxText = await checkoutPage.getTax();
    const totalText = await checkoutPage.getTotal();

    const subtotalValue = checkoutPage.extractPriceValue(subtotalText);
    const taxValue = checkoutPage.extractPriceValue(taxText);
    const totalValue = checkoutPage.extractPriceValue(totalText);

    // Xác minh subtotal = tổng giá 2 sản phẩm
    const expectedSubtotal = checkoutData.products.item1.price + checkoutData.products.item2.price;
    expect(subtotalValue).toBeCloseTo(expectedSubtotal, 2);

    // Xác minh Total = Subtotal + Tax (tính toán đúng)
    // toBeCloseTo() với precision=2 để xử lý sai số làm tròn số thập phân (floating point).
    expect(totalValue).toBeCloseTo(subtotalValue + taxValue, 2);

    // ========================
    // GIAI ĐOẠN 5: HOÀN TẤT ĐƠN HÀNG
    // ========================

    await checkoutPage.clickFinish();
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // === XÁC MINH CUỐI CÙNG: Thông báo thành công ===
    await expect(checkoutPage.completeHeader).toBeVisible();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');

    // Xác minh có thông báo mô tả bổ sung
    await expect(checkoutPage.completeText).toBeVisible();
  });

  /**
   * TEST CASE 5: Sau khi hoàn tất, nút "Back Home" quay về trang Inventory.
   *
   * TẠI SAO cần test riêng?
   * - TC-Checkout-01 chỉ kiểm tra đến "Thank you".
   * - TC-Checkout-02 kiểm tra hành trình SAU KHI mua hàng xong → navigation đúng.
   */
  test('TC-Checkout-02: Nút Back Home quay về trang Inventory sau khi đặt hàng', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Thực hiện checkout nhanh với 1 sản phẩm
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillCustomerInformation(
      checkoutData.validCustomer.firstName,
      checkoutData.validCustomer.lastName,
      checkoutData.validCustomer.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();

    // Xác minh đang ở trang Complete
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Nhấn "Back Home"
    await checkoutPage.clickBackHome();

    // === XÁC MINH: Quay về trang Inventory ===
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });
});

// ============================================================================
// CHECKOUT TESTS - NEGATIVE PATH (Trường hợp lỗi)
// ============================================================================
/**
 * NEGATIVE TESTING CHO CHECKOUT:
 * - Tương tự Negative Testing cho Login, ta kiểm tra hệ thống phản ứng đúng
 *   khi người dùng KHÔNG nhập đầy đủ thông tin bắt buộc.
 * - Mỗi field bắt buộc (First Name, Last Name, Zip) là MỘT NHÁNH cần test.
 * - → Tăng Branch Coverage cho form validation của Checkout.
 */
test.describe('Thanh Toán (Checkout) - Negative Path (Validation lỗi)', () => {
  /**
   * beforeEach() riêng cho nhóm Negative:
   * - Thêm sản phẩm và vào trang Checkout Step 1 trước mỗi test.
   * - Giúp mỗi test chỉ cần tập trung vào phần validation.
   */
  test.beforeEach(async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  /**
   * TEST CASE 6: Checkout thất bại khi KHÔNG nhập First Name.
   *
   * NHÁNH LỖI: firstName trống → hệ thống phải hiển thị lỗi cụ thể.
   */
  test('TC-Checkout-Neg-01: Lỗi khi không nhập First Name', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Chỉ nhập Last Name và Zip, BỎ TRỐNG First Name
    await checkoutPage.fillCustomerInformation(
      '',
      checkoutData.validCustomer.lastName,
      checkoutData.validCustomer.postalCode
    );
    await checkoutPage.clickContinue();

    // === XÁC MINH: Thông báo lỗi yêu cầu nhập First Name ===
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');

    // === XÁC MINH: Vẫn ở trang Step 1 (KHÔNG chuyển sang Step 2) ===
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
  });

  /**
   * TEST CASE 7: Checkout thất bại khi KHÔNG nhập Last Name.
   *
   * TẠI SAO cần tách riêng với TC-Checkout-Neg-01?
   * - Mỗi field cần một test riêng vì thông báo lỗi KHÁC NHAU.
   * - Đảm bảo validation hoạt động RIÊNG cho từng field (không chỉ field đầu tiên).
   */
  test('TC-Checkout-Neg-02: Lỗi khi không nhập Last Name', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Chỉ nhập First Name và Zip, BỎ TRỐNG Last Name
    await checkoutPage.fillCustomerInformation(
      checkoutData.validCustomer.firstName,
      '',
      checkoutData.validCustomer.postalCode
    );
    await checkoutPage.clickContinue();

    // === XÁC MINH: Thông báo lỗi yêu cầu nhập Last Name ===
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toHaveText('Error: Last Name is required');
  });

  /**
   * TEST CASE 8: Checkout thất bại khi KHÔNG nhập Postal Code.
   */
  test('TC-Checkout-Neg-03: Lỗi khi không nhập Postal Code', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Chỉ nhập First Name và Last Name, BỎ TRỐNG Zip
    await checkoutPage.fillCustomerInformation(
      checkoutData.validCustomer.firstName,
      checkoutData.validCustomer.lastName,
      ''
    );
    await checkoutPage.clickContinue();

    // === XÁC MINH: Thông báo lỗi yêu cầu nhập Postal Code ===
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toHaveText('Error: Postal Code is required');
  });

  /**
   * TEST CASE 9: Checkout thất bại khi BỎ TRỐNG TẤT CẢ các field.
   *
   * TẠI SAO cần test trường hợp trống tất cả?
   * - Đây là edge case (trường hợp biên): người dùng nhấn Continue mà không nhập gì.
   * - Hệ thống nên ưu tiên báo lỗi field ĐẦU TIÊN (First Name).
   */
  test('TC-Checkout-Neg-04: Lỗi khi bỏ trống tất cả thông tin', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Không nhập gì, nhấn Continue trực tiếp
    await checkoutPage.clickContinue();

    // === XÁC MINH: Lỗi ưu tiên field đầu tiên (First Name) ===
    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
  });
});

// ============================================================================
// CART TESTS - NEGATIVE PATH
// ============================================================================
test.describe('Giỏ Hàng (Cart) - Negative Path', () => {
  /**
   * TEST CASE 10: Nút "Continue Shopping" quay về trang Inventory.
   *
   * TẠI SAO đây là negative path?
   * - Đây là luồng THAY THẾ: người dùng vào giỏ hàng nhưng quyết định KHÔNG checkout.
   * - Hệ thống phải cho phép quay lại trang sản phẩm mà KHÔNG mất dữ liệu giỏ hàng.
   */
  test('TC-Cart-Neg-01: Continue Shopping quay lại trang Inventory', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Thêm sản phẩm và mở giỏ hàng
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);

    // Nhấn "Continue Shopping"
    await cartPage.continueShopping();

    // === XÁC MINH: Quay về trang Inventory ===
    await expect(page).toHaveURL(/.*inventory.html/);

    // === XÁC MINH: Badge vẫn hiển thị "1" (giỏ hàng KHÔNG bị mất) ===
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  /**
   * TEST CASE 11: Hủy checkout bằng nút Cancel quay về trang Cart.
   */
  test('TC-Cart-Neg-02: Cancel checkout quay lại trang Cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Thêm sản phẩm → Cart → Checkout Step 1
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Nhấn Cancel
    await checkoutPage.clickCancel();

    // === XÁC MINH: Quay về trang Cart (không mất sản phẩm trong giỏ) ===
    await expect(page).toHaveURL(/.*cart.html/);
    expect(await cartPage.getCartItemCount()).toBe(1);
  });
});
