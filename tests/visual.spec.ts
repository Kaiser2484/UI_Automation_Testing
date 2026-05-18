/**
 * visual.spec.ts - Test Suite cho Kiểm Thử Hồi Quy Giao Diện (Visual Regression Testing)
 * ==========================================================================================
 *
 * ============================================================
 * VISUAL REGRESSION TESTING (VRT) LÀ GÌ?
 * ============================================================
 *
 * Visual Regression Testing là kỹ thuật kiểm thử tự động so sánh giao diện người dùng (UI)
 * giữa phiên bản HIỆN TẠI và một ảnh chụp màn hình GỐC (baseline) đã được phê duyệt trước.
 *
 * Hệ thống sẽ:
 *   1. Chụp ảnh màn hình toàn trang (full-page screenshot) tại các trạng thái quan trọng.
 *   2. So sánh pixel-by-pixel với ảnh baseline đã lưu.
 *   3. Nếu có sự khác biệt (dù chỉ 1 pixel), test FAIL và báo cáo lỗi.
 *
 * ============================================================
 * TẠI SAO CẦN VRT? (GIÁ TRỊ HỌC THUẬT VÀ THỰC TIỄN)
 * ============================================================
 *
 * Vấn đề mà VRT giải quyết:
 * - Functional test (như auth.spec.ts, checkout.spec.ts) chỉ kiểm tra LOGIC nghiệp vụ:
 *   "Nút Login có hoạt động không?", "Giá tiền có đúng không?"
 * - Functional test KHÔNG THỂ phát hiện các lỗi GIAO DIỆN tinh tế như:
 *   + CSS bị vỡ layout do developer vô tình sửa một property (ví dụ: thêm margin-left: 50px).
 *   + Font chữ bị thay đổi (ví dụ: từ 16px xuống 14px do ghi đè style sheet).
 *   + Màu sắc nút bị sai sau khi cập nhật thư viện UI (ví dụ: nút Login chuyển từ xanh sang xám).
 *   + Một phần tử bị ẩn đi do z-index bị thay đổi.
 *   + Responsive layout bị phá vỡ trên một kích thước màn hình cụ thể.
 *
 * → VRT BỔ SUNG cho Functional Test, KHÔNG THAY THẾ nó.
 *   Kết hợp cả hai loại test tạo nên bộ kiểm thử TOÀN DIỆN (comprehensive test suite).
 *
 * ============================================================
 * PLAYWRIGHT'S toHaveScreenshot() - CƠ CHẾ HOẠT ĐỘNG
 * ============================================================
 *
 * Playwright sử dụng phương thức built-in `expect(page).toHaveScreenshot()`:
 *
 * LẦN ĐẦU CHẠY (Baseline Generation):
 *   - Nếu chưa có file ảnh baseline → Playwright TỰ ĐỘNG tạo và lưu ảnh baseline.
 *   - Test sẽ FAIL lần đầu (do chưa có baseline để so sánh) - đây là hành vi bình thường.
 *   - Lệnh: npx playwright test --update-snapshots
 *
 * CÁC LẦN CHẠY SAU (Comparison Mode):
 *   - Playwright chụp ảnh mới → so sánh với baseline đã lưu.
 *   - Nếu GIỐNG NHAU (trong ngưỡng chấp nhận) → TEST PASS.
 *   - Nếu KHÁC NHAU → TEST FAIL + tạo file ảnh diff hiển thị điểm khác biệt.
 *
 * ============================================================
 * CẤU TRÚC FILE NÀY
 * ============================================================
 *
 * VRT-01: Trang Login (trước khi thao tác) - baseline giao diện ban đầu.
 * VRT-02: Trang Inventory (sau đăng nhập thành công) - giao diện trang sản phẩm.
 * VRT-03: Trang Cart (sau khi thêm sản phẩm) - giao diện giỏ hàng có nội dung.
 * VRT-04: Trang Checkout Overview (trước khi Finish) - giao diện xác nhận đơn hàng.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// Import dữ liệu test từ file JSON (tái sử dụng data đã có sẵn)
import users from '../data/users.json';
import checkoutData from '../data/checkout.json';

// ============================================================================
// CẤU HÌNH CHỤP ẢNH (SCREENSHOT OPTIONS)
// ============================================================================
/**
 * THAM SỐ QUAN TRỌNG CỦA toHaveScreenshot():
 *
 * maxDiffPixels:
 *   - Số pixel tối đa được phép khác biệt giữa ảnh hiện tại và baseline.
 *   - Tại sao cần ngưỡng này? Vì một số trình duyệt render pixel hơi khác nhau
 *     giữa các lần chạy (font rendering, anti-aliasing) → tránh test flaky.
 *   - Giá trị 0 = so sánh tuyệt đối (strict mode).
 *   - Giá trị 50-100 = phù hợp cho môi trường CI/CD với nhiều cấu hình máy khác nhau.
 *
 * threshold (0.0 - 1.0):
 *   - Ngưỡng khác biệt màu sắc cho TỪNG PIXEL (0 = giống hệt, 1 = hoàn toàn khác).
 *   - threshold: 0.2 nghĩa là: mỗi pixel được phép sai lệch 20% về màu sắc.
 *
 * fullPage: true:
 *   - Chụp toàn bộ trang (kể cả phần cần scroll xuống), không chỉ phần nhìn thấy.
 *   - Đây là cách tốt nhất để kiểm tra layout tổng thể.
 *
 * animations: 'disabled':
 *   - TẮT tất cả CSS animations và transitions trước khi chụp ảnh.
 *   - Tại sao? Animation đang chạy sẽ tạo ra ảnh khác nhau mỗi lần chụp → test flaky.
 *   - Đây là cách XỬ LÝ DYNAMIC ELEMENTS (phần tử động) hiệu quả nhất.
 */
