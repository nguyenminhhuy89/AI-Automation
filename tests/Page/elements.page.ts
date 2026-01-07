export const commonLocators = {

TITLE: `//div[@class="page-title"]/h1`,

TOPMENU_REGISTER: `//div[@class="header-links"]/descendant::li/a[text()="Register"]`,
TOPMENU_LOGIN: `//div[@class="header-links"]/descendant::li/a[text()="Log in"]'`,
TOPMENU_LOGOUT:`//div[@class="header-links"]/descendant::li/a[text()="Log out"]`,
TOPMENU_SHOPPING_CART:`//div[@class="header-links"]//span[contains(text(),"Shopping cart")]`,

TOPMENU_CATEGORY: (Category_name:string) => `//ul[@class="top-menu"]//a[contains(text(),"${Category_name}")]`,
FOOTER_LINK: (linktext: string) => `//div[@class="footer-menu-wrapper"]/descendant::a[text()="${linktext}"]`,
MY_ACCOUNT: (linkText: string) => `//div[@class="block block-account-navigation"]/descendant::a[text()='${linkText}']`,

//product_thumbnail
PRODUCT_THUMBNAIL_NAME: (product_Name: string) => `//div[@class="item-box"]/descendant::a[normalize-space(text())="${product_Name}"]`,

PRODUCT_THUMBNAIL_ADDTOCART: (product_Name: string) => `//a[contains(text(),"${product_Name}")]/ancestor::div[@class="product-item"]//input`,


//product_detail
PRODUCT_DETAIL_NAME: (product_Name: string) => `//div[@class="product-essential"]//h1[contains(text(),"${product_Name}")]`,
PRODUCT_DETAIL_ADDTOCART: (product_Name: string) => `//h1[contains(text(),${product_Name})]/parent::div/following-sibling::div[@class="add-to-cart"]/descendant::input[@value="Add to cart"]`,

//
PRODUCT_ITEM_SHOPPING_CART: (produc_Name: string) => `//a[text()="${produc_Name}"]/ancestor::tr`,
}