/**
 * auth.spec.ts - Test Suite cho chức năng Xác Thực (Authentication)
 * ==================================================================
 *
 * File này chứa các TEST CASE (kịch bản kiểm thử) cho trang đăng nhập SauceDemo.
 *
 * NGUYÊN TẮC THIẾT KẾ:
 * 1. File test CHỈ chứa ASSERTIONS (xác nhận kết quả) → tuân thủ POM.
 * 2. Mọi thao tác UI (click, fill, goto) được gọi qua Page Object class.
 * 3. Test được tổ chức theo nhóm (describe) với cấu trúc rõ ràng:
 *    - Happy Path: Các trường hợp người dùng thao tác ĐÚNG (đăng nhập thành công).
 *    - Negative Path: Các trường hợp người dùng thao tác SAI hoặc bất thường.
 *    - Data-Driven: Dùng dữ liệu từ file JSON để chạy nhiều bộ test tự động.
 *
 * CÁCH TIẾP CẬN COVERAGE (ĐỘ PHỦ):
 * - Tương tự Branch Coverage trong Unit Testing, ta test cả nhánh "thành công"
 *   lẫn nhánh "thất bại" của mỗi chức năng.
 * - Statement Coverage: đảm bảo mọi thông báo lỗi khác nhau đều được kiểm tra.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// ============================================================================
// IMPORT DỮ LIỆU TEST TỪ FILE JSON (DATA-DRIVEN TESTING)
// ============================================================================
/**
 * TẠI SAO dùng Data-Driven Testing?
 * - Tách dữ liệu test ra khỏi logic test → dễ thêm/sửa/xóa test data
 *   mà KHÔNG cần thay đổi code test.
 * - Khi cần test thêm loại user mới (ví dụ: user bị khóa), chỉ cần thêm
 *   vào file users.json → test tự động chạy thêm mà không sửa gì ở đây.
 *
 * TẠI SAO dùng import thay vì fs.readFile()?
 * - TypeScript hỗ trợ import JSON trực tiếp (nếu bật resolveJsonModule trong tsconfig).
 * - Playwright tự xử lý import JSON → không cần cấu hình thêm.
 * - Import là static → lỗi sẽ được phát hiện ngay lúc compile, không chờ đến runtime.
 */
import users from '../data/users.json';

// ============================================================================
// HAPPY PATH TESTS - Các trường hợp ĐÚNG (Positive Testing)
// ============================================================================
/**
 * test.describe() nhóm các test có liên quan lại với nhau.
 * TẠI SAO nhóm theo Happy/Negative?
 * - Dễ đọc báo cáo: biết ngay nhóm nào pass/fail.
 * - Dễ chạy riêng từng nhóm: npx playwright test --grep "Happy Path"
 */
test.describe('Đăng Nhập - Happy Path (Trường hợp đúng)', () => {
  /**
   * TEST CASE 1: Đăng nhập thành công với tài khoản hợp lệ.
   *
   * KỊCH BẢN:
   * 1. Mở trang Login.
   * 2. Nhập username và password hợp lệ (từ file JSON).
   * 3. Nhấn nút Login.
   * 4. XÁC NHẬN: URL chuyển sang /inventory.html.
   * 5. XÁC NHẬN: Tiêu đề trang là "Products".
   *
   * ĐÂY LÀ NHÁNH "TRUE" của điều kiện đăng nhập → tương tự Branch Coverage.
   */
  test('TC-01: Đăng nhập thành công và chuyển đến trang Inventory', async ({ page }) => {
    // Khởi tạo Page Objects
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Bước 1: Mở trang đăng nhập
    await loginPage.goto();

    // Bước 2-3: Thực hiện đăng nhập với dữ liệu hợp lệ từ file JSON
    await loginPage.login(users.validUser.username, users.validUser.password);

    // === ASSERTIONS (XÁC NHẬN KẾT QUẢ) ===

    // Xác nhận URL đã chuyển sang trang inventory
    // toHaveURL() tự đợi URL thay đổi (auto-waiting) → không cần waitForURL() riêng.
    await expect(page).toHaveURL(/.*inventory.html/);

    // Xác nhận tiêu đề trang hiển thị "Products"
    // toBeVisible() kiểm tra phần tử có hiển thị trên viewport không.
    await expect(inventoryPage.title).toBeVisible();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  /**
   * TEST CASE 2: Sau khi đăng nhập, trang Inventory hiển thị danh sách sản phẩm.
   *
   * TẠI SAO cần test riêng?
   * - TC-01 chỉ kiểm tra "có vào được trang Inventory không".
   * - TC-02 kiểm tra sâu hơn: "trang Inventory có HIỂN THỊ ĐÚNG NỘI DUNG không".
   * - Đây là nguyên tắc: một test chỉ nên kiểm tra MỘT khía cạnh (Single Responsibility).
   */
  test('TC-02: Trang Inventory hiển thị danh sách sản phẩm', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);

    // Đợi đến khi URL đã chuyển sang inventory (precondition cho assertion tiếp theo)
    await expect(page).toHaveURL(/.*inventory.html/);

    // Xác nhận có sản phẩm hiển thị trên trang (SauceDemo có 6 sản phẩm mặc định)
    // toBeGreaterThan(0): chỉ cần có ÍT NHẤT 1 sản phẩm → test không bị phụ thuộc vào số chính xác.
    const itemCount = await inventoryPage.getInventoryItemCount();
    expect(itemCount).toBeGreaterThan(0);

    // Xác nhận chính xác có 6 sản phẩm (giá trị cụ thể của SauceDemo)
    expect(itemCount).toBe(6);
  });

  /**
   * TEST CASE 3: Đăng xuất thành công quay về trang Login.
   *
   * TẠI SAO cần test Logout?
   * - Đăng xuất là một chức năng quan trọng liên quan đến bảo mật.
   * - Phải đảm bảo session bị hủy và người dùng quay về trang Login.
   */
  test('TC-03: Đăng xuất thành công và quay về trang Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Precondition: Đăng nhập trước
    await loginPage.goto();
    await loginPage.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/.*inventory.html/);

    // Thực hiện đăng xuất
    await inventoryPage.logout();

    // Xác nhận đã quay về trang Login (URL không còn chứa 'inventory')
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Xác nhận ô nhập username hiển thị (chứng tỏ đang ở trang Login)
    await expect(loginPage.usernameInput).toBeVisible();
  });
});

