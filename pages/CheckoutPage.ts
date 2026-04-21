/**
 * CheckoutPage.ts - Page Object Model cho quy trình Thanh Toán (Checkout)
 * ========================================================================
 *
 * SauceDemo có quy trình thanh toán GỒM 3 BƯỚC:
 *   Step 1: Nhập thông tin khách hàng (Your Information)
 *   Step 2: Xem tổng quan đơn hàng (Overview) - xác nhận giá, thuế, tổng tiền
 *   Step 3: Hoàn tất đơn hàng (Complete) - hiển thị thông báo thành công
 *
 * TẠI SAO GỘP 3 BƯỚC VÀO MỘT CLASS DUY NHẤT?
 * - Cả 3 bước đều thuộc CÙNG MỘT QUY TRÌNH NGHIỆP VỤ (checkout flow).
 * - Nếu tách riêng (CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage)
 *   sẽ tạo ra quá nhiều file nhỏ cho một flow đơn giản.
 * - Đây là quyết định thiết kế CÂN BẰNG giữa: phân tách trách nhiệm vs. tính thực dụng.
 * - Nếu flow checkout phức tạp hơn (nhiều step, nhiều form), nên tách riêng.
 *
 * GHI CHÚ: Trong môi trường doanh nghiệp (enterprise), best practice là tách riêng.
 *          Trong project học thuật, gộp lại giúp dễ hiểu hơn.
 */

