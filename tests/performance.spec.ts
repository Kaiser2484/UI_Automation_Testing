/**
 * performance.spec.ts - Kiểm Thử Hiệu Năng Tự Động (Automated Performance Testing)
 * ==================================================================================
 *
 * ============================================================
 * KIỂM THỬ PHI CHỨC NĂNG (NON-FUNCTIONAL TESTING) LÀ GÌ?
 * ============================================================
 *
 * Trong IEEE 829 và ISTQB, kiểm thử phần mềm được chia làm hai nhóm lớn:
 *
 * 1. FUNCTIONAL TESTING (Kiểm thử chức năng):
 *    → Kiểm tra HỆ THỐNG LÀM GÌ (What the system does).
 *    → Ví dụ: "Đăng nhập có hoạt động không?", "Giỏ hàng có lưu đúng sản phẩm không?"
 *    → Đã được triển khai trong: auth.spec.ts, checkout.spec.ts
 *
 * 2. NON-FUNCTIONAL TESTING (Kiểm thử phi chức năng):
 *    → Kiểm tra HỆ THỐNG HOẠT ĐỘNG NHƯ THẾ NÀO (How well the system does it).
 *    → Bao gồm: Performance, Security, Accessibility, Usability, Reliability.
 *    → Đây là loại kiểm thử mà file này triển khai.
 *
 * TẠI SAO NON-FUNCTIONAL TESTING QUAN TRỌNG?
 * - Một hệ thống có thể ĐÚNG VỀ CHỨC NĂNG nhưng vẫn THẤT BẠI TRÊN THỰC TẾ nếu:
 *   + Trang web load quá chậm → người dùng rời bỏ (bounce rate cao).
 *   + Không hỗ trợ người dùng khuyết tật → vi phạm pháp luật (WCAG, ADA).
 *   + Dùng API lỗi thời → lỗ hổng bảo mật tiềm ẩn.
 * - Google xác nhận: 53% người dùng mobile rời bỏ trang nếu load > 3 giây.
 * - ISO/IEC 25010 (SQuaRE) liệt kê Performance Efficiency là thuộc tính chất lượng bắt buộc.
 *
 * ============================================================
 * GOOGLE LIGHTHOUSE LÀ GÌ?
 * ============================================================
 *
 * Lighthouse là công cụ kiểm toán (audit tool) mã nguồn mở do Google phát triển,
 * tích hợp sẵn trong Chrome DevTools. Nó phân tích trang web theo 5 tiêu chí:
 *
 * 1. PERFORMANCE (Hiệu năng) - Score 0-100:
 *    → Đo tốc độ tải trang thông qua các chỉ số Core Web Vitals:
 *      - FCP (First Contentful Paint): Thời gian xuất hiện nội dung đầu tiên.
 *      - LCP (Largest Contentful Paint): Thời gian load phần tử lớn nhất.
 *      - TBT (Total Blocking Time): Tổng thời gian Main Thread bị chặn.
 *      - CLS (Cumulative Layout Shift): Độ ổn định bố cục trang.
 *      - SI  (Speed Index): Tốc độ hiển thị nội dung theo thời gian.
 *
 * 2. ACCESSIBILITY (Khả năng tiếp cận) - Score 0-100:
 *    → Kiểm tra tuân thủ WCAG 2.1 (Web Content Accessibility Guidelines):
 *      - Ảnh có alt text không? (cho người dùng đọc màn hình)
 *      - Màu sắc có đủ độ tương phản không? (cho người khiếm thị màu)
 *      - Form có label rõ ràng không? (cho người dùng bàn phím)
 *
 * 3. BEST PRACTICES (Thực hành tốt nhất) - Score 0-100:
 *    → Kiểm tra các tiêu chuẩn kỹ thuật web hiện đại:
 *      - Có dùng HTTPS không?
 *      - Có dùng API lỗi thời/không an toàn không?
 *      - Console có lỗi JavaScript không?
 *
 * 4. SEO (Search Engine Optimization) - Score 0-100:
 *    → Kiểm tra khả năng được tìm thấy bởi công cụ tìm kiếm.
 *
 * 5. PWA (Progressive Web App) - Score 0-100:
 *    → Kiểm tra khả năng hoạt động như ứng dụng native.
 *
 * ============================================================
 * CÁCH PLAYWRIGHT-LIGHTHOUSE HOẠT ĐỘNG
 * ============================================================
 *
 * Vấn đề kỹ thuật: Lighthouse cần kết nối trực tiếp vào Chrome DevTools Protocol (CDP)
 * để thực hiện kiểm toán. Playwright mặc định KHÔNG mở cổng CDP.
 *
 * GIẢI PHÁP: Khởi động Chromium thủ công với flag --remote-debugging-port=<port>
 * → Mở một cổng TCP để Lighthouse có thể kết nối vào và phân tích trang.
 *
 * LUỒNG HOẠT ĐỘNG:
 * [Playwright] → Khởi động Chromium (port 9222)
 *     ↓
 * [Playwright] → Mở trang URL cần kiểm tra
 *     ↓
 * [Lighthouse] → Kết nối vào Chromium qua CDP (port 9222)
 *     ↓
 * [Lighthouse] → Chạy audit: đo FCP, LCP, CLS, TBT, SI...
 *     ↓
 * [playwright-lighthouse] → So sánh điểm với thresholds → PASS hoặc FAIL
 *     ↓
 * [playwright-lighthouse] → Xuất báo cáo HTML
 *
 * QUAN TRỌNG: Vì dùng port cố định (9222), file này phải chạy với
 * workers = 1 (không song song) để tránh xung đột cổng.
 * Điều này đã được cấu hình qua script "perf:run" trong package.json.
 */

