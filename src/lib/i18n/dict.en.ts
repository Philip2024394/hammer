// English source-of-truth dictionary. Every other locale mirrors this
// shape; missing keys fall back to this file via `t()`. Keep nesting
// shallow (max 2 levels — `namespace.key`) so the t() helper stays simple.

export const en = {
  nav: {
    home: "Home",
    cart: "Cart",
    openMenu: "Open menu",
    search: "Search",
    searchPlaceholder: "Search tools, belts, brands…",
    account: "Account"
  },
  home: {
    heroAlt: "Hammerex hero",
    featured: "Featured products",
    proPicks: "Pro Picks",
    browseTrades: "Browse by trade",
    viewAll: "View all"
  },
  pdp: {
    addToCart: "Add to cart",
    addedToCart: "Added ✓",
    outOfStock: "Sold out",
    inStock: "In stock",
    inStockN: "In stock: {n}",
    quotedAtCheckout: "Quoted at checkout",
    ref: "Ref",
    description: "Description",
    specs: "Specifications",
    features: "Features",
    deliveryReturns: "Delivery & returns",
    deliveryQuotedTitle: "Quoted by the Hammerex team within 24 hours",
    reviews: "Reviews",
    compare: "Compare",
    wishlist: "Save",
    selectSize: "Choose size",
    selectThread: "Choose thread colour",
    welcomeGift: "Welcome gift",
    dealBreaker: "Deal Breaker",
    save: "Save",
    bundleAndSave: "Bundle & save {pct}%"
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    emptyCta: "Continue shopping",
    items: "items",
    item: "item",
    itemsSubtotal: "Items subtotal",
    delivery: "Delivery",
    deliveryQuoted: "Quoted within 24 hours",
    indicativeTotal: "Indicative items total",
    proceedToCheckout: "Proceed to checkout",
    clearCart: "Clear cart",
    confirmClear: "Confirm clear",
    cancel: "Cancel",
    quoteRequestedAtCheckout: "Quote requested at checkout"
  },
  checkout: {
    title: "Checkout",
    banner: "Delivery is quoted by the Hammerex team — within 24 hours.",
    bannerBody: "Fill in your details and press Quote me delivery — your order is submitted straight to a team member at Hammerex. We calculate the best combined rate for your whole order as a single package — never per item — and reply by email or phone. You only pay once you have seen and accepted the delivery quote. Dispatch follows 3–5 working days after payment.",
    yourDetails: "Your details",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    country: "Country",
    deliveryAddress: "Delivery address",
    orderSummary: "Order summary",
    quoteMeDelivery: "Quote me delivery",
    sending: "Sending…",
    fillEveryField: "Fill in every field above to enable the button.",
    quotedWithin24h: "Delivery quoted within 24 hours",
    welcomeGiftAddPaid: "Your welcome gift comes with your first paid order — add at least one item to claim it."
  },
  common: {
    free: "FREE",
    quoted: "Quoted at checkout",
    backToHome: "Back to home",
    searchProducts: "Search products",
    contactWhatsApp: "Contact us on WhatsApp",
    languageSwitcherLabel: "Language"
  }
};

// Strict shape for typing the EN source. Other locales conform to a loose
// `Dict` (same string-keyed namespaces) — they don't need to match the
// EN literal types so translators can write idiomatic copy.
export type EnDict = typeof en;
export type Dict = { [Namespace in keyof EnDict]: { [Key in keyof EnDict[Namespace]]: string } };