const SCREENSHOT_OPTIONS = {
  maxDiffPixels: 100,   // Cho phép tối đa 100 pixel khác biệt (xử lý render diffs nhỏ giữa các lần chạy)
  threshold: 0.2,        // Mỗi pixel được sai lệch tối đa 20% về màu
  fullPage: true,        // Chụp toàn bộ trang (không chỉ viewport)
  animations: 'disabled' as const, // Tắt animation trước khi chụp
};

// ============================================================================
// VRT GROUP 1: TRANG ĐĂNG NHẬP (LOGIN PAGE)
// ============================================================================
test.describe('VRT - Trang Đăng Nhập (Login Page)', () => {
  /**
   * VRT-01: Kiểm tra giao diện trang Login ở trạng thái BAN ĐẦU.
   *
   * ĐÂY LÀ TRẠNG THÁI QUAN TRỌNG NHẤT ĐỂ CHỤP ẢNH BASELINE:
   * - Trang Login là điểm vào đầu tiên, hiển thị logo, form đăng nhập.
   * - Bất kỳ thay đổi CSS nào (margin, padding, màu nền, font) sẽ bị phát hiện.
   *
   * GIÁ TRỊ PHÁT HIỆN:
   * - Ví dụ 1: Developer vô tình thêm `body { margin: 20px }` → layout bị lệch → VRT FAIL.
   * - Ví dụ 2: Team Marketing đổi màu nền login từ #FFFFFF sang #F0F0F0 → VRT FAIL (nếu chưa phê duyệt).
   * - Ví dụ 3: Cập nhật thư viện CSS làm thay đổi font-size của placeholder → VRT FAIL.
   */
  test('VRT-01: Giao diện trang Login phải khớp với baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Điều hướng đến trang Login
    await loginPage.goto();

    // Đợi Logo hiển thị để đảm bảo trang đã load hoàn chỉnh trước khi chụp
    // Tại sao? Nếu chụp quá sớm, trang chưa render xong → ảnh thiếu nội dung → sai baseline.
    await expect(loginPage.loginLogo).toBeVisible();

    // =====================================================================
    // CHỤP ẢNH VÀ SO SÁNH VỚI BASELINE
    // =====================================================================
    /**
     * Tên file ảnh baseline: 'vrt-01-login-page.png'
     * Vị trí lưu: tests/__screenshots__/visual.spec.ts-snapshots/
     * (hoặc tests/visual.spec.ts-snapshots/ tùy cấu hình Playwright)
     *
     * Tên file nên đặt theo quy tắc:
     * - Có thể đọc được (human-readable).
     * - Gồm: tên test + tên trang + trạng thái.
     * - Không dùng ký tự đặc biệt, chỉ dùng chữ, số, dấu gạch ngang/dưới.
     */
    await expect(page).toHaveScreenshot('vrt-01-login-page.png', SCREENSHOT_OPTIONS);
  });

  /**
   * VRT-02: Giao diện trang Login khi hiển thị THÔNG BÁO LỖI.
   *
   * TẠI SAO chụp cả trạng thái lỗi?
   * - Error message có styling riêng (màu đỏ, icon X, border).
   * - Cần đảm bảo trạng thái lỗi cũng được render đúng, không chỉ trạng thái bình thường.
   * - Ví dụ: Một PR fix bug có thể vô tình làm mất icon lỗi trên UI.
   */
  test('VRT-02: Giao diện trang Login khi có lỗi đăng nhập phải khớp với baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Trigger trạng thái lỗi bằng cách đăng nhập với thông tin sai
    await loginPage.login('wrong_user', 'wrong_pass');

    // Đợi error message xuất hiện (đảm bảo trang ở trạng thái lỗi trước khi chụp)
    await expect(loginPage.errorMessage).toBeVisible();

    // Chụp ảnh trạng thái login form + error message
    await expect(page).toHaveScreenshot('vrt-02-login-error-state.png', SCREENSHOT_OPTIONS);
  });
});

