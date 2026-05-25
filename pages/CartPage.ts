/**
 * pages/CartPage.ts - Page Object Model cho Trang Giỏ Hàng (Cart)
 * =================================================================
 *
 * MỤC TIÊU TRANG:
 * URL: https://automationexercise.com/view_cart
 *
 * PHÂN TÍCH HTML STRUCTURE:
 * -------------------------
 * <table class="table table-condensed">
 *   <thead>
 *     <tr>
 *       <th>Product</th>
 *       <th>Category</th>
 *       <th>Price</th>
 *       <th>Quantity</th>
 *       <th>Total</th>
 *       <th>Delete</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr id="product-1">
 *       <td class="cart_description">
 *         <h4><a href="/product_details/1">Blue Top</a></h4>
 *         <p>Women > Tops</p>
 *       </td>
 *       <td class="cart_category"><p>Women > Tops</p></td>
 *       <td class="cart_price"><p>Rs. 500</p></td>
 *       <td class="cart_quantity">
 *         <button class="disabled btn btn-warning btn-xs minus">-</button>
 *         <input class="disabled" type="text" value="1">
 *         <button class="btn btn-warning btn-xs plus">+</button>
 *       </td>
 *       <td class="cart_total"><p class="cart_total_price">Rs. 500</p></td>
 *       <td class="cart_delete">
 *         <a class="cart_quantity_delete" id="product-1" href="/delete_from_cart">
 *           <i class="fa fa-times"></i>
 *         </a>
 *       </td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * NÚT "PROCEED TO CHECKOUT":
 * <div class="col-sm-6">
 *   <a href="/checkout" class="btn btn-default check_out">Proceed To Checkout</a>
 * </div>
 */

import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  // ========================================================================
  // KHAI BÁO LOCATORS
  // ========================================================================

  readonly page: Page;

  /**
   * Tiêu đề breadcrumb "Shopping Cart".
   * HTML: <li class="active">Shopping Cart</li>
   * Dùng để xác minh đang ở trang giỏ hàng.
   */
  readonly pageTitle: Locator;

  /**
   * Bảng danh sách sản phẩm trong giỏ hàng.
   * HTML: <table class="table table-condensed">
   */
  readonly cartTable: Locator;

  /**
   * TẤT CẢ các row sản phẩm trong giỏ hàng.
   * Mỗi row là một <tr id="product-{id}"> trong <tbody>.
   * Dùng để đếm số sản phẩm và lặp qua từng item.
   */
  readonly cartItems: Locator;

  /**
   * Nút "Proceed To Checkout".
   * HTML: <a href="/checkout" class="btn btn-default check_out">Proceed To Checkout</a>
   *
   * LƯU Ý: Nút này có class "check_out" (giống nút "View Cart" trong modal).
   * → Cần scope selector để tránh nhầm lẫn.
   */
  readonly proceedToCheckoutButton: Locator;

  /**
   * Text thông báo khi giỏ hàng trống.
   * HTML: <b>Cart is empty! Click here to buy products.</b>
   * Dùng để xác minh giỏ hàng đang trống (cho negative test).
   */
  readonly emptyCartMessage: Locator;

  // ========================================================================
  // CONSTRUCTOR
  // ========================================================================

  constructor(page: Page) {
    this.page = page;

    this.pageTitle   = page.locator('li.active:has-text("Shopping Cart")');
    this.cartTable   = page.locator('table.table');
    this.cartItems   = page.locator('#cart_info_table tbody tr');

    // "Proceed To Checkout" — nằm trong section bên dưới bảng giỏ hàng
    // Dùng text content để xác định chính xác, tránh nhầm với nút khác
    this.proceedToCheckoutButton = page.locator('a.btn.check_out:has-text("Proceed To Checkout")');

    this.emptyCartMessage = page.locator('b:has-text("Cart is empty")');
  }

  // ========================================================================
  // METHODS (HÀNH ĐỘNG)
  // ========================================================================

  /**
   * Điều hướng trực tiếp đến trang giỏ hàng.
   */
  async goto() {
    await this.page.goto('/view_cart', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Lấy tên của TẤT CẢ sản phẩm trong giỏ hàng.
   *
   * CÁCH HOẠT ĐỘNG:
   * Trong mỗi row, tên sản phẩm nằm trong:
   * <td class="cart_description"><h4><a>Product Name</a></h4></td>
   *
   * @returns Mảng chứa tên các sản phẩm trong giỏ
   */
  async getCartItemNames(): Promise<string[]> {
    const nameLocator = this.page.locator('#cart_info_table td.cart_description h4 a');
    return await nameLocator.allTextContents();
  }

  /**
   * Đếm số lượng sản phẩm khác nhau trong giỏ hàng.
   *
   * LƯU Ý: Đây là số LOẠI sản phẩm, không phải tổng số lượng.
   * (Ví dụ: 1 "Blue Top" số lượng 3 → trả về 1, không phải 3)
   *
   * @returns Số loại sản phẩm trong giỏ
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Lấy giá của sản phẩm theo tên.
   *
   * @param productName - Tên sản phẩm cần lấy giá
   * @returns Giá dạng string (ví dụ: "Rs. 500")
   */
  async getPriceByProductName(productName: string): Promise<string> {
    const row = this.page.locator('#cart_info_table tbody tr').filter({ hasText: productName });
    const priceCell = row.locator('td.cart_price p');
    return (await priceCell.textContent())?.trim() ?? '';
  }

  /**
   * Lấy số lượng (quantity) của sản phẩm theo tên.
   *
   * @param productName - Tên sản phẩm
   * @returns Số lượng dạng number
   */
  async getQuantityByProductName(productName: string): Promise<number> {
    const row = this.page.locator('#cart_info_table tbody tr').filter({ hasText: productName });
    const qtyBtn = row.locator('td.cart_quantity button, td.cart_quantity input, td.cart_quantity');
    const value = await qtyBtn.first().textContent();
    return parseInt(value?.trim() ?? '0', 10);
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng theo tên.
   *
   * @param productName - Tên sản phẩm cần xóa
   */
  async removeProductByName(productName: string) {
    const row = this.page.locator('#cart_info_table tbody tr').filter({ hasText: productName });
    const deleteBtn = row.locator('a.cart_quantity_delete');
    await deleteBtn.click();
    // Đợi row biến mất (có animation)
    await row.waitFor({ state: 'hidden' });
  }

  /**
   * Click nút "Proceed To Checkout" để chuyển sang trang thanh toán.
   *
   * SAU KHI CLICK:
   * - Nếu đã đăng nhập → chuyển đến /checkout (trang xác nhận địa chỉ + đơn hàng).
   * - Nếu chưa đăng nhập → hiện popup yêu cầu đăng nhập hoặc đăng ký.
   */
  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  /**
   * Kiểm tra giỏ hàng có trống không.
   *
   * @returns true nếu giỏ hàng trống
   */
  async isCartEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible({ timeout: 3000 }).catch(() => false);
  }
}