import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  // ========================================================================
  // KHAI BÁO THUỘC TÍNH (LOCATORS)
  // ========================================================================

  readonly page: Page;

  // --- STEP 1: THÔNG TIN KHÁCH HÀNG (Your Information) ---

  /** Ô nhập Tên (First Name) */
  readonly firstNameInput: Locator;

  /** Ô nhập Họ (Last Name) */
  readonly lastNameInput: Locator;

  /** Ô nhập Mã bưu chính (Zip/Postal Code) */
  readonly postalCodeInput: Locator;

  /**
   * Nút "Continue" ở Step 1 - chuyển sang Step 2.
   * CHỈ hoạt động khi tất cả field đã được điền hợp lệ.
   * Nếu thiếu field → hiển thị thông báo lỗi (tương tự validation login).
   */
  readonly continueButton: Locator;

  /** Nút "Cancel" - hủy checkout và quay lại trang trước đó. */
  readonly cancelButton: Locator;

  /**
   * Thông báo lỗi validation khi thiếu thông tin bắt buộc.
   * Ví dụ: "Error: First Name is required"
   *
   * TẠI SAO cần locator này?
   * - Negative testing: kiểm tra hệ thống phản ứng đúng khi dữ liệu không hợp lệ.
   * - Tương tự error message trên Login page → cùng pattern, cùng data-test attribute.
   */
  readonly errorMessage: Locator;

  // --- STEP 2: TỔNG QUAN ĐƠN HÀNG (Overview) ---

  /**
   * Tiêu đề trang (dùng chung cho cả 3 bước).
   * Step 1: "Checkout: Your Information"
   * Step 2: "Checkout: Overview"
   * Step 3: "Checkout: Complete!"
   */
  readonly title: Locator;

  /** Danh sách sản phẩm trong đơn hàng (ở trang Overview) */
  readonly checkoutItems: Locator;

  /**
   * Tổng tiền hàng (chưa bao gồm thuế).
   * Ví dụ: "Item total: $49.98"
   */
  readonly subtotalLabel: Locator;

  /**
   * Thuế (Tax).
   * Ví dụ: "Tax: $4.00"
   */
  readonly taxLabel: Locator;

  /**
   * TỔNG TIỀN CUỐI CÙNG (bao gồm thuế).
   * Ví dụ: "Total: $53.98"
   *
   * TẠI SAO cần kiểm tra tổng tiền?
   * - Đây là giá trị QUAN TRỌNG NHẤT trong quy trình thanh toán.
   * - Phải xác minh: Total = Subtotal + Tax (tính toán đúng).
   * - Lỗi tính toán giá là lỗi nghiêm trọng (critical bug) trong ứng dụng thương mại điện tử.
   */
  readonly totalLabel: Locator;

  /** Nút "Finish" - hoàn tất đơn hàng (chỉ ở Step 2). */
  readonly finishButton: Locator;

  // --- STEP 3: HOÀN TẤT ĐƠN HÀNG (Complete) ---

  /**
   * Tiêu đề xác nhận "Thank you for your order!"
   * Đây là indicator cuối cùng cho biết toàn bộ E2E flow thành công.
   */
  readonly completeHeader: Locator;

  /**
   * Mô tả bổ sung sau khi đặt hàng thành công.
   * Ví dụ: "Your order has been dispatched..."
   */
  readonly completeText: Locator;

  /** Nút "Back Home" - quay về trang Inventory sau khi đặt hàng xong. */
  readonly backHomeButton: Locator;

  // ========================================================================
  // CONSTRUCTOR
  // ========================================================================

  constructor(page: Page) {
    this.page = page;

    // --- Step 1 locators ---
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // --- Step 2 locators ---
    this.title = page.locator('[data-test="title"]');
    this.checkoutItems = page.locator('[data-test="inventory-item"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');

    // --- Step 3 locators ---
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  // ========================================================================
  // METHODS - STEP 1: NHẬP THÔNG TIN KHÁCH HÀNG
  // ========================================================================

  /**
   * Điền thông tin khách hàng vào form Checkout Step 1.
   *
   * TẠI SAO gộp 3 field vào 1 method duy nhất?
   * - Trong quy trình thực tế, 3 field này LUÔN được điền cùng lúc.
   * - Giảm số dòng code trong test file → test dễ đọc hơn.
   * - Nếu cần test từng field riêng (negative test), ta vẫn có thể truyền chuỗi rỗng.
   *
   * @param firstName - Tên khách hàng
   * @param lastName  - Họ khách hàng
   * @param postalCode - Mã bưu chính
   */
  async fillCustomerInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Nhấn nút "Continue" để chuyển từ Step 1 → Step 2.
   *
   * TẠI SAO tách riêng thay vì gộp vào fillCustomerInformation()?
   * - Trong negative test, ta cần ĐIỀN thiếu thông tin rồi NHẤN Continue để kiểm tra lỗi.
   * - Nếu gộp lại, không thể test trường hợp "nhấn Continue khi chưa điền đủ".
   * - Nguyên tắc: mỗi method thực hiện MỘT hành động duy nhất (Single Responsibility).
   */
  async clickContinue() {
    await this.continueButton.click();
  }

  /**
   * Nhấn nút "Cancel" để hủy checkout.
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Lấy nội dung thông báo lỗi validation.
   * Dùng cho negative test (ví dụ: không nhập First Name).
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  // ========================================================================
  // METHODS - STEP 2: TỔNG QUAN ĐƠN HÀNG (OVERVIEW)
  // ========================================================================

  /**
   * Lấy tiêu đề của trang hiện tại.
   * Dùng để xác nhận đang ở đúng bước trong quy trình checkout.
   */
  async getTitle(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Lấy tên tất cả sản phẩm trong đơn hàng (trang Overview).
   *
   * TẠI SAO cần kiểm tra lại sản phẩm ở trang Overview?
   * - Xác minh dữ liệu KHÔNG BỊ MẤT khi chuyển giữa các bước của checkout.
   * - Đây là một dạng "data integrity test" - kiểm tra tính toàn vẹn dữ liệu.
   */
  async getCheckoutItemNames(): Promise<string[]> {
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  /**
   * Lấy giá trị Subtotal (tổng tiền hàng chưa thuế).
   * Trả về text đầy đủ, ví dụ: "Item total: $49.98"
   */
  async getSubtotal(): Promise<string> {
    return (await this.subtotalLabel.textContent()) ?? '';
  }

  /**
   * Lấy giá trị Tax (thuế).
   * Trả về text đầy đủ, ví dụ: "Tax: $4.00"
   */
  async getTax(): Promise<string> {
    return (await this.taxLabel.textContent()) ?? '';
  }

  /**
   * Lấy giá trị Total (tổng tiền cuối cùng bao gồm thuế).
   * Trả về text đầy đủ, ví dụ: "Total: $53.98"
   */
  async getTotal(): Promise<string> {
    return (await this.totalLabel.textContent()) ?? '';
  }

  /**
   * Trích xuất giá trị SỐ từ chuỗi giá.
   * Ví dụ: "Item total: $49.98" → 49.98
   *
   * TẠI SAO cần method tiện ích này?
   * - Để so sánh toán học: Subtotal + Tax = Total.
   * - Không thể so sánh chuỗi "$49.98" + "$4.00" = "$53.98" bằng phép cộng string.
   * - parseFloat() chuyển chuỗi thành số thập phân → có thể tính toán.
   *
   * @param priceText - Chuỗi chứa giá (ví dụ: "Item total: $49.98")
   * @returns Giá trị số (ví dụ: 49.98)
   */
  extractPriceValue(priceText: string): number {
    // Regex tìm pattern số thập phân sau ký tự $
    // Ví dụ: "Item total: $49.98" → match "$49.98" → group "49.98"
    const match = priceText.match(/\$(\d+\.\d{2})/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Nhấn nút "Finish" để hoàn tất đơn hàng (chuyển từ Step 2 → Step 3).
   */
  async clickFinish() {
    await this.finishButton.click();
  }

  // ========================================================================
  // METHODS - STEP 3: HOÀN TẤT ĐƠN HÀNG (COMPLETE)
  // ========================================================================

  /**
   * Lấy tiêu đề xác nhận đặt hàng thành công.
   * Kỳ vọng: "Thank you for your order!"
   */
  async getCompleteHeaderText(): Promise<string> {
    return (await this.completeHeader.textContent()) ?? '';
  }

  /**
   * Lấy mô tả bổ sung sau khi đặt hàng thành công.
   */
  async getCompleteText(): Promise<string> {
    return (await this.completeText.textContent()) ?? '';
  }

  /**
   * Nhấn nút "Back Home" để quay về trang Inventory.
   */
  async clickBackHome() {
    await this.backHomeButton.click();
  }
}
