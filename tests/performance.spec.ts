/**
 * tests/performance.spec.ts
 * =========================
 * Kịch Bản Kiểm Thử Hiệu Năng Trang Web (Performance & Web Vitals Testing)
 *
 * MỤC TIÊU SQA:
 * 1. Đo lường các chỉ số tốc độ tải trang thực tế: TTFB, DOMContentLoaded, và Total Page Load Time.
 * 2. Sử dụng Chrome DevTools Protocol (CDP) session để thu thập tài nguyên hệ thống (JS Heap Size, DOM Node count).
 * 3. Thiết lập ngưỡng cảnh báo (SLA Performance Thresholds) để phát hiện regression về hiệu năng.
 */

import { test, expect } from '../fixtures/pom-fixture';

test.describe('Performance & Web Vitals Testing - AutomationExercise.com', () => {
  // Ngưỡng hiệu năng tối đa (SLA Thresholds) chuẩn SQA
  const SLA = {
    maxTTFB: 1500,        // Time to First Byte < 1.5s
    maxDOMInteractive: 3500, // DOM ready < 3.5s
    maxLoadTime: 6000,    // Page Load hoàn tất < 6.0s
  };

  test('PERF-01: Đo lường tốc độ tải trang bằng Navigation Timing API (Web Vitals)', async ({ page, homePage }) => {
    await test.step('Bước 1: Điều hướng đến Trang chủ và chờ tải hoàn chỉnh', async () => {
      await homePage.goto();
      await page.waitForLoadState('load'); // Chờ load event kết thúc để có dữ liệu chính xác
    });

    await test.step('Bước 2: Thu thập các chỉ số thời gian từ Navigation Timing API', async () => {
      // Đọc Performance timing trực tiếp từ trình duyệt
      const timings = await page.evaluate(() => {
        const [entry] = performance.getEntriesByType('navigation') as any[];
        return {
          ttfb: entry.responseStart - entry.startTime,
          domInteractive: entry.domInteractive - entry.startTime,
          loadTime: entry.loadEventEnd - entry.startTime,
        };
      });

      console.log('----------------------------------------------------');
      console.log('📈 KẾT QUẢ KIỂM THỬ HIỆU NĂNG TRANG CHỦ:');
      console.log(`- Time to First Byte (TTFB): ${timings.ttfb.toFixed(0)}ms (SLA: <${SLA.maxTTFB}ms)`);
      console.log(`- DOM Interactive Time    : ${timings.domInteractive.toFixed(0)}ms (SLA: <${SLA.maxDOMInteractive}ms)`);
      console.log(`- Total Page Load Time    : ${timings.loadTime.toFixed(0)}ms (SLA: <${SLA.maxLoadTime}ms)`);
      console.log('----------------------------------------------------');

      // Assertions kiểm tra chất lượng hiệu năng chuẩn ISO/IEC 25010
      expect(timings.ttfb).toBeLessThan(SLA.maxTTFB);
      expect(timings.domInteractive).toBeLessThan(SLA.maxDOMInteractive);
      expect(timings.loadTime).toBeLessThan(SLA.maxLoadTime);
      console.log('✓ [Perf Timings] Hiệu năng trang chủ đạt tiêu chuẩn cam kết SLA.');
    });
  });

  test('PERF-02: Kiểm tra dung lượng tài nguyên & DOM Tree qua Chrome DevTools Protocol (CDP)', async ({ page, productsPage }) => {
    // Chỉ chạy test CDP trên Chromium (vì Firefox không hỗ trợ CDP session của Chrome)
    test.skip(test.info().project.name === 'firefox', 'CDP chỉ hỗ trợ trên Chromium.');

    await test.step('Bước 1: Điều hướng đến trang danh sách sản phẩm', async () => {
      await productsPage.goto();
    });

    await test.step('Bước 2: Kết nối CDP session và lấy thông số RAM & DOM Nodes', async () => {
      const client = await page.context().newCDPSession(page);
      await client.send('Performance.enable');
      
      const perfMetrics = await client.send('Performance.getMetrics');
      
      // Trích xuất các chỉ số quan trọng
      const metrics: Record<string, number> = {};
      perfMetrics.metrics.forEach((m) => {
        metrics[m.name] = m.value;
      });

      const jsHeapSize = metrics['JSHeapUsedSize'] / (1024 * 1024); // Đổi sang MB
      const domNodes = metrics['Nodes']; // CDP sử dụng tên là 'Nodes' thay vì 'DOMNodes'
      const layouts = metrics['LayoutCount'];

      console.log('----------------------------------------------------');
      console.log('🧠 KẾT QUẢ CDP SYSTEM METRICS (PRODUCTS PAGE):');
      console.log(`- JS Heap Size (Bộ nhớ RAM đã dùng)  : ${jsHeapSize.toFixed(2)} MB`);
      console.log(`- Số lượng thẻ DOM Nodes hiện có     : ${domNodes}`);
      console.log(`- Số lần vẽ lại Layout (Layout Count): ${layouts}`);
      console.log('----------------------------------------------------');

      // Đảm bảo không bị memory leak (RAM < 150MB) và DOM Tree nhẹ nhàng (< 4000 nodes)
      expect(jsHeapSize).toBeLessThan(150);
      expect(domNodes).toBeLessThan(4000);
      console.log('✓ [CDP Perf] Hệ thống quản lý bộ nhớ tốt, không có rò rỉ RAM (Memory Leak).');
    });
  });
});
