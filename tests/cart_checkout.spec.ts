import { test, expect } from '../fixtures/pom-fixture';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Cart & Checkout Flow - AutomationExercise.com', () => {
  const STATIC_ACCOUNT = {
    email: 'qa_student_2026@test.com',
    password: 'qa_student_2026@test.com',
    username: 'qa_student_2026@test.com',
  };

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('TC-12: Thêm nhiều sản phẩm vào giỏ hàng và kiểm tra (Add Products in Cart)', async ({ productsPage, cartPage }) => {
    await test.step('Bước 1: Vào trang Products', async () => {
      await productsPage.goto();
    });

    await test.step('Bước 2: Thêm sản phẩm thứ nhất và tiếp tục shopping', async () => {
      await productsPage.addProductToCartByIndex(0); // Blue Top
      await productsPage.clickContinueShopping();
    });

    await test.step('Bước 3: Thêm sản phẩm thứ hai và mở giỏ hàng', async () => {
      await productsPage.addProductToCartByIndex(1); // Men Tshirt
      await productsPage.clickViewCart();
    });

    await test.step('Bước 4: Xác minh cả 2 sản phẩm hiển thị trong giỏ hàng với thông tin đúng', async () => {
      const names = await cartPage.getCartItemNames();
      expect(names.length).toBe(2);

      const price1 = await cartPage.getPriceByProductName(names[0]);
      const qty1 = await cartPage.getQuantityByProductName(names[0]);
      const price2 = await cartPage.getPriceByProductName(names[1]);
      const qty2 = await cartPage.getQuantityByProductName(names[1]);

      expect(qty1).toBe(1);
      expect(qty2).toBe(1);
      console.log(`✓ Giỏ hàng chứa: ${names[0]} (Giá: ${price1}) và ${names[1]} (Giá: ${price2})`);
    });
  });

  test('TC-13: Kiểm tra số lượng sản phẩm trong giỏ hàng (Verify Product Quantity)', async ({ productsPage, cartPage }) => {
    const quantity = 4;

    await test.step('Bước 1: Xem chi tiết sản phẩm đầu tiên', async () => {
      await productsPage.viewProductDetailByIndex(0);
    });

    await test.step('Bước 2: Thiết lập số lượng = 4', async () => {
      await productsPage.setQuantity(quantity);
    });

    await test.step('Bước 3: Thêm vào giỏ và xem giỏ hàng', async () => {
      await productsPage.addDetailToCart();
      await productsPage.clickViewCart();
    });

    await test.step('Bước 4: Xác minh số lượng sản phẩm trong giỏ đúng bằng 4', async () => {
      const names = await cartPage.getCartItemNames();
      const qty = await cartPage.getQuantityByProductName(names[0]);
      expect(qty).toBe(quantity);
      console.log(`✓ Số lượng sản phẩm "${names[0]}" trong giỏ hàng chính xác là: ${qty}`);
    });
  });

  test('TC-14: Đăng ký tài khoản trong quá trình thanh toán (Register while Checkout)', async ({ page, productsPage, cartPage, loginPage, homePage, checkoutPage, paymentPage }) => {
    const randomSuffix = Date.now();
    const email = `qa_checkout_14_${randomSuffix}@test.com`;

    await test.step('Bước 1: Thêm sản phẩm và đi đến giỏ hàng', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await productsPage.clickViewCart();
    });

    await test.step('Bước 2: Click "Proceed To Checkout"', async () => {
      await cartPage.proceedToCheckout();
    });

    await test.step('Bước 3: Click đăng nhập / đăng ký trên Checkout popup', async () => {
      const checkoutPopupLink = page.locator('u:has-text("Register / Login")');
      await checkoutPopupLink.click();
    });

    await test.step('Bước 4: Hoàn thành đăng ký tài khoản mới', async () => {
      await loginPage.submitQuickSignup(`User ${randomSuffix}`, email);
      await loginPage.fillAccountDetails({
        gender: 'Mrs',
        password: 'checkout_pass',
        dob: { day: '1', month: '1', year: '1990' },
        newsletter: false,
        offers: false,
        firstName: 'Thanh',
        lastName: 'L',
        address1: '321 Tay Son',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
        zipcode: '110001',
        mobileNumber: '0988888888',
      });
      await loginPage.clickContinue();
      const text = await loginPage.getLoggedInText();
      expect(text).toContain(`User ${randomSuffix}`);
    });

    await test.step('Bước 5: Quay lại giỏ hàng và thực hiện Checkout lại', async () => {
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutPage.waitForCheckoutPage();
    });

    await test.step('Bước 6: Ghi chú đơn hàng và nhấn Place Order', async () => {
      await checkoutPage.fillOrderComment('Đơn hàng E2E đặt trong Checkout - TC14');
      await checkoutPage.placeOrder();
    });

    await test.step('Bước 7: Thanh toán bằng thẻ tín dụng và xác nhận đơn hàng', async () => {
      await paymentPage.payAndConfirm('Thanh L', '1234567890123456', '321', '12', '2028');
      await paymentPage.verifyOrderPlaced();
    });

    await test.step('Bước 8: Xóa tài khoản để làm sạch dữ liệu kiểm thử', async () => {
      await loginPage.deleteAccount();
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await loginPage.clickContinue();
    });
  });

  test('TC-15: Đăng ký trước rồi mới thực hiện thanh toán (Register before Checkout)', async ({ productsPage, cartPage, loginPage, homePage, checkoutPage, paymentPage }) => {
    const randomSuffix = Date.now();
    const email = `qa_checkout_15_${randomSuffix}@test.com`;

    await test.step('Bước 1: Đăng ký tài khoản mới trước', async () => {
      await loginPage.goto();
      await loginPage.submitQuickSignup(`User ${randomSuffix}`, email);
      await loginPage.fillAccountDetails({
        gender: 'Mr',
        password: 'checkout_pass_15',
        dob: { day: '20', month: '10', year: '1995' },
        newsletter: true,
        offers: true,
        firstName: 'Hung',
        lastName: 'Nguyen',
        address1: '456 Nguyen Trai',
        country: 'United States',
        state: 'California',
        city: 'Los Angeles',
        zipcode: '90001',
        mobileNumber: '0977777777',
      });
      await loginPage.clickContinue();
      const text = await loginPage.getLoggedInText();
      expect(text).toContain(`User ${randomSuffix}`);
    });

    await test.step('Bước 2: Thêm sản phẩm vào giỏ hàng', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await productsPage.clickViewCart();
    });

    await test.step('Bước 3: Thực hiện Checkout và thanh toán đơn hàng', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.waitForCheckoutPage();
      await checkoutPage.fillOrderComment('TC15 - Đặt hàng sau khi đã đăng ký tài khoản');
      await checkoutPage.placeOrder();

      await paymentPage.payAndConfirm('Nguyen Hung', '9876543210987654', '456', '06', '2029');
      await paymentPage.verifyOrderPlaced();
    });

    await test.step('Bước 4: Xóa tài khoản kiểm thử', async () => {
      await loginPage.deleteAccount();
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await loginPage.clickContinue();
    });
  });

  test('TC-16: Đăng nhập trước rồi mới thực hiện thanh toán (Login before Checkout)', async ({ productsPage, cartPage, loginPage, checkoutPage, paymentPage }) => {
    await test.step('Bước 1: Đăng nhập tài khoản tĩnh', async () => {
      await loginPage.goto();
      await loginPage.login(STATIC_ACCOUNT.email, STATIC_ACCOUNT.password);
      await expect(loginPage.logoutLink).toBeVisible({ timeout: 15000 });
    });

    await test.step('Bước 2: Thêm sản phẩm vào giỏ hàng', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await productsPage.clickViewCart();
    });

    await test.step('Bước 3: Thực hiện Checkout và thanh toán đơn hàng', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.waitForCheckoutPage();
      await checkoutPage.fillOrderComment('TC16 - Đặt hàng sau khi đã đăng nhập tài khoản');
      await checkoutPage.placeOrder();

      await paymentPage.payAndConfirm('QA Student', '5555666677778888', '789', '11', '2030');
      await paymentPage.verifyOrderPlaced();
    });
  });

  test('TC-17: Xóa sản phẩm khỏi giỏ hàng (Remove Products From Cart)', async ({ productsPage, cartPage }) => {
    await test.step('Bước 1: Thêm 1 sản phẩm vào giỏ hàng và mở giỏ hàng', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await productsPage.clickViewCart();
    });

    await test.step('Bước 2: Click nút xóa sản phẩm', async () => {
      const names = await cartPage.getCartItemNames();
      expect(names.length).toBeGreaterThan(0);
      await cartPage.removeProductByName(names[0]);
    });

    await test.step('Bước 3: Xác minh giỏ hàng trống', async () => {
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);
      console.log('✓ Sản phẩm đã được xóa thành công. Giỏ hàng hiện tại đang trống.');
    });
  });

  test('TC-20: Tìm kiếm và giỏ hàng sau khi đăng nhập (Search Products and Verify Cart After Login)', async ({ productsPage, cartPage, loginPage }) => {
    const searchKeyword = 'Blue Top';

    await test.step('Bước 1: Tìm kiếm sản phẩm và thêm vào giỏ hàng', async () => {
      await productsPage.goto();
      await productsPage.searchProduct(searchKeyword);
      await productsPage.addProductToCartByIndex(0);
      await productsPage.clickViewCart();
      const names = await cartPage.getCartItemNames();
      expect(names[0]).toContain(searchKeyword);
    });

    await test.step('Bước 2: Đăng nhập bằng tài khoản tĩnh', async () => {
      await loginPage.goto();
      await loginPage.login(STATIC_ACCOUNT.email, STATIC_ACCOUNT.password);
      await expect(loginPage.logoutLink).toBeVisible({ timeout: 15000 });
    });

    await test.step('Bước 3: Vào lại giỏ hàng và xác minh sản phẩm vẫn tồn tại trong giỏ', async () => {
      await cartPage.goto();
      const names = await cartPage.getCartItemNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names[0]).toContain(searchKeyword);
      console.log(`✓ Đã xác minh: Sau khi login, sản phẩm "${names[0]}" vẫn nằm an toàn trong giỏ hàng.`);
    });
  });

  test('TC-22: Thêm sản phẩm từ mục gợi ý "Recommended Items"', async ({ homePage, productsPage, cartPage }) => {
    await test.step('Bước 1: Thêm sản phẩm gợi ý từ Trang chủ', async () => {
      await homePage.goto();
      await productsPage.addRecommendedProductToCart();
      await productsPage.clickViewCart();
    });

    await test.step('Bước 2: Xác minh sản phẩm hiển thị trong giỏ hàng', async () => {
      await expect(cartPage.cartItems.first()).toBeVisible({ timeout: 15000 });
      const count = await cartPage.getCartItemCount();
      expect(count).toBeGreaterThan(0);
      const names = await cartPage.getCartItemNames();
      console.log(`✓ Sản phẩm được thêm từ mục Recommended: ${names.join(', ')}`);
    });
  });

  test('TC-23: Xác minh địa chỉ giao hàng và thanh toán tại Checkout (Verify Address details)', async ({ productsPage, cartPage, loginPage, checkoutPage }) => {
    const randomSuffix = Date.now();
    const email = `qa_checkout_23_${randomSuffix}@test.com`;

    const addressDetails = {
      gender: 'Mr' as const,
      password: 'address_pass_23',
      dob: { day: '10', month: '12', year: '1992' },
      newsletter: false,
      offers: false,
      firstName: 'Nyxshade',
      lastName: 'Zenith',
      company: 'SQA Lab',
      address1: '144 Xuan Thuy Str',
      address2: 'Cau Giay Dist',
      country: 'Singapore',
      state: 'HN State',
      city: 'Hanoi City',
      zipcode: '10000',
      mobileNumber: '0912345678',
    };

    await test.step('Bước 1: Đăng ký tài khoản với địa chỉ cụ thể', async () => {
      await loginPage.goto();
      await loginPage.submitQuickSignup(`Zenith ${randomSuffix}`, email);
      await loginPage.fillAccountDetails(addressDetails);
      await loginPage.clickContinue();
    });

    await test.step('Bước 2: Thêm sản phẩm vào giỏ hàng và mở Checkout', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutPage.waitForCheckoutPage();
    });

    await test.step('Bước 3: Xác minh địa chỉ giao hàng (Delivery Address) khớp với đăng ký', async () => {
      const deliveryText = await checkoutPage.page.locator('#address_delivery').textContent();
      expect(deliveryText).toContain(`${addressDetails.firstName} ${addressDetails.lastName}`);
      expect(deliveryText).toContain(addressDetails.address1);
      expect(deliveryText).toContain(addressDetails.city);
      expect(deliveryText).toContain(addressDetails.country);
    });

    await test.step('Bước 4: Xác minh địa chỉ thanh toán (Billing Address) khớp với đăng ký', async () => {
      const billingText = await checkoutPage.page.locator('#address_invoice').textContent();
      expect(billingText).toContain(`${addressDetails.firstName} ${addressDetails.lastName}`);
      expect(billingText).toContain(addressDetails.address1);
      expect(billingText).toContain(addressDetails.city);
      expect(billingText).toContain(addressDetails.country);
      console.log('✓ Cả địa chỉ giao hàng và địa chỉ thanh toán đều trùng khớp 100% với địa chỉ đã đăng ký.');
    });

    await test.step('Bước 5: Xóa tài khoản kiểm thử', async () => {
      await loginPage.deleteAccount();
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await loginPage.clickContinue();
    });
  });

  test('TC-24: Hoàn thành đặt hàng và tải xuống hóa đơn PDF (Download Invoice)', async ({ productsPage, cartPage, loginPage, checkoutPage, paymentPage }) => {
    const randomSuffix = Date.now();
    const email = `qa_checkout_24_${randomSuffix}@test.com`;

    await test.step('Bước 1: Đăng ký tài khoản mới', async () => {
      await loginPage.goto();
      await loginPage.submitQuickSignup(`User ${randomSuffix}`, email);
      await loginPage.fillAccountDetails({
        gender: 'Mrs',
        password: 'invoice_pass_24',
        dob: { day: '1', month: '1', year: '1990' },
        newsletter: false,
        offers: false,
        firstName: 'Customer',
        lastName: 'Invoice',
        address1: '789 Lang Str',
        country: 'Canada',
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5H 2N2',
        mobileNumber: '0933333333',
      });
      await loginPage.clickContinue();
    });

    await test.step('Bước 2: Thêm sản phẩm và đi đến Checkout', async () => {
      await productsPage.goto();
      await productsPage.addProductToCartByIndex(0);
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutPage.waitForCheckoutPage();
      await checkoutPage.fillOrderComment('Đặt hàng tải hóa đơn - TC24');
      await checkoutPage.placeOrder();
    });

    await test.step('Bước 3: Thực hiện thanh toán thành công', async () => {
      await paymentPage.payAndConfirm('Invoice Customer', '1111222233334444', '999', '02', '2031');
      await paymentPage.verifyOrderPlaced();
    });

    await test.step('Bước 4: Tải xuống hóa đơn và lưu trữ cục bộ', async () => {
      // Tạo thư mục lưu download tạm thời
      const downloadsDir = path.resolve(process.cwd(), 'test-results', 'downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const downloadedFile = await paymentPage.downloadInvoice(downloadsDir);
      expect(fs.existsSync(downloadedFile)).toBe(true);
      expect(fs.statSync(downloadedFile).size).toBeGreaterThan(0);
      console.log(`✓ Tệp tin hóa đơn tải xuống thành công (${fs.statSync(downloadedFile).size} bytes).`);
    });

    await test.step('Bước 5: Xóa tài khoản kiểm thử', async () => {
      await loginPage.deleteAccount();
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await loginPage.clickContinue();
    });
  });
});