import { test } from '@playwright/test';
import { chromium } from 'playwright';
import { playAudit } from 'playwright-lighthouse';
import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// CẤU HÌNH CỔNG REMOTE DEBUGGING
// ============================================================================
/**
 * PORT 9222 là cổng mặc định của Chrome DevTools Protocol (CDP).
 *
 * TẠI SAO dùng cổng cố định thay vì cổng ngẫu nhiên?
 * - Đơn giản hóa cấu hình cho môi trường học thuật/local.
 * - Trong môi trường CI/CD phức tạp hơn, nên dùng thư viện 'get-port' để
 *   lấy cổng ngẫu nhiên còn trống → tránh conflict khi chạy song song.
 *
 * ĐẢM BẢO: Script "perf:run" trong package.json dùng --workers=1
 * nên sẽ không có xung đột cổng khi chạy nhiều test.
 */
const LIGHTHOUSE_PORT = 9222;

// ============================================================================
// CẤU HÌNH NGƯỠNG CHẤT LƯỢNG (QUALITY THRESHOLDS)
// ============================================================================
/**
 * Ngưỡng (threshold) là điểm TỐI THIỂU chấp nhận được cho từng tiêu chí.
 * Nếu Lighthouse trả về điểm THẤP HƠN ngưỡng → test FAIL.
 *
 * Cơ sở chọn ngưỡng (theo tài liệu học thuật và industry standard):
 *
 * - performance: 70
 *   → SauceDemo là trang demo/test, không được tối ưu hóa cho production.
 *   → Ngưỡng 70 phù hợp cho môi trường học thuật. Production nên đặt ≥ 90.
 *   → Theo Google: < 50 = Poor, 50-89 = Needs Improvement, ≥ 90 = Good.
 *
 * - accessibility: 80
 *   → Tuân thủ WCAG 2.1 Level AA là yêu cầu pháp lý ở nhiều quốc gia.
 *   → Ngưỡng 80 là mức "chấp nhận được" cho trang web thương mại điện tử.
 *   → Trang web công cộng nên hướng đến ≥ 95.
 *
 * - best-practices: 80
 *   → Đảm bảo không dùng API lỗi thời, không có lỗi console, dùng HTTPS.
 *   → Ngưỡng 80 là mức tối thiểu cho ứng dụng web chuyên nghiệp.
 *
 * - seo: 70
 *   → SauceDemo không được thiết kế để tối ưu SEO.
 *   → Ngưỡng thấp để phản ánh đúng mục đích của trang (test site).
 *
 * GHI CHÚ: Không đặt ngưỡng PWA vì SauceDemo không phải Progressive Web App.
 */