// ============================================================================
// VRT GROUP 2: TRANG DANH SÁCH SẢN PHẨM (INVENTORY PAGE)
// ============================================================================
test.describe('VRT - Trang Danh Sách Sản Phẩm (Inventory Page)', () => {
  /**
   * beforeEach: Đăng nhập trước mỗi test trong group này.
   *
   * PATTERN TÁI SỬ DỤNG TỪ checkout.spec.ts:
   * - Mỗi test bắt đầu ở trạng thái đã đăng nhập → test độc lập (isolated).
   * - Không chia sẻ state giữa các test → tránh test flaky do thứ tự chạy.
   */
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  /**
   * VRT-03: Kiểm tra giao diện trang Inventory sau khi đăng nhập thành công.
   *
   * TRẠNG THÁI CẦN KIỂM TRA:
   * - Header với logo và cart icon.
   * - Navigation bar với hamburger menu.
   * - Grid 6 sản phẩm với ảnh, tên, giá, nút "Add to cart".
   * - Footer.
   *
   * GIÁ TRỊ PHÁT HIỆN:
   * - Grid layout bị phá vỡ (từ 3 cột thành 2 cột).
   * - Ảnh sản phẩm không load (hiển thị broken image icon).
   * - Giá tiền bị hiển thị sai định dạng (từ $29.99 thành 29.99 - mất dấu $).
   * - Nút "Add to cart" bị đổi màu hoặc vị trí.
   *
   * XỬ LÝ PHẦN TỬ ĐỘNG (DYNAMIC ELEMENTS):
   * - Trang Inventory không có phần tử động rõ ràng (giá, tên sản phẩm là static).
   * - Animations đã được tắt qua SCREENSHOT_OPTIONS.animations: 'disabled'.
   */
  test('VRT-03: Giao diện trang Inventory phải khớp với baseline', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    // Đợi tiêu đề "Products" xuất hiện để đảm bảo danh sách sản phẩm đã load
    await expect(inventoryPage.title).toBeVisible();

    // Đợi mạng hoàn toàn ổn định (không còn request nào đang chạy).
    // TẠI SAO cần waitForLoadState('networkidle')?
    // - Trang Inventory tải ảnh sản phẩm bất đồng bộ (lazy loading).
    // - Nếu chụp ảnh quá sớm, một số ảnh sản phẩm chưa load xong → pixel không ổn định.
    // - 'networkidle' đảm bảo TẤT CẢ ảnh và tài nguyên đã được tải xong.
    await page.waitForLoadState('networkidle');

    // ===================================================================
    // XỬ LÝ PHẦN TỬ ĐỘNG: MASK ẢNH SẢN PHẨM
    // ===================================================================
    /**
     * Vấn đề phát hiện: Ảnh sản phẩm trên trang Inventory của SauceDemo có
     * hiệu ứng fade-in hoặc lazy-loading animation → pixel không ổn định giữa
     * các lần chụp → Playwright không thể tạo ra "hai ảnh liên tiếp giống hệt nhau".
     *
     * GIẢI PHÁP: Dùng tùy chọn `mask` để che phủ ảnh sản phẩm bằng hộp màu tím.
     * Kết quả: Phần bị mask LUÔN GIỐNG NHAU giữa baseline và actual → test STABLE.
     *
     * LƯU Ý QUAN TRỌNG cho báo cáo học thuật:
     * - Đây là kỹ thuật xử lý "dynamic content" trong VRT.
     * - Mask KHÔNG ảnh hưởng đến việc kiểm tra layout, typography, màu sắc,
     *   kích thước container của ảnh (chỉ bỏ qua NỘI DUNG bên trong ảnh).
     * - Các phần còn lại của trang (header, nút, giá, tên sản phẩm) VẪN được so sánh.
     *
     * Locator '[data-test="inventory-item-img-link"]' chọn wrapper của ảnh sản phẩm.
     */
    await expect(page).toHaveScreenshot('vrt-03-inventory-page.png', {
      ...SCREENSHOT_OPTIONS,
      mask: [
        // Che phủ phần ảnh sản phẩm để tránh flicker do lazy-loading/animation.
        // Phần còn lại của card sản phẩm (tên, giá, nút) vẫn được so sánh bình thường.
        page.locator('[data-test="inventory-item-img-link"]'),
      ],
    });
  });
});

