import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // ========================================================================
  // 1. FORM ĐĂNG NHẬP (BÊN TRÁI)
  // ========================================================================
  readonly loginFormTitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  // ========================================================================
  // 2. FORM ĐĂNG KÝ NHANH (BÊN PHẢI)
  // ========================================================================
  readonly signupFormTitle: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorMessage: Locator;

  // ========================================================================
  // 3. FORM CHI TIẾT TÀI KHOẢN (TRANG /signup)
  // ========================================================================
  readonly titleGenderMr: Locator;
  readonly titleGenderMrs: Locator;
  readonly signupPasswordInput: Locator;
  readonly dobDaysSelect: Locator;
  readonly dobMonthsSelect: Locator;
  readonly dobYearsSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly offersCheckbox: Locator;

  // Address details
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  // ========================================================================
  // 4. TRẠNG THÁI TÀI KHOẢN & ĐIỀU HƯỚNG
  // ========================================================================
  readonly accountCreatedHeader: Locator;
  readonly accountDeletedHeader: Locator;
  readonly continueButton: Locator;

  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Login Form Locators
    const loginForm = page.locator('div.login-form');
    this.loginFormTitle = loginForm.locator('h2');
    this.emailInput     = loginForm.locator('input[name="email"]');
    this.passwordInput  = loginForm.locator('input[name="password"]');
    this.loginButton    = loginForm.locator('button[type="submit"]');
    this.errorMessage   = page.locator('p:has-text("Your email or password is incorrect!"), .alert-danger, form p[style*="color:red"]').first();

    // Quick Signup Form Locators (Right side of login page)
    const signupForm = page.locator('div.signup-form');
    this.signupFormTitle = signupForm.locator('h2');
    this.signupNameInput = signupForm.locator('input[name="name"]');
    this.signupEmailInput = signupForm.locator('input[name="email"]');
    this.signupButton = signupForm.locator('button[type="submit"]');
    this.signupErrorMessage = page.locator('p:has-text("Email Address already exist!")');

    // Registration Details Form Locators (/signup page)
    this.titleGenderMr = page.locator('#id_gender1');
    this.titleGenderMrs = page.locator('#id_gender2');
    this.signupPasswordInput = page.locator('input[type="password"]#password');
    this.dobDaysSelect = page.locator('select#days');
    this.dobMonthsSelect = page.locator('select#months');
    this.dobYearsSelect = page.locator('select#years');
    this.newsletterCheckbox = page.locator('input#newsletter');
    this.offersCheckbox = page.locator('input#optin');

    this.firstNameInput = page.locator('input#first_name');
    this.lastNameInput = page.locator('input#last_name');
    this.companyInput = page.locator('input#company');
    this.address1Input = page.locator('input#address1');
    this.address2Input = page.locator('input#address2');
    this.countrySelect = page.locator('select#country');
    this.stateInput = page.locator('input#state');
    this.cityInput = page.locator('input#city');
    this.zipcodeInput = page.locator('input#zipcode');
    this.mobileNumberInput = page.locator('input#mobile_number');
    this.createAccountButton = page.locator('button[data-qa="create-account"]');

    // Status Pages & Action Buttons
    this.accountCreatedHeader = page.locator('h2[data-qa="account-created"] b');
    this.accountDeletedHeader = page.locator('h2[data-qa="account-deleted"] b');
    this.continueButton = page.locator('a[data-qa="continue-button"]');

    // Navigation and status elements
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.loggedInAsText = page.locator('li:has-text("Logged in as")');
  }

  /**
   * Điều hướng trực tiếp đến trang Đăng nhập / Đăng ký.
   */
  async goto() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.loginFormTitle.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Đăng nhập tài khoản.
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Nhập thông tin đăng ký nhanh bên phải và click Signup.
   */
  async submitQuickSignup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  /**
   * Điền chi tiết thông tin đăng ký tài khoản (trên trang /signup).
   */
  async fillAccountDetails(details: {
    gender: 'Mr' | 'Mrs';
    password: string;
    dob: { day: string; month: string; year: string };
    newsletter: boolean;
    offers: boolean;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
  }) {
    // 1. Chọn Gender
    if (details.gender === 'Mr') {
      await this.titleGenderMr.check();
    } else {
      await this.titleGenderMrs.check();
    }

    // 2. Điền password
    await this.signupPasswordInput.fill(details.password);

    // 3. Chọn ngày sinh
    await this.dobDaysSelect.selectOption(details.dob.day);
    await this.dobMonthsSelect.selectOption(details.dob.month);
    await this.dobYearsSelect.selectOption(details.dob.year);

    // 4. Newsletter & Special Offers Checkbox
    if (details.newsletter) {
      await this.newsletterCheckbox.check();
    }
    if (details.offers) {
      await this.offersCheckbox.check();
    }

    // 5. Điền thông tin địa chỉ thanh toán
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    if (details.company) {
      await this.companyInput.fill(details.company);
    }
    await this.address1Input.fill(details.address1);
    if (details.address2) {
      await this.address2Input.fill(details.address2);
    }
    await this.countrySelect.selectOption(details.country);
    await this.stateInput.fill(details.state);
    await this.cityInput.fill(details.city);
    await this.zipcodeInput.fill(details.zipcode);
    await this.mobileNumberInput.fill(details.mobileNumber);

    // 6. Nhấp nút tạo tài khoản
    await this.createAccountButton.click();
  }

  /**
   * Nhấp nút Continue trên màn hình trạng thái
   */
  async clickContinue() {
    await this.continueButton.click();
  }

  /**
   * Nhấp xóa tài khoản từ Menu Navbar
   */
  async deleteAccount() {
    await this.deleteAccountLink.click();
  }

  /**
   * Kiểm tra xem người dùng có đang ở trạng thái đăng nhập không.
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.logoutLink.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Lấy text "Logged in as <username>" từ navbar.
   */
  async getLoggedInText(): Promise<string> {
    return (await this.loggedInAsText.textContent()) ?? '';
  }
}
