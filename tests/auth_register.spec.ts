import { test, expect } from '../fixtures/pom-fixture';

test.describe('Auth & Registration - AutomationExercise.com', () => {
  // Sử dụng tài khoản tĩnh cho các test login
  const STATIC_ACCOUNT = {
    email: 'qa_student_2026@test.com',
    password: 'qa_student_2026@test.com',
    username: 'qa_student_2026@test.com',
  };

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('TC-01: Đăng ký tài khoản người dùng mới (Register User)', async ({ homePage, loginPage }) => {
    // Sinh thông tin ngẫu nhiên để tránh lỗi trùng email lưu trữ trong DB thực tế của AE
    const randomSuffix = Date.now();
    const newEmail = `qa_new_student_${randomSuffix}@test.com`;
    const newName = `Student ${randomSuffix}`;

    await test.step('Bước 1: Điều hướng đến HomePage và xác minh hiển thị', async () => {
      await homePage.verifyHomePageVisible();
    });

    await test.step('Bước 2: Click vào link "Signup / Login"', async () => {
      await homePage.clickSignupLogin();
      await expect(loginPage.signupFormTitle).toBeVisible();
    });

    await test.step('Bước 3: Thực hiện đăng ký nhanh (Name & Email)', async () => {
      await loginPage.submitQuickSignup(newName, newEmail);
    });

    await test.step('Bước 4: Điền thông tin chi tiết tài khoản', async () => {
      // Đợi trang /signup load với tiêu đề giới tính hiển thị
      await expect(loginPage.titleGenderMr).toBeVisible();

      await loginPage.fillAccountDetails({
        gender: 'Mr',
        password: 'password_123',
        dob: { day: '15', month: '5', year: '1998' },
        newsletter: true,
        offers: true,
        firstName: 'Nyxshade',
        lastName: 'Z',
        company: 'VNU University',
        address1: '144 Xuan Thuy',
        address2: 'Cau Giay District',
        country: 'Singapore',
        state: 'Hanoi State',
        city: 'Hanoi',
        zipcode: '10000',
        mobileNumber: '0900000001',
      });
    });

    await test.step('Bước 5: Xác minh tạo tài khoản thành công', async () => {
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await loginPage.clickContinue();
    });

    await test.step('Bước 6: Xác minh trạng thái đăng nhập hiển thị trên Navbar', async () => {
      const loggedInText = await loginPage.getLoggedInText();
      expect(loggedInText).toContain(newName);
    });

    await test.step('Bước 7: Click xóa tài khoản và xác minh hoàn tất', async () => {
      await loginPage.deleteAccount();
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await loginPage.clickContinue();
    });
  });

  test('TC-02: Đăng nhập thành công với thông tin đúng (Login Correct)', async ({ homePage, loginPage }) => {
    await test.step('Bước 1: Điều hướng và vào trang Login', async () => {
      await homePage.verifyHomePageVisible();
      await homePage.clickSignupLogin();
      await expect(loginPage.loginFormTitle).toBeVisible();
    });

    await test.step('Bước 2: Điền thông tin đăng nhập đúng', async () => {
      await loginPage.login(STATIC_ACCOUNT.email, STATIC_ACCOUNT.password);
    });

    await test.step('Bước 3: Xác minh đăng nhập thành công', async () => {
      const loggedInText = await loginPage.getLoggedInText();
      expect(loggedInText).toContain(STATIC_ACCOUNT.username);
    });
  });

  test('TC-03: Đăng nhập thất bại với thông tin sai (Login Incorrect)', async ({ homePage, loginPage }) => {
    await test.step('Bước 1: Điều hướng và vào trang Login', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Bước 2: Thử đăng nhập với thông tin không đúng', async () => {
      await loginPage.login('wrong_user_xyz@test.com', 'wrong_pass_999');
    });

    await test.step('Bước 3: Xác minh thông báo lỗi hiển thị rõ', async () => {
      await expect(loginPage.errorMessage).toBeVisible();
    });
  });

  test('TC-04: Đăng xuất người dùng (Logout User)', async ({ homePage, loginPage }) => {
    await test.step('Bước 1: Đăng nhập với tài khoản đúng', async () => {
      await homePage.clickSignupLogin();
      await loginPage.login(STATIC_ACCOUNT.email, STATIC_ACCOUNT.password);
      expect(await loginPage.isLoggedIn()).toBe(true);
    });

    await test.step('Bước 2: Click vào nút Logout', async () => {
      await loginPage.logoutLink.click();
    });

    await test.step('Bước 3: Xác minh người dùng quay về màn hình đăng nhập', async () => {
      await expect(loginPage.loginFormTitle).toBeVisible();
      expect(await loginPage.isLoggedIn()).toBe(false);
    });
  });

  test('TC-05: Đăng ký thất bại với email đã tồn tại (Register with Existing Email)', async ({ homePage, loginPage }) => {
    await test.step('Bước 1: Điều hướng và vào trang Login', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Bước 2: Nhập email đã được đăng ký từ trước', async () => {
      await loginPage.submitQuickSignup('Tên Tồn Tại', STATIC_ACCOUNT.email);
    });

    await test.step('Bước 3: Xác minh hiển thị lỗi trùng email', async () => {
      await expect(loginPage.signupErrorMessage).toBeVisible();
    });
  });
});