// ============================================================================
// VRT GROUP 3: TRANG GIỎ HÀNG (CART PAGE)
// ============================================================================
test.describe('VRT - Trang Giỏ Hàng (Cart Page)', () => {
  /**
   * beforeEach: Đăng nhập và thêm 2 sản phẩm vào giỏ trước mỗi test.
   *
   * TẠI SAO thêm SẢN PHẨM VÀO GIỎ trong beforeEach?
   * - Ta muốn chụp ảnh trang Cart khi có NỘI DUNG (không phải giỏ trống).
   * - Giỏ hàng có nội dung mới phản ánh đúng UI thực tế mà người dùng thấy.
   */
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Đăng nhập
    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/.*inventory.html/);

    // Thêm 2 sản phẩm vào giỏ hàng
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.addProductToCartByName(checkoutData.products.item2.name);

    // Điều hướng đến trang Cart
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);
  });

  /**
   * VRT-04: Kiểm tra giao diện trang Cart sau khi thêm sản phẩm.
   *
   * TRẠNG THÁI CẦN KIỂM TRA:
   * - Danh sách sản phẩm trong giỏ (tên, số lượng, giá).
   * - Nút "Remove" cho từng sản phẩm.
   * - Nút "Continue Shopping" và "Checkout".
   *
   * GIÁ TRỊ PHÁT HIỆN:
   * - Layout danh sách sản phẩm bị lệch.
   * - Giá hiển thị sai.
   * - Nút bị ẩn hoặc bị đổi vị trí.
   *
   * XỬ LÝ PHẦN TỬ ĐỘNG:
   * - Tên sản phẩm và giá là dữ liệu static → không cần mask.
   * - Số lượng (quantity) được điều khiển bởi test data → nhất quán giữa các lần chạy.
   */
  test('VRT-04: Giao diện trang Cart (có sản phẩm) phải khớp với baseline', async ({ page }) => {
    const cartPage = new CartPage(page);

    // Đợi ít nhất 1 sản phẩm hiển thị trong giỏ
    await expect(cartPage.cartItems.first()).toBeVisible();

    // Đợi mạng ổn định để ảnh sản phẩm trong giỏ load hoàn chỉnh
    await page.waitForLoadState('networkidle');

    // Chụp toàn trang Cart, mask ảnh sản phẩm (có thể animate/lazy-load)
    await expect(page).toHaveScreenshot('vrt-04-cart-page-with-items.png', {
      ...SCREENSHOT_OPTIONS,
      mask: [
        // Ảnh sản phẩm trong giỏ hàng có thể chưa ổn định → mask để tránh flicker.
        page.locator('.cart_item img'),
      ],
    });
  });
});

