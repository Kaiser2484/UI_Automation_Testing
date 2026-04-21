/**
 * InventoryPage.ts - Page Object Model cho trang Danh Sách Sản Phẩm (Inventory)
 * ===============================================================================
 *
 * Trang này xuất hiện SAU KHI đăng nhập thành công.
 * URL: https://www.saucedemo.com/inventory.html
 *
 * MỤC ĐÍCH CỦA PAGE OBJECT NÀY:
 * - Xác minh rằng người dùng đã đăng nhập thành công (kiểm tra URL, tiêu đề, sản phẩm).
 * - Cung cấp các method để tương tác với danh sách sản phẩm.
 * - Tuân thủ nguyên tắc POM: tách biệt locator/action khỏi assertion.
 */

import { type Page, type Locator } from '@playwright/test';

export class InventoryPage {
  // ========================================================================
  // KHAI BÁO THUỘC TÍNH
  // ========================================================================

  readonly page: Page;

  /**
   * Tiêu đề "Products" ở đầu trang Inventory.
   * Đây là indicator chính để xác nhận đã vào đúng trang sau đăng nhập.
   */
  readonly title: Locator;

  /**
   * Danh sách tất cả các sản phẩm (item) trên trang.
   * Mỗi sản phẩm nằm trong một container có class 'inventory_item'.
   */
  readonly inventoryItems: Locator;

  /**
   * Menu hamburger (biểu tượng ☰) ở góc trái trên.
   * Nhấn vào sẽ mở sidebar navigation.
   */
  readonly menuButton: Locator;

  /**
   * Nút "Logout" trong sidebar menu.
   * Dùng để test chức năng đăng xuất.
   */
  readonly logoutLink: Locator;

  /**
   * Giỏ hàng (cart icon) ở góc phải trên.
   * Hiển thị số lượng sản phẩm đã thêm vào giỏ.
   */
  readonly shoppingCartLink: Locator;

  /**
   * Dropdown để sắp xếp sản phẩm (A-Z, Z-A, giá tăng/giảm).
   */
  readonly sortDropdown: Locator;

  // ========================================================================
  // CONSTRUCTOR
  // ========================================================================

  constructor(page: Page) {
    this.page = page;

    // Dùng data-test attribute khi có → ưu tiên vì ổn định hơn class/id.
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  // ========================================================================
  // METHODS (HÀNH ĐỘNG)
  // ========================================================================

  /**
   * Lấy tiêu đề trang (text của phần tử title).
   *
   * TẠI SAO cần method riêng thay vì truy cập trực tiếp trong test?
   * - Đóng gói logic lấy text → nếu cấu trúc HTML đổi, chỉ sửa ở đây.
   * - Dùng '?? ""' để xử lý trường hợp phần tử chưa render (tránh null).
   */
  async getTitle(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Đếm số lượng sản phẩm hiển thị trên trang Inventory.
   *
   * TẠI SAO dùng count() thay vì lấy mảng rồi đếm length?
   * - count() là API chính thức của Playwright Locator, có auto-waiting tích hợp.
   * - Trả về Promise<number> → dùng trực tiếp trong expect() assertion.
   */
  async getInventoryItemCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * Lấy tên (tiêu đề) của tất cả sản phẩm trên trang.
   *
   * TẠI SAO cần method này?
   * - Cho phép test xác minh danh sách sản phẩm có đúng/đủ không.
   * - allTextContents() trả về mảng string các text content của TẤT CẢ phần tử match locator.
   */
  async getAllProductNames(): Promise<string[]> {
    // Locator con: tìm tên sản phẩm BÊN TRONG mỗi inventory item.
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  /**
   * Thực hiện hành động đăng xuất (Logout).
   *
   * QUY TRÌNH:
   * 1. Mở menu sidebar bằng nút hamburger.
   * 2. Đợi nút Logout hiển thị (vì sidebar có animation mở ra).
   * 3. Click nút Logout → trình duyệt chuyển về trang Login.
   */
  async logout() {
    await this.menuButton.click();
    // waitFor() đợi phần tử xuất hiện và visible trước khi click.
    // TẠI SAO cần waitFor? Vì sidebar có hiệu ứng slide-in, nút Logout chưa visible ngay.
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }

  /**
   * Thêm sản phẩm vào giỏ hàng theo tên sản phẩm.
   *
   * @param productName - Tên chính xác của sản phẩm (ví dụ: "Sauce Labs Backpack")
   *
   * TẠI SAO dùng filter() + hasText()?
   * - Locator chaining: lọc từ tất cả inventory item → chỉ lấy item có tên khớp.
   * - Cách tiếp cận này linh hoạt hơn so với hardcode selector cho từng sản phẩm.
   */
  async addProductToCartByName(productName: string) {
    const productCard = this.inventoryItems.filter({ hasText: productName });
    // Mỗi product card có một nút "Add to cart" bên trong.
    await productCard.locator('button', { hasText: 'Add to cart' }).click();
  }
}
