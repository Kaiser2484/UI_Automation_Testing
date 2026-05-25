import { type Page, type Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;

  // Tiêu đề trang
  readonly pageTitle: Locator;
  readonly productList: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // --- Modal "Added!" ---
  readonly cartModal: Locator;
  readonly modalAddedTitle: Locator;
  readonly viewCartButton: Locator;
  readonly continueShoppingButton: Locator;

  // ========================================================================
  // 5. TRANG CHI TIẾT SẢN PHẨM (/product_details/{id})
  // ========================================================================
  readonly detailProductName: Locator;
  readonly detailProductCategory: Locator;
  readonly detailProductPrice: Locator;
  readonly detailProductAvailability: Locator;
  readonly detailProductCondition: Locator;
  readonly detailProductBrand: Locator;
  readonly detailQuantityInput: Locator;
  readonly detailAddToCartButton: Locator;

  // ========================================================================
  // 6. DƯ HÀNG SIDEBAR - DANH MỤC & THƯƠNG HIỆU
  // ========================================================================
  readonly sidebarCategoryTitle: Locator;
  readonly sidebarBrandTitle: Locator;
  readonly categoryWomenLink: Locator;
  readonly categoryMenLink: Locator;
  readonly categoryKidsLink: Locator;

  // Subcategories
  readonly subcategoryWomenDress: Locator;
  readonly subcategoryWomenTops: Locator;
  readonly subcategoryMenTshirts: Locator;

  // ========================================================================
  // 7. FORM ĐÁNH GIÁ SẢN PHẨM (ADD REVIEW)
  // ========================================================================
  readonly reviewNameInput: Locator;
  readonly reviewEmailInput: Locator;
  readonly reviewTextInput: Locator;
  readonly reviewSubmitButton: Locator;
  readonly reviewSuccessAlert: Locator;

  // ========================================================================
  // 8. PHẦN SẢN PHẨM ĐƯỢC GỢI Ý (RECOMMENDED ITEMS - TRANG CHỦ)
  // ========================================================================
  readonly recommendedItemsTitle: Locator;
  readonly recommendedAddToCartBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageTitle    = page.locator('h2.title.text-center').first();
    this.productList  = page.locator('.features_items');
    this.searchInput  = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');

    // Modal locators
    this.cartModal             = page.locator('#cartModal');
    this.modalAddedTitle       = page.locator('#cartModal h4');
    this.viewCartButton        = page.locator('#cartModal a[href="/view_cart"]');
    this.continueShoppingButton = page.locator('#cartModal button.close-modal');

    // Product Detail Page Locators
    this.detailProductName = page.locator('.product-information h2');
    this.detailProductCategory = page.locator('.product-information p:has-text("Category:")');
    this.detailProductPrice = page.locator('.product-information span span');
    this.detailProductAvailability = page.locator('.product-information p:has-text("Availability:")');
    this.detailProductCondition = page.locator('.product-information p:has-text("Condition:")');
    this.detailProductBrand = page.locator('.product-information p:has-text("Brand:")');
    this.detailQuantityInput = page.locator('input#quantity');
    this.detailAddToCartButton = page.locator('button.btn.btn-default.cart');

    // Sidebar selectors
    this.sidebarCategoryTitle = page.locator('h2:has-text("Category")');
    this.sidebarBrandTitle = page.locator('h2:has-text("Brands")');
    this.categoryWomenLink = page.locator('a[href="#Women"]');
    this.categoryMenLink = page.locator('a[href="#Men"]');
    this.categoryKidsLink = page.locator('a[href="#Kids"]');

    this.subcategoryWomenDress = page.locator('a[href="/category_products/1"]');
    this.subcategoryWomenTops = page.locator('a[href="/category_products/2"]');
    this.subcategoryMenTshirts = page.locator('a[href="/category_products/3"]');

    // Review Form selectors
    this.reviewNameInput = page.locator('input#name');
    this.reviewEmailInput = page.locator('input#email');
    this.reviewTextInput = page.locator('textarea#review');
    this.reviewSubmitButton = page.locator('button#button-review');
    this.reviewSuccessAlert = page.locator('.alert-success:has-text("Thank you for your review")');

    // Recommended Items selectors
    this.recommendedItemsTitle = page.locator('h2:has-text("recommended items")');
    this.recommendedAddToCartBtn = page.locator('#recommended-item-carousel .active a.add-to-cart').first();
  }

  /**
   * Điều hướng trực tiếp đến trang Products.
   */
  async goto() {
    await this.page.goto('/products', { waitUntil: 'domcontentloaded' });
    await this.productList.waitFor({ state: 'visible' });
  }

  /**
   * Lấy locator của sản phẩm theo tên.
   */
  getProductCardByName(productName: string): Locator {
    return this.page.locator('.single-products').filter({ hasText: productName });
  }

  /**
   * Lấy locator của sản phẩm theo index.
   */
  getProductCardByIndex(index: number): Locator {
    return this.page.locator('.single-products').nth(index);
  }

  /**
   * Thêm sản phẩm vào giỏ theo TÊN.
   */
  async addProductToCartByName(productName: string) {
    const productCard = this.getProductCardByName(productName);
    await productCard.hover();
    const addToCartBtn = productCard.locator('a.add-to-cart').first();
    await addToCartBtn.click();
    await this.waitForCartModal();
  }

  /**
   * Thêm sản phẩm vào giỏ theo INDEX.
   */
  async addProductToCartByIndex(index: number = 0) {
    const productCard = this.getProductCardByIndex(index);
    await productCard.hover();
    const addToCartBtn = productCard.locator('a.add-to-cart').first();
    await addToCartBtn.click();
    await this.waitForCartModal();
  }

  /**
   * Lấy tên của sản phẩm tại index.
   */
  async getProductNameByIndex(index: number): Promise<string> {
    const card = this.getProductCardByIndex(index);
    const nameElement = card.locator('p').last(); // <p>Product Name</p>
    return (await nameElement.textContent())?.trim() ?? '';
  }

  /**
   * Click xem chi tiết sản phẩm tại index.
   */
  async viewProductDetailByIndex(index: number = 0) {
    const productCard = this.page.locator('.product-image-wrapper').nth(index);
    await productCard.scrollIntoViewIfNeeded();
    const viewProductLink = productCard.locator('a:has-text("View Product")').first();
    await viewProductLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Điền số lượng mong muốn trong trang Chi tiết Sản phẩm.
   */
  async setQuantity(qty: number) {
    await this.detailQuantityInput.fill(qty.toString());
  }

  /**
   * Click nút "Add to cart" trong trang Chi tiết Sản phẩm.
   */
  async addDetailToCart() {
    await this.detailAddToCartButton.click();
    await this.waitForCartModal();
  }

  /**
   * Đợi modal "Added!" xuất hiện.
   */
  async waitForCartModal() {
    await this.cartModal.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Click nút "View Cart" trong modal.
   */
  async clickViewCart() {
    await this.viewCartButton.click();
  }

  /**
   * Click "Continue Shopping" trong modal.
   */
  async clickContinueShopping() {
    await this.continueShoppingButton.click();
    await this.cartModal.waitFor({ state: 'hidden' });
  }

  /**
   * Tìm kiếm sản phẩm theo từ khóa.
   */
  async searchProduct(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Đếm số sản phẩm hiển thị.
   */
  async getProductCount(): Promise<number> {
    return await this.page.locator('.single-products').count();
  }

  // ========================================================================
  // THAO TÁC VỚI SIDEBAR (DANH MỤC & THƯƠNG HIỆU)
  // ========================================================================

  /**
   * Click lọc theo Category Women -> Tops hoặc Dress.
   */
  async selectWomenCategory(subcategory: 'Dress' | 'Tops') {
    await this.categoryWomenLink.click();
    if (subcategory === 'Dress') {
      await this.subcategoryWomenDress.click();
    } else {
      await this.subcategoryWomenTops.click();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click lọc theo Category Men -> T-Shirts.
   */
  async selectMenTshirtsCategory() {
    await this.categoryMenLink.click();
    await this.subcategoryMenTshirts.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click lọc theo Brand (ví dụ: Polo, H&M, v.v.).
   */
  async selectBrand(brandName: string) {
    const brandLink = this.page.locator(`.brands-name a:has-text("${brandName}")`);
    await brandLink.scrollIntoViewIfNeeded();
    await brandLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ========================================================================
  // FORM ĐÁNH GIÁ (REVIEW)
  // ========================================================================

  /**
   * Gửi review đánh giá sản phẩm.
   */
  async submitReview(name: string, email: string, reviewText: string) {
    await this.reviewNameInput.scrollIntoViewIfNeeded();
    await this.reviewNameInput.fill(name);
    await this.reviewEmailInput.fill(email);
    await this.reviewTextInput.fill(reviewText);
    await this.reviewSubmitButton.click();
  }

  // ========================================================================
  // RECOMMENDED ITEMS
  // ========================================================================

  /**
   * Scroll xuống Recommended Items và thêm sản phẩm đầu tiên vào giỏ.
   */
  async addRecommendedProductToCart() {
    await this.recommendedItemsTitle.scrollIntoViewIfNeeded();
    await this.recommendedAddToCartBtn.waitFor({ state: 'visible', timeout: 15000 });
    await this.recommendedAddToCartBtn.click();
    await this.waitForCartModal();
  }
}