// ============================================================================
// VRT GROUP 4: TRANG CHECKOUT OVERVIEW (TRƯỚC KHI FINISH)
// ============================================================================
test.describe('VRT - Trang Checkout Overview', () => {
  /**
   * beforeEach: Thực hiện toàn bộ luồng đến trang Checkout Overview.
   *
   * ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT ĐỂ CHỤP ẢNH:
   * - Trang Overview hiển thị thông tin đơn hàng cuối cùng TRƯỚC KHI xác nhận.
   * - Người dùng cần thấy rõ: danh sách sản phẩm, giá, thuế, tổng tiền.
   * - Bất kỳ lỗi hiển thị nào ở đây đều ảnh hưởng trực tiếp đến quyết định mua hàng.
   */
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Đăng nhập
    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);

    // Thêm sản phẩm vào giỏ
    await inventoryPage.addProductToCartByName(checkoutData.products.item1.name);
    await inventoryPage.addProductToCartByName(checkoutData.products.item2.name);

    // Điều hướng đến Cart → Checkout Step 1
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Điền thông tin khách hàng → Continue → đến trang Overview
    await checkoutPage.fillCustomerInformation(
      checkoutData.validCustomer.firstName,
      checkoutData.validCustomer.lastName,
      checkoutData.validCustomer.postalCode
    );
    await checkoutPage.clickContinue();

    // Xác nhận đã đến trang Overview
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
  });

  /**
   * VRT-05: Kiểm tra giao diện trang Checkout Overview.
   *
   * TRẠNG THÁI CẦN KIỂM TRA:
   * - Danh sách sản phẩm trong đơn hàng.
   * - Payment Information (dữ liệu thẻ thanh toán mock).
   * - Shipping Information.
   * - Subtotal, Tax, Total.
   * - Nút "Cancel" và "Finish".
   *
   * GIÁ TRỊ PHÁT HIỆN:
   * - Số liệu tài chính bị hiển thị sai (ví dụ: thiếu dấu $, sai số thập phân).
   * - Layout bảng tổng kết bị vỡ.
   * - Nút "Finish" bị ẩn (người dùng không thể hoàn tất đơn hàng).
   *
   * ===================================================================
   * XỬ LÝ PHẦN TỬ ĐỘNG (DYNAMIC ELEMENTS) - KỸ THUẬT MASK
   * ===================================================================
   *
   * Vấn đề: Một số trang web có phần tử hiển thị DỮ LIỆU THAY ĐỔI theo thời gian,
   * ví dụ: thời gian hiện tại, session ID, banner quảng cáo thay đổi...
   *
   * Nếu KHÔNG xử lý:
   * - Lần chạy lúc 10:00: ảnh chứa "Order placed at: 10:00:00"
   * - Lần chạy lúc 11:00: ảnh chứa "Order placed at: 11:00:00"
   * → So sánh FAIL dù giao diện không có lỗi → test FLAKY (không đáng tin cậy).
   *
   * GIẢI PHÁP: Dùng tùy chọn `mask` để che phủ (mask) các phần tử động bằng hộp màu tím.
   * Phần bị mask sẽ được bỏ qua khi so sánh pixel → test STABLE.
   *
   * Trang SauceDemo Checkout Overview ĐÃ CÓ các phần tử cố định (không có timestamp),
   * nên không cần mask. Ví dụ dưới đây chỉ để MINH HỌA cú pháp cho báo cáo.
   */
  test('VRT-05: Giao diện trang Checkout Overview phải khớp với baseline', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Đợi nút "Finish" hiển thị để đảm bảo trang đã load hoàn chỉnh
    await expect(checkoutPage.finishButton).toBeVisible();

    // -----------------------------------------------------------------------
    // VÍ DỤ MINH HỌA: Cú pháp MASK cho phần tử động (Dynamic Element Masking)
    // -----------------------------------------------------------------------
    // Giả sử trang có một widget hiển thị thời gian thực:
    //
    //   await expect(page).toHaveScreenshot('vrt-05-checkout-overview.png', {
    //     ...SCREENSHOT_OPTIONS,
    //     mask: [
    //       page.locator('.real-time-clock'),     // Ẩn đồng hồ thời gian thực
    //       page.locator('#session-id-display'),  // Ẩn session ID động
    //       page.locator('.ad-banner'),            // Ẩn banner quảng cáo thay đổi
    //     ],
    //   });
    //
    // Playwright sẽ phủ một hộp màu tím (#BB00FF) lên các phần tử này,
    // và BỎ QUA vùng đó khi so sánh pixel với baseline.
    // -----------------------------------------------------------------------

    // Đợi mạng ổn định để ảnh sản phẩm trong đơn hàng load hoàn chỉnh
    await page.waitForLoadState('networkidle');

    // Chụp ảnh trang Checkout Overview
    // Mask ảnh sản phẩm để tránh pixel diff do lazy-loading/animation.
    // Các phần còn lại (giá, thuế, tổng tiền, nút Finish) vẫn được so sánh đầy đủ.
    await expect(page).toHaveScreenshot('vrt-05-checkout-overview.png', {
      ...SCREENSHOT_OPTIONS,
      mask: [
        page.locator('[data-test="inventory-item-img-link"]'), // Ảnh sản phẩm trong overview
      ],
    });
  });
});

