# 🚀 UI Automation Testing Project - Đồ Án Đảm Bảo Chất Lượng Phần Mềm (SQA)

Dự án này là một Framework kiểm thử tự động toàn diện được phát triển bằng **Playwright** và **TypeScript**. Framework được xây dựng theo mô hình **Page Object Model (POM)** để kiểm thử trang web thương mại điện tử mẫu: [SauceDemo](https://www.saucedemo.com/).

Dự án này được thiết kế để minh chứng cho các khái niệm và kỹ thuật kiểm thử phần mềm nâng cao trong môi trường học thuật.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Core Framework:** [Playwright](https://playwright.dev/)
- **Thiết kế kiến trúc:** Page Object Model (POM)
- **Kiểm thử phi chức năng:** [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) & `playwright-lighthouse`

---

## 🎯 Các Phạm Vi Kiểm Thử Đã Triển Khai

Framework này kết hợp cả **Kiểm thử Chức năng** và **Kiểm thử Phi Chức năng** để đảm bảo chất lượng hệ thống:

### 1. Functional Testing (Kiểm thử chức năng - E2E)

- **Happy Paths:** Các luồng hoạt động chuẩn của người dùng (Đăng nhập → Chọn hàng → Giỏ hàng → Thanh toán thành công).
- **Negative Paths:** Kiểm tra hệ thống xử lý lỗi như thế nào (Sai mật khẩu, Bỏ trống thông tin thanh toán,...).
- **Data-Driven Testing (DDT):** Chạy cùng một kịch bản kiểm thử (Test Case) với nhiều bộ dữ liệu khác nhau (các loại user khác nhau được định nghĩa trong `data/`).

### 2. Visual Regression Testing (VRT - Kiểm thử Hồi quy Giao diện)

- Sử dụng hàm `toHaveScreenshot()` của Playwright.
- Tự động phát hiện các thay đổi không mong muốn về mặt giao diện (pixel-by-pixel).
- Xử lý các phần tử động (Dynamic Elements) bằng kỹ thuật `mask` và `networkidle` (ví dụ: tắt animation, che phủ ảnh lazy-loading).

### 3. Performance Testing (Kiểm thử Hiệu năng)

- Tích hợp **Google Lighthouse** qua giao thức Chrome DevTools Protocol (CDP).
- Tự động đánh giá các chỉ số **Performance**, **Accessibility**, **Best Practices**, và **SEO** của các trang quan trọng (Login, Inventory).
- Thiết lập các Ngưỡng chất lượng (Thresholds) để fail test nếu hệ thống không đạt điểm tiêu chuẩn.

---

## 📁 Cấu Trúc Thư Mục (Directory Structure)

```text
UI_Automation_Testing/
├── data/                       # Chứa file dữ liệu kiểm thử (JSON) cho Data-Driven Testing
├── lighthouse-reports/         # (Tự động sinh) Các file HTML báo cáo hiệu năng Lighthouse
├── pages/                      # Page Object Model (POM) classes
│   ├── LoginPage.ts            # Chứa các locators và actions cho trang Đăng nhập
│   ├── InventoryPage.ts        # Chứa locators và actions cho trang Danh sách sản phẩm
│   ├── CartPage.ts             # ...
│   └── CheckoutPage.ts         # ...
├── tests/                      # Chứa các kịch bản kiểm thử (Test Scripts)
│   ├── auth.spec.ts            # Kiểm thử luồng Đăng nhập (E2E & Data-Driven)
│   ├── checkout.spec.ts        # Kiểm thử luồng Giỏ hàng và Thanh toán
│   ├── performance.spec.ts     # Kiểm thử Hiệu năng bằng Lighthouse
│   └── visual.spec.ts          # Kiểm thử Hồi quy Giao diện (VRT)
├── tests/visual.spec.ts-snapshots/ # (Tự động sinh) Chứa ảnh Baseline chuẩn của VRT
├── playwright.config.ts        # Cấu hình Playwright (browsers, reporters, timeouts, v.v.)
└── package.json                # Quản lý dependencies và các NPM scripts (lệnh chạy)
```

---

## ⚙️ Hướng Dẫn Cài Đặt (Setup Instructions)

1. Cài đặt [Node.js](https://nodejs.org/) (phiên bản 16 trở lên).
2. Clone repository này về máy.
3. Mở terminal tại thư mục gốc của dự án và chạy lệnh sau để cài đặt các thư viện:

```bash
npm install
```

1. Cài đặt các trình duyệt Playwright cần thiết (Chromium, Firefox, WebKit):

```bash
npx playwright install
```

---

## 🚀 Các Lệnh Khởi Chạy (NPM Scripts)

Dưới đây là danh sách các lệnh đã được cấu hình sẵn trong `package.json` để bạn dễ dàng chạy test.

### 🧩 Kiểm thử Chức năng (Functional Testing)

- `npm run test` : Chạy tất cả test chạy ngầm (headless) trên mọi trình duyệt.
- `npm run test:headed` : Chạy tất cả test và **hiển thị trình duyệt UI** để quan sát.
- `npm run test:chromium` : Chỉ chạy test trên Chrome/Edge.
- `npm run test:firefox` : Chỉ chạy test trên Firefox.

### 📸 Kiểm thử Hồi quy Giao diện (Visual Regression Testing)

*(Chạy trên Chromium làm chuẩn)*

- `npm run vrt:update` : Chụp và **tạo mới / cập nhật lại** ảnh gốc (baseline) (Chạy khi mới tạo test VRT hoặc khi UI có thay đổi đúng thiết kế).
- `npm run vrt:run` : **Chạy test VRT**, chụp ảnh màn hình hiện tại và so sánh với ảnh baseline.

### ⚡ Kiểm thử Hiệu năng (Performance Testing)

- `npm run perf:run` : Chạy kiểm toán bằng Lighthouse. Lưu ý lệnh này ép buộc chạy 1 luồng (`--workers=1`) để tránh xung đột cổng mạng (port 9222) và sẽ mất khoảng 30-60 giây để thu thập dữ liệu.

### 📊 Xem Báo Cáo (Reporting)

- `npm run test:report` : Mở giao diện HTML báo cáo của Playwright (thể hiện kết quả của Test Chức năng và hình ảnh so sánh của VRT).
- **Lighthouse Reports**: Các file báo cáo HTML rất chi tiết của hiệu năng sẽ được tự động lưu trong thư mục `lighthouse-reports/`. Hãy mở trực tiếp các file này bằng trình duyệt web để xem.

---

*📝 Dự án được thực hiện nhằm phục vụ mục đích nghiên cứu và báo cáo cho Đồ án môn học "Đảm bảo chất lượng phần mềm". Các test script đều được viết kèm theo comment mang tính học thuật chi tiết.*
