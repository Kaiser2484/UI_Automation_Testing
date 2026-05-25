/**
 * pages/CheckoutPage.ts - Page Object Model cho Trang Thanh Toán
 * ===============================================================
 *
 * URL: https://automationexercise.com/checkout
 *
 * PHÂN TÍCH HTML THỰC TẾ (đã xác minh qua screenshot):
 * ─────────────────────────────────────────────────────
 *
 * 1. ADDRESS DETAILS (hai cột song song):
 * <div class="checkout-information">
 *   <div class="row">
 *     <div class="col-sm-6">
 *       <div class="address_content">
 *         <div class="step-one">YOUR DELIVERY ADDRESS</div>
 *         <ul id="address_delivery">
 *           <li class="address_firstname address_lastname">Mr. Nyxshade Z</li>
 *           <li class="address_address1 address_address2">VN</li>
 *           <li class="address_city address_state_name address_postcode">V H 10000</li>
 *           <li class="address_country_name">Singapore</li>
 *           <li class="address_phone">0900000001</li>
 *         </ul>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * 2. REVIEW YOUR ORDER:
 * <div class="col-sm-12">
 *   <h2>Review Your Order</h2>
 *   <table class="table table-condensed">   ← KHÔNG có id="#cart_info_table"!
 *     <tbody>
 *       <tr>
 *         <td>... product image ...</td>
 *         <td class="cart_description"><h4><a>Blue Top</a></h4></td>
 *         <td class="cart_price"><p>Rs. 500</p></td>
 *         <td class="cart_quantity">...</td>
 *         <td class="cart_total"><p>Rs. 500</p></td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 *
 * 3. COMMENT & PLACE ORDER:
 * <textarea id="ordermsg" name="message"></textarea>
 * <a href="/payment" class="btn btn-default check_out">Place Order</a>
 *
 * SỰ KHÁC BIỆT so với Cart page:
 * - Cart page: bảng có id="cart_info_table"
 * - Checkout page: bảng KHÔNG có id → dùng selector theo vị trí
 */

import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  /** Tiêu đề "Address Details" — xác minh đang ở trang Checkout */
  readonly addressDetailsTitle: Locator;
  /** Tiêu đề "Your delivery address" */
  readonly deliveryAddressTitle: Locator;
  /** Tiêu đề "Review Your Order" */
  readonly orderReviewTitle: Locator;
  /** Các dòng sản phẩm trong bảng review */
  readonly orderItems: Locator;
  /** Ô nhập comment đơn hàng */
  readonly orderCommentInput: Locator;
  /** Nút "Place Order" */
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Tiêu đề section "Address Details"
    this.addressDetailsTitle = page.locator('h2:has-text("Address Details"), .step-one:has-text("Address")').first();

    // Delivery address title — "YOUR DELIVERY ADDRESS" (uppercase in HTML)
    this.deliveryAddressTitle = page.locator('.step-one').first();

    // "Review Your Order" heading
    this.orderReviewTitle = page.locator('h2:has-text("Review Your Order")');

    /**
     * ORDER ITEMS SELECTOR — trang Checkout:
     * Bảng review KHÔNG có id, khác Cart page.
     * Dùng selector tổng quát: tìm tbody tr bên trong bảng .table.table-condensed
     * trên trang checkout (sau section "Review Your Order").
     *
     * Playwright locator: '.cart_info table tbody tr' hoặc
     * 'table.table-condensed tbody tr'
     */
    this.orderItems = page.locator('.cart_info table tbody tr');

    // Comment textarea:
    // HTML thực tế: <div id="ordermsg" class="form-group"><textarea name="message"></textarea></div>
    // #ordermsg là div wrapper → cần target textarea bên trong
    this.orderCommentInput = page.locator('#ordermsg textarea, textarea[name="message"]').first();

    // "Place Order" button
    this.placeOrderButton = page.locator('a.btn.check_out:has-text("Place Order")');
  }

  /**
   * Xác minh trang Checkout đã render đầy đủ.
   *
   * Trang checkout dài — cần scroll và đợi sản phẩm load.
   */
  async waitForCheckoutPage() {
    // Bước 1: Đợi heading "Review Your Order"
    await this.orderReviewTitle.waitFor({ state: 'visible', timeout: 15000 });

    // Bước 2: Scroll xuống phần Review
    await this.orderReviewTitle.scrollIntoViewIfNeeded();

    // Bước 3: Đợi bảng render (thử các selector có thể có trên trang checkout)
    // Trang AE có thể dùng #cart_items hoặc .cart_info làm container
    await this.page.waitForFunction(
      () => {
        // Kiểm tra các selector có thể có trên trang
        const selectors = [
          '#cart_items table tbody tr',
          '.cart_info table tbody tr',
          'table.table-condensed tbody tr',
        ];
        for (const sel of selectors) {
          const rows = document.querySelectorAll(sel);
          if (rows.length > 0) return true;
        }
        return false;
      },
      { timeout: 15000 }
    );

    // Bước 4: Đợi thêm 300ms để DOM ổn định
    await this.page.waitForTimeout(300);
  }

  /**
   * Lấy danh sách tên sản phẩm trong phần Review Order.
   *
   * Thử nhiều selectors vì cấu trúc HTML trang checkout của AE
   * có thể khác với cart page.
   */
  async getOrderItemNames(): Promise<string[]> {
    // Thử các selectors theo thứ tự ưu tiên
    const selectors = [
      '#cart_items table td.cart_description h4 a',
      '.cart_info table td.cart_description h4 a',
      'table.table-condensed td.cart_description h4 a',
    ];
    for (const sel of selectors) {
      const locator = this.page.locator(sel);
      const count = await locator.count();
      if (count > 0) {
        return await locator.allTextContents();
      }
    }
    return [];
  }

  /**
   * Đếm số sản phẩm trong đơn hàng review.
   */
  async getOrderItemCount(): Promise<number> {
    const selectors = [
      '#cart_items table tbody tr',
      '.cart_info table tbody tr',
      'table.table-condensed tbody tr',
    ];
    for (const sel of selectors) {
      const count = await this.page.locator(sel).count();
      if (count > 0) return count;
    }
    return 0;
  }

  /**
   * Nhập comment cho đơn hàng.
   */
  async fillOrderComment(comment: string) {
    await this.orderCommentInput.fill(comment);
  }

  /**
   * Click "Place Order" để chuyển sang trang thanh toán (/payment).
   */
  async placeOrder() {
    await this.placeOrderButton.click();
  }
}