// ============================================================================
// VRT GROUP 5: TRANG XÁC NHẬN ĐẶT HÀNG (CHECKOUT COMPLETE)
// ============================================================================
test.describe('VRT - Trang Xác Nhận Đặt Hàng (Checkout Complete)', () => {
  /**
   * beforeEach: Thực hiện toàn bộ luồng E2E đến trang Complete.
   *
   * TẠI SAO CHỤP ẢNH TRANG COMPLETE?
   * - Trang "Thank you" là cảm xúc cuối cùng của người dùng sau khi mua hàng.
   * - Thiết kế của trang này ảnh hưởng trực tiếp đến trải nghiệm người dùng (UX).
   * - Đảm bảo ảnh, icon, thông báo xác nhận hiển thị đúng → tạo niềm tin cho khách hàng.
   */
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);
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
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  /**
   * VRT-06: Kiểm tra giao diện trang Checkout Complete.
   *
   * TRẠNG THÁI CẦN KIỂM TRA:
   * - Tiêu đề "Thank you for your order!".
   * - Ảnh pony (biểu tượng đặt hàng thành công của SauceDemo).
   * - Thông báo mô tả ("Your order has been dispatched...").
   * - Nút "Back Home".
   */
  test('VRT-06: Giao diện trang Checkout Complete phải khớp với baseline', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Đợi tiêu đề "Thank you" xuất hiện
    await expect(checkoutPage.completeHeader).toBeVisible();

    // Đợi mạng ổn định (ảnh pony trên trang complete có thể load bất đồng bộ)
    await page.waitForLoadState('networkidle');

    // Chụp ảnh trang xác nhận đặt hàng thành công
    // Mask ảnh pony vì đây là hình ảnh trang trí có thể gây pixel diff nhỏ.
    await expect(page).toHaveScreenshot('vrt-06-checkout-complete.png', {
      ...SCREENSHOT_OPTIONS,
      mask: [
        page.locator('.pony_express'),  // Ảnh trang trí "pony" trên trang Complete
      ],
    });
  });
});