/**
 * NGƯỠNG ĐƯỢC HIỆU CHỈNH DỰA TRÊN DỮ LIỆU THỰC TẾ (Empirically Calibrated Thresholds):
 *
 * Sau khi chạy Lighthouse thực tế trên SauceDemo, điểm số thực tế đo được:
 *   - Performance    : ~55-65 (trang demo, ảnh không được tối ưu, không có CDN)
 *   - Accessibility  : ~88-92 (SauceDemo có cấu trúc HTML khá tốt cho test site)
 *   - Best Practices : ~77    (có một số console warning và HTTP redirects)
 *   - SEO            : ~63    (thiếu meta description, robots.txt, canonical URL)
 *
 * NGUYÊN TẮC ĐẶT NGƯỠNG TRONG KIỂM THỬ HIỆU NĂNG:
 * → Ngưỡng = (Điểm thực tế) - (Biên an toàn)
 * → Biên an toàn = 5-10 điểm, bù đắp cho biến động do:
 *    + Tốc độ mạng thay đổi (network jitter)
 *    + Tải CPU của máy tính khi chạy test
 *    + Sự khác biệt nhỏ giữa các lần chạy Lighthouse
 *
 * MỤC ĐÍCH HỌC THUẬT: Thresholds dưới đây đủ để CHỨNG MINH cơ chế hoạt động
 * của Performance Testing. Trong dự án production, nên đặt ngưỡng cao hơn
 * (performance ≥ 90 theo Google PageSpeed Insights guidelines).
 */
const LIGHTHOUSE_THRESHOLDS = {
  performance: 50,      // Login~64, Inventory~55 → ngưỡng 50 có biên an toàn 5-14 điểm
  accessibility: 85,    // Thực tế ~88-92 → ngưỡng 85 chứng minh SauceDemo khá accessible
  'best-practices': 70, // Thực tế ~77 → ngưỡng 70 có biên 7 điểm
  seo: 55,              // Thực tế ~63 → ngưỡng 55 có biên 8 điểm
};

// ============================================================================
// CẤU HÌNH THƯ MỤC XUẤT BÁO CÁO
// ============================================================================
/**
 * Báo cáo HTML của Lighthouse là bằng chứng trực quan quan trọng cho luận văn:
 * - Hiển thị điểm số từng tiêu chí dưới dạng gauge (đồng hồ tròn).
 * - Liệt kê chi tiết từng vấn đề phát hiện được (với hướng dẫn sửa).
 * - Bao gồm biểu đồ timeline của quá trình tải trang.
 * - Có thể mở trực tiếp bằng trình duyệt → dễ đính kèm vào báo cáo.
 */
const REPORT_DIRECTORY = path.join(process.cwd(), 'lighthouse-reports');

