/**
 * CartPage.ts - Page Object Model cho trang Giỏ Hàng (Cart)
 * ===========================================================
 *
 * URL: https://www.saucedemo.com/cart.html
 *
 * LUỒNG NGƯỜI DÙNG:
 * Inventory → [Click giỏ hàng] → **Cart Page** → [Checkout] → Checkout Step 1
 *
 * MỤC ĐÍCH:
 * - Hiển thị danh sách sản phẩm đã thêm vào giỏ.
 * - Cho phép xóa sản phẩm khỏi giỏ.
 * - Cho phép tiếp tục mua sắm hoặc tiến hành thanh toán (Checkout).
 *
 * TẠI SAO CẦN PAGE OBJECT RIÊNG CHO CART?
 * - Cart Page có giao diện và chức năng KHÁC BIỆT so với Inventory Page.
 * - Nguyên tắc POM: mỗi trang = một class → tách biệt trách nhiệm.
 * - Các test E2E (End-to-End) cần xác minh sản phẩm trong giỏ trước khi checkout.
 */

import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  // ========================================================================
  // KHAI BÁO THUỘC TÍNH (LOCATORS)
  // ========================================================================

  readonly page: Page;

  /**
   * Tiêu đề trang "Your Cart".
   * Dùng để xác nhận đã điều hướng đúng đến trang giỏ hàng.
   */
  readonly title: Locator;

  /**
   * Danh sách tất cả các sản phẩm trong giỏ hàng.
   * Mỗi item là một hàng (row) chứa tên, mô tả, giá, và nút Remove.
   */
  readonly cartItems: Locator;

  /**
   * Nút "Continue Shopping" - quay lại trang Inventory để mua thêm.
   */
  readonly continueShoppingButton: Locator;

  /**
   * Nút "Checkout" - tiến hành thanh toán.
   * Chuyển đến Checkout Step 1 (nhập thông tin khách hàng).
   */
  readonly checkoutButton: Locator;

  // ========================================================================
  // CONSTRUCTOR
  // ========================================================================

  constructor(page: Page) {
    this.page = page;

    // SauceDemo sử dụng data-test attributes nhất quán → ưu tiên dùng.
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // ========================================================================
  // METHODS (HÀNH ĐỘNG)
  // ========================================================================

  /**
   * Lấy số lượng sản phẩm có trong giỏ hàng.
   *
   * TẠI SAO không dùng cart badge mà dùng count() trên DOM?
   * - Badge chỉ hiển thị CON SỐ, còn count() đếm SỐ PHẦN TỬ THỰC TẾ trên trang.
   * - So sánh cả hai giúp phát hiện lỗi không đồng nhất giữa badge và nội dung thật.
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Lấy tên tất cả sản phẩm trong giỏ hàng.
   *
   * TẠI SAO cần method này?
   * - Xác minh ĐÚNG sản phẩm được thêm vào giỏ (không phải sản phẩm khác).
   * - Quan trọng cho E2E test: kiểm tra "Sauce Labs Backpack" nằm trong giỏ,
   *   không chỉ kiểm tra "có 1 item" (kiểm tra GIÁ TRỊ thay vì chỉ SỐ LƯỢNG).
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  /**
   * Lấy giá của tất cả sản phẩm trong giỏ hàng.
   *
   * TẠI SAO trả về mảng string thay vì number?
   * - Giá hiển thị dưới dạng "$29.99" (có ký tự $).
   * - Để test linh hoạt hơn: có thể kiểm tra format hoặc chuyển sang số khi cần.
   */
  async getCartItemPrices(): Promise<string[]> {
    return await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng theo tên sản phẩm.
   *
   * @param productName - Tên chính xác của sản phẩm cần xóa
   *
   * TẠI SAO dùng filter() + hasText()?
   * - Tương tự InventoryPage.addProductToCartByName(), ta lọc theo tên sản phẩm.
   * - Đảm bảo xóa ĐÚNG sản phẩm, không xóa nhầm item khác.
   */
  async removeItemByName(productName: string) {
    const cartItem = this.cartItems.filter({ hasText: productName });
    await cartItem.locator('button', { hasText: 'Remove' }).click();
  }

  /**
   * Nhấn nút "Checkout" để tiến hành thanh toán.
   * Chuyển đến Checkout Step 1 (nhập thông tin khách hàng).
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /**
   * Nhấn nút "Continue Shopping" để quay lại trang Inventory.
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
