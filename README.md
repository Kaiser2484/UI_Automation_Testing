# 🛒 UI Automation Testing — AutomationExercise.com (Enterprise Regression Framework)

Bộ framework kiểm thử tự động **E2E Regression Suite** cấp độ doanh nghiệp, bao phủ **đầy đủ 26 Test Cases chính thức** của nền tảng thương mại điện tử **[AutomationExercise.com](https://automationexercise.com/)**, kết hợp các kỹ thuật kiểm thử nâng cao vượt bậc.

Dự án được xây dựng bằng **Playwright** và **TypeScript**, tuân thủ nghiêm ngặt mô hình **Page Object Model (POM)** kết hợp **B1 Custom Fixtures**, phục vụ báo cáo Đồ án môn học **"Đảm bảo Chất lượng Phần mềm (SQA)"** và chứng minh năng lực kiểm thử đạt tiêu chuẩn quốc tế **ISO/IEC 25010**.

---

## 🛠️ Tính Năng SQA Nâng Cao Đã Tích Hợp

### 1. 🔑 Functional Testing E2E (Xác thực & Thanh toán)
- Đầy đủ luồng nghiệp vụ phức tạp: Đăng nhập/Đăng ký với dynamic email (tránh trùng lặp DB), Thêm sản phẩm, Checkout so khớp địa chỉ giao hàng và thanh toán, Điền thẻ tín dụng, Tải hóa đơn PDF thực tế.

### 2. 🧩 B1 (Custom Fixtures) — Đỉnh cao kiến trúc POM
- Loại bỏ hoàn toàn 100% boilerplate code (`beforeEach` chứa `new PageObject(page)`) ở tất cả các file spec.
- Khởi tạo tự động tất cả 8 Page Objects thông qua tệp [pom-fixture.ts](file:///c:/PKA/DGKDPM/UI_Automation_Testing/fixtures/pom-fixture.ts).
- Cho phép destruct trực tiếp các trang cần dùng làm tham số của test case.
  ```typescript
  import { test } from '../fixtures/pom-fixture';
  test('TC', async ({ homePage, productsPage, cartPage }) => {
     await homePage.goto();
     ...
  });
  ```

### 3. 📊 Data-Driven Testing (DDT) — Kiểm thử hướng dữ liệu
- Tách biệt hoàn toàn mã kiểm thử khỏi dữ liệu đầu vào thông qua tệp [data_driven.spec.ts](file:///c:/PKA/DGKDPM/UI_Automation_Testing/tests/data_driven.spec.ts).
- Vòng lặp động chạy tự động với các danh sách từ khóa tìm kiếm (`['Blue Top', 'Men Tshirt', 'Sleeveless']`) và nhiều bộ dữ liệu biểu mẫu liên hệ (`Contact Submissions`).

### 4. 👁️ Visual Regression Testing (VRT) — So khớp giao diện
- Triển khai VRT trong [visual_regression.spec.ts](file:///c:/PKA/DGKDPM/UI_Automation_Testing/tests/visual_regression.spec.ts) sử dụng API `toHaveScreenshot()` của Playwright.
- So khớp pixel-by-pixel đối với các cụm giao diện tĩnh (Brand Logo ở Header, Get in touch Title) để tránh flaky do Ads và Carousel, đồng thời kiểm soát chất lượng UI hoàn hảo.

### 5. ⚡ Performance Testing (Web Vitals & CDP)
- Đo lường và kiểm soát các chỉ số tải trang chuẩn Google qua tệp [performance.spec.ts](file:///c:/PKA/DGKDPM/UI_Automation_Testing/tests/performance.spec.ts):
  - **TTFB (Time to First Byte)**, **DOM Interactive**, và **Total Page Load Time**.
  - Kết nối trực tiếp đến Chrome DevTools Protocol (CDP) session để phân tích **JS Heap Size (RAM)** nhằm phát hiện Memory Leak, và kiểm soát số lượng thẻ **DOM Nodes** thực tế.
  - Áp dụng các ngưỡng SLA cam kết chuẩn ISO/IEC 25010.

### 6. 🌐 Multi-browser (Chromium + Firefox)
- Cấu hình chạy song song và độc lập trên cả **Chromium (Chrome)** và **Firefox** trong [playwright.config.ts](file:///c:/PKA/DGKDPM/UI_Automation_Testing/playwright.config.ts).
- Vượt qua kiểm soát bot của Cloudflare bằng real User-Agent cho cả hai trình duyệt.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
UI_Automation_Testing/
├── fixtures/                   # Custom Fixtures (B1 - POM Nâng Cao)
│   └── pom-fixture.ts          # Định nghĩa và tự động hóa khởi tạo POM
│
├── pages/                      # Page Object Model (POM) classes
│   ├── HomePage.ts             # Trang chủ (navbar, ad dismissal, scrolls)
│   ├── LoginPage.ts            # Trang đăng nhập & đăng ký tài khoản chi tiết
│   ├── ProductsPage.ts         # Trang sản phẩm (lọc, tìm kiếm, đánh giá, recommended)
│   ├── CartPage.ts             # Trang giỏ hàng (xử lý bảng giỏ hàng, xóa, checkout)
│   ├── CheckoutPage.ts         # Trang checkout (địa chỉ, review đơn hàng)
│   ├── ContactUsPage.ts        # Trang liên hệ (điền form, alert handling)
│   ├── TestCasesPage.ts        # Trang Test Cases (xác minh layout)
│   └── PaymentPage.ts          # Trang thanh toán (thẻ tín dụng, tải hóa đơn PDF)
│
├── tests/                      # Thư mục chứa kịch bản kiểm thử (spec files)
│   ├── auth_register.spec.ts   # TC 1 - 5 (Xác thực & Đăng ký - POM Fixture)
│   ├── contact_infopages.spec.ts# TC 6 - 7 (Liên hệ & Info pages - POM Fixture)
│   ├── products_search.spec.ts # TC 8, 9, 18, 19, 21 (Tìm kiếm & Bộ lọc - POM Fixture)
│   ├── cart_checkout.spec.ts   # TC 12 - 17, 20, 22 - 24 (Thanh toán & Giỏ hàng - POM Fixture)
│   ├── ui_navigation.spec.ts   # TC 10, 11, 25, 26 (Tiện ích & Scroll - POM Fixture)
│   ├── data_driven.spec.ts     # DDT (Tìm kiếm động & Form Submissions)
│   ├── visual_regression.spec.ts# VRT (So khớp trực quan Header Logo & Contact Title)
│   └── performance.spec.ts     # Performance (Đo Web Vitals & CDP RAM/DOM Node count)
│
├── playwright-report/          # Báo cáo kiểm thử HTML tự động
├── test-results/               # Ảnh chụp & video khi test thất bại
├── playwright.config.ts        # Cấu hình Playwright (Đa trình duyệt, timeouts)
└── package.json                # NPM scripts chạy test
```

---

## ⚙️ Hướng Dẫn Cài Đặt

### Bước 1 — Cài đặt dependencies
```bash
npm install
```

### Bước 2 — Cài đặt các trình duyệt Playwright
```bash
npx playwright install
```

---

## 🚀 Các Lệnh Khởi Chạy Kiểm Thử (NPM Scripts)

Tôi đã thiết lập các câu lệnh chạy tối ưu trong `package.json`:

```bash
# 1. Chạy toàn bộ 26 Test Cases E2E Regression + 3 bộ nâng cao (DDT, VRT, Performance)
npx playwright test

# 2. Chạy toàn bộ kiểm thử có hiển thị trình duyệt (Headed Mode)
npx playwright test --headed

# 3. Chạy kiểm thử trên một trình duyệt chỉ định
npx playwright test --project=chromium
npx playwright test --project=firefox

# 4. Chạy riêng bộ kiểm thử Nâng Cao cụ thể
npx playwright test tests/data_driven.spec.ts       # Chạy Data-Driven Testing
npx playwright test tests/visual_regression.spec.ts # Chạy Visual Regression Testing
npx playwright test tests/performance.spec.ts       # Chạy Performance Testing

# 5. Khởi tạo / Cập nhật ảnh VRT mẫu (Golden Master)
npx playwright test tests/visual_regression.spec.ts --update-snapshots

# 6. Xem báo cáo kiểm thử HTML sinh động
npm run test:report
```