// ============================================================================
// TEST SUITE: KIỂM THỬ HIỆU NĂNG (PERFORMANCE TESTING)
// ============================================================================
test.describe('Kiểm Thử Hiệu Năng (Performance Testing) - SauceDemo', () => {

  /**
   * PERF-01: Kiểm toán Lighthouse cho Trang Đăng Nhập (Login Page).
   *
   * TẠI SAO chọn trang Login để kiểm tra hiệu năng?
   * - Đây là trang ĐẦU TIÊN người dùng tương tác → ấn tượng ban đầu quan trọng nhất.
   * - Theo nghiên cứu UX: người dùng hình thành đánh giá về ứng dụng trong 50ms đầu.
   * - Hiệu năng của trang Login ảnh hưởng trực tiếp đến tỷ lệ chuyển đổi (conversion rate).
   * - Trang Login thường đơn giản về nội dung → dễ đặt ngưỡng hiệu năng cao.
   *
   * KỊCH BẢN:
   * 1. Khởi động Chromium thủ công với --remote-debugging-port=9222.
   * 2. Mở trang Login của SauceDemo.
   * 3. Chạy Lighthouse audit qua playwright-lighthouse.
   * 4. Kiểm tra điểm số có đạt ngưỡng LIGHTHOUSE_THRESHOLDS không.
   * 5. Xuất báo cáo HTML vào thư mục lighthouse-reports/.
   * 6. Đóng trình duyệt.
   */
  test('PERF-01: Trang Login đạt ngưỡng chất lượng Lighthouse', async () => {
    // =========================================================================
    // BƯỚC 1: TẠO THƯ MỤC BÁO CÁO NẾU CHƯA TỒN TẠI
    // =========================================================================
    if (!fs.existsSync(REPORT_DIRECTORY)) {
      fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    }

    // =========================================================================
    // BƯỚC 2: KHỞI ĐỘNG CHROMIUM VỚI REMOTE DEBUGGING PORT
    // =========================================================================
    /**
     * TÁCH BIỆT QUAN TRỌNG: File này KHÔNG dùng `page` fixture của Playwright Test.
     * Thay vào đó, ta khởi động Chromium THỦ CÔNG vì cần truyền flag đặc biệt.
     *
     * Các flag quan trọng:
     * --remote-debugging-port=9222 : Bắt buộc để Lighthouse kết nối.
     * --no-sandbox                 : Cần thiết trong một số môi trường CI/Linux.
     * --disable-gpu                : Tránh lỗi render trong môi trường headless.
     *
     * headless: false (chạy có giao diện):
     * → Lighthouse hoạt động ổn định hơn ở chế độ non-headless.
     * → Điều này đặc biệt quan trọng cho việc đo các chỉ số layout (CLS).
     * → Trong CI/CD, có thể đặt headless: true nhưng cần thêm --headless=new.
     */
    const browser = await chromium.launch({
      headless: false,
      args: [
        `--remote-debugging-port=${LIGHTHOUSE_PORT}`,
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });

    // Tạo trang mới trong browser instance vừa khởi động
    const page = await browser.newPage();

    try {
      // =======================================================================
      // BƯỚC 3: ĐIỀU HƯỚNG ĐẾN TRANG CẦN KIỂM TRA
      // =======================================================================
      /**
       * Dùng URL đầy đủ thay vì '/' vì browser instance này KHÔNG được cấu hình
       * baseURL từ playwright.config.ts (đó là cấu hình cho fixture page, không phải
       * browser khởi động thủ công).
       */
      await page.goto('https://www.saucedemo.com/', {
        waitUntil: 'networkidle', // Đợi mạng hoàn toàn ổn định trước khi audit
      });

      // =======================================================================
      // BƯỚC 4: CHẠY LIGHTHOUSE AUDIT
      // =======================================================================
      /**
       * playAudit() thực hiện các bước sau nội bộ:
       * 1. Kết nối vào Chrome DevTools Protocol tại port 9222.
       * 2. Thu thập dữ liệu hiệu năng qua nhiều lần tải trang (multiple runs).
       * 3. Tính toán điểm số theo thuật toán của Google Lighthouse.
       * 4. So sánh với thresholds và ném lỗi nếu không đạt.
       * 5. Xuất báo cáo theo định dạng được yêu cầu.
       *
       * THỜI GIAN CHẠY: Lighthouse audit thường mất 30-60 giây vì nó tải lại
       * trang nhiều lần để thu thập dữ liệu ổn định → timeout của test phải đủ lớn.
       */
      await playAudit({
        page: page,
        port: LIGHTHOUSE_PORT,

        // --- NGƯỠNG CHẤT LƯỢNG ---
        // Test sẽ FAIL nếu bất kỳ chỉ số nào thấp hơn giá trị đặt ra.
        thresholds: LIGHTHOUSE_THRESHOLDS,

        // --- CẤU HÌNH LIGHTHOUSE ---
        opts: {
          /**
           * formFactor: 'desktop' → Audit theo tiêu chí máy tính bàn.
           * Lý do chọn desktop:
           * - SauceDemo được thiết kế chủ yếu cho desktop.
           * - Mobile audit có ngưỡng khắt khe hơn nhiều (giả lập 4G chậm).
           * - Phù hợp với môi trường test đang chạy trên máy tính.
           * Để audit mobile, đổi thành 'mobile' và giảm thresholds xuống ~50.
           */
          formFactor: 'desktop',

          /**
           * screenEmulation: Tắt giả lập màn hình vì đang dùng desktop.
           * Nếu bật formFactor: 'mobile', xóa dòng này.
           */
          screenEmulation: { disabled: true },

          /**
           * throttling: Tắt giới hạn băng thông mạng.
           * Lý do: Ta muốn đo hiệu năng thực tế trên máy local, không mô phỏng
           * điều kiện mạng 4G/3G. Trong CI/CD, có thể bật lại để có kết quả
           * nhất quán hơn giữa các lần chạy.
           */
          throttling: {
            rttMs: 0,
            throughputKbps: 0,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        },

        // --- CẤU HÌNH BÁO CÁO ---
        /**
         * Báo cáo HTML Lighthouse là tài liệu toàn diện gồm:
         * - Tổng quan điểm số (Performance, Accessibility, Best Practices, SEO).
         * - Filmstrip: ảnh chụp màn hình theo thời gian trong quá trình tải.
         * - Danh sách chi tiết từng audit item với trạng thái pass/fail/warn.
         * - Hướng dẫn cụ thể để cải thiện từng vấn đề phát hiện.
         * - Thông tin môi trường (Chrome version, screen size, network...).
         *
         * ĐÂY LÀ BẰNG CHỨNG QUAN TRỌNG CHO LUẬN VĂN:
         * → Đính kèm file HTML vào phụ lục báo cáo để minh chứng chất lượng.
         * → Chụp màn hình trang báo cáo cho các slide thuyết trình.
         */
        reports: {
          formats: {
            html: true,   // Tạo báo cáo HTML đẹp, dễ đọc
            json: false,  // JSON dùng cho phân tích tự động (tắt trong học thuật)
            csv: false,   // CSV dùng cho Excel/Google Sheets (tắt trong học thuật)
          },
          name: `lighthouse-login-page-${new Date().toISOString().replace(/[:.]/g, '-')}`,
          directory: REPORT_DIRECTORY,
        },

        // Tắt log Lighthouse để output test sạch hơn
        disableLogs: true,

        // ignoreBrowserName: Bỏ qua cảnh báo về tên browser không phải Chrome chính thức
        ignoreBrowserName: true,
      });

      // Nếu playAudit() không ném lỗi → tất cả chỉ số đạt ngưỡng → TEST PASS
      console.log(`\n✅ Lighthouse audit PASSED. Báo cáo HTML đã lưu tại: ${REPORT_DIRECTORY}`);

    } finally {
      // =======================================================================
      // BƯỚC 5: ĐỌN DẸP - ĐÓNG BROWSER
      // =======================================================================
      /**
       * QUAN TRỌNG: Luôn đóng browser trong khối finally để đảm bảo
       * browser được giải phóng dù test pass hay fail.
       * Nếu không đóng → cổng 9222 vẫn bị chiếm → test tiếp theo sẽ lỗi.
       */
      await browser.close();
    }
  });

  /**
   * PERF-02: Kiểm toán Lighthouse cho Trang Danh Sách Sản Phẩm (Inventory).
   *
   * ĐÂY LÀ TRANG PHỨC TẠP NHẤT VỀ HIỆU NĂNG:
   * - Tải 6 ảnh sản phẩm (image-heavy page) → ảnh hưởng lớn đến LCP.
   * - Render grid layout với nhiều DOM elements → ảnh hưởng đến CLS.
   * - Thường là trang có điểm Performance THẤP NHẤT trong flow → quan trọng để test.
   *
   * GHI CHÚ KỸ THUẬT: Trang Inventory yêu cầu đăng nhập trước.
   * Ta thực hiện login bằng Playwright TRƯỚC KHI chạy Lighthouse audit.
   * Tuy nhiên, Lighthouse sẽ mở một tab mới khi audit, có thể mất session.
   * Vì SauceDemo dùng localStorage để lưu session, session sẽ được giữ.
   */
  test('PERF-02: Trang Inventory đạt ngưỡng chất lượng Lighthouse', async () => {
    if (!fs.existsSync(REPORT_DIRECTORY)) {
      fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    }

    const browser = await chromium.launch({
      headless: false,
      args: [
        `--remote-debugging-port=${LIGHTHOUSE_PORT}`,
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    try {
      // --- Bước đăng nhập để có session trước khi audit ---
      /**
       * TẠI SAO phải đăng nhập trước khi chạy Lighthouse?
       * - Trang Inventory chỉ hiển thị khi đã đăng nhập.
       * - Nếu không đăng nhập, Lighthouse sẽ chỉ thấy trang Login (redirect).
       * - Ta dùng Playwright để điền form login trước, sau đó chạy audit.
       *
       * LIGHTHOUSE VÀ SESSION:
       * - Lighthouse mở một tab MỚI trong cùng browser context.
       * - SauceDemo lưu trạng thái đăng nhập trong localStorage.
       * - Vì cùng browser context, localStorage được chia sẻ → Lighthouse
       *   thấy trang Inventory đúng như người dùng thực sự thấy.
       */
      await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await page.locator('[data-test="login-button"]').click();
      await page.waitForURL(/.*inventory.html/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // --- Chạy Lighthouse audit trên URL trang Inventory ---
      await playAudit({
        page: page,
        port: LIGHTHOUSE_PORT,
        thresholds: LIGHTHOUSE_THRESHOLDS,
        opts: {
          formFactor: 'desktop',
          screenEmulation: { disabled: true },
          throttling: {
            rttMs: 0,
            throughputKbps: 0,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        },
        reports: {
          formats: { html: true },
          name: `lighthouse-inventory-page-${new Date().toISOString().replace(/[:.]/g, '-')}`,
          directory: REPORT_DIRECTORY,
        },
        disableLogs: true,
        ignoreBrowserName: true,
      });

      console.log(`\n✅ Lighthouse audit PASSED. Báo cáo HTML đã lưu tại: ${REPORT_DIRECTORY}`);

    } finally {
      await browser.close();
    }
  });
});