// ============================================================================
// NEGATIVE PATH TESTS - Các trường hợp SAI (Negative Testing)
// ============================================================================
/**
 * Negative Testing là gì?
 * - Kiểm tra hệ thống phản ứng đúng khi nhận đầu vào KHÔNG HỢP LỆ.
 * - Mục tiêu: đảm bảo ứng dụng KHÔNG crash, hiển thị thông báo lỗi rõ ràng.
 * - Tương tự nhánh "FALSE/ELSE" trong Branch Coverage.
 */
test.describe('Đăng Nhập - Negative Path (Trường hợp sai)', () => {
  /**
   * TEST CASE 4: Đăng nhập với tài khoản không tồn tại.
   *
   * NHÁNH TEST: username sai + password sai → hệ thống phải từ chối.
   */
  test('TC-04: Đăng nhập thất bại với tài khoản không hợp lệ', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Dùng dữ liệu invalidUser từ file JSON
    await loginPage.login(users.invalidUser.username, users.invalidUser.password);

    // Xác nhận thông báo lỗi hiển thị
    await expect(loginPage.errorMessage).toBeVisible();

    // Xác nhận NỘI DUNG thông báo lỗi chính xác (lấy từ file JSON)
    // TẠI SAO kiểm tra nội dung chính xác? Vì đây là kiểm tra Statement Coverage:
    // đảm bảo hệ thống trả về ĐÚNG message cho ĐÚNG loại lỗi.
    await expect(loginPage.errorMessage).toHaveText(users.invalidUser.expectedError);

    // Xác nhận vẫn ở trang Login (KHÔNG bị chuyển trang)
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  /**
   * TEST CASE 5: Đăng nhập với tài khoản bị khóa (locked_out_user).
   *
   * TẠI SAO cần test case riêng?
   * - Đây là một NHÁNH LỖI KHÁC (khác với "sai mật khẩu").
   * - Hệ thống cần hiển thị thông báo lỗi KHÁC BIỆT → kiểm tra phân biệt lỗi.
   * - Tăng Branch Coverage: mỗi loại lỗi là một nhánh cần được test.
   */
  test('TC-05: Đăng nhập thất bại với tài khoản bị khóa', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.lockedUser.username, users.lockedUser.password);

    // Xác nhận thông báo lỗi hiển thị
    await expect(loginPage.errorMessage).toBeVisible();

    // Xác nhận nội dung lỗi khác với TC-04 (lỗi "locked out" thay vì "do not match")
    await expect(loginPage.errorMessage).toHaveText(users.lockedUser.expectedError);
  });

  /**
   * TEST CASE 6: Đăng nhập khi để trống cả username và password.
   *
   * NHÁNH TEST: Không nhập gì → kiểm tra validation phía client.
   * Đây là edge case (trường hợp biên) quan trọng.
   */
  test('TC-06: Đăng nhập thất bại khi để trống cả username và password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Gọi login với chuỗi rỗng → mô phỏng người dùng nhấn Login mà không nhập gì
    await loginPage.login('', '');

    // Xác nhận thông báo lỗi yêu cầu nhập username
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username is required'
    );
  });

  /**
   * TEST CASE 7: Đăng nhập khi chỉ nhập username, để trống password.
   *
   * TẠI SAO cần tách riêng với TC-06?
   * - TC-06 test trường hợp "cả 2 trường trống".
   * - TC-07 test trường hợp "chỉ thiếu password" → thông báo lỗi KHÁC.
   * - Mỗi nhánh validation cần một test riêng → đảm bảo Statement Coverage.
   */
  test('TC-07: Đăng nhập thất bại khi để trống password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Chỉ nhập username, password để trống
    await loginPage.login('standard_user', '');

    // Xác nhận thông báo lỗi yêu cầu nhập password (khác với yêu cầu nhập username)
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Password is required'
    );
  });
});

// ============================================================================
// DATA-DRIVEN TESTING - Kiểm thử hướng dữ liệu
// ============================================================================
/**
 * DATA-DRIVEN TESTING LÀ GÌ?
 * - Thay vì viết test riêng cho mỗi bộ dữ liệu, ta dùng VÒNG LẶP để chạy
 *   CÙNG MỘT KỊCH BẢN TEST với NHIỀU BỘ DỮ LIỆU KHÁC NHAU.
 * - Giảm code trùng lặp (DRY principle).
 * - Dễ mở rộng: thêm dữ liệu mới vào mảng → test tự chạy thêm.
 *
 * TẠI SAO dùng mảng thay vì đọc từ file JSON?
 * - Ở đây ta dùng CẢ HAI cách để minh họa:
 *   + Mảng inline (testCredentials) để demo cách dùng mảng trực tiếp.
 *   + File JSON (users.json) đã được dùng ở các test trên.
 * - Trong thực tế, nên dùng file JSON/CSV cho dữ liệu lớn.
 */
test.describe('Đăng Nhập - Data-Driven Testing (Kiểm thử hướng dữ liệu)', () => {
  /**
   * Mảng chứa các bộ dữ liệu test.
   * Mỗi object bao gồm:
   * - description: Mô tả test case (hiển thị trong báo cáo).
   * - username, password: Dữ liệu đầu vào.
   * - shouldSucceed: Kết quả mong đợi (true = thành công, false = thất bại).
   * - expectedError: Thông báo lỗi mong đợi (nếu shouldSucceed = false).
   */
  const testCredentials = [
    {
      description: 'Tài khoản standard_user hợp lệ',
      username: 'standard_user',
      password: 'secret_sauce',
      shouldSucceed: true,
      expectedError: '',
    },
    {
      description: 'Tài khoản performance_glitch_user hợp lệ (phản hồi chậm)',
      username: 'performance_glitch_user',
      password: 'secret_sauce',
      shouldSucceed: true,
      expectedError: '',
    },
    {
      description: 'Tài khoản không tồn tại',
      username: 'fake_user',
      password: 'fake_pass',
      shouldSucceed: false,
      expectedError: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      description: 'Tài khoản bị khóa',
      username: 'locked_out_user',
      password: 'secret_sauce',
      shouldSucceed: false,
      expectedError: 'Epic sadface: Sorry, this user has been locked out.',
    },
    {
      description: 'Mật khẩu sai cho tài khoản hợp lệ',
      username: 'standard_user',
      password: 'wrong_password',
      shouldSucceed: false,
      expectedError: 'Epic sadface: Username and password do not match any user in this service',
    },
  ];

  /**
   * for...of VÀ test() TRONG VÒNG LẶP:
   * - Playwright cho phép gọi test() bên trong vòng lặp để tạo dynamic test cases.
   * - Mỗi lần lặp tạo ra MỘT test case riêng biệt trong báo cáo.
   * - Tiêu đề test bao gồm mô tả (description) để dễ phân biệt trong report.
   */
  for (const cred of testCredentials) {
    test(`DD-Test: ${cred.description}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      // Bước 1: Mở trang Login
      await loginPage.goto();

      // Bước 2: Thực hiện đăng nhập với dữ liệu từ mảng
      await loginPage.login(cred.username, cred.password);

      // Bước 3: Kiểm tra kết quả dựa trên giá trị shouldSucceed
      if (cred.shouldSucceed) {
        // --- NHÁNH THÀNH CÔNG ---
        // Xác nhận đã chuyển sang trang Inventory
        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(inventoryPage.title).toHaveText('Products');
      } else {
        // --- NHÁNH THẤT BẠI ---
        // Xác nhận thông báo lỗi hiển thị với nội dung chính xác
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(cred.expectedError);
      }
    });
  }
});
