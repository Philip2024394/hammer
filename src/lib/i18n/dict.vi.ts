// Tiếng Việt. Mirrors `dict.en.ts` shape. Awaiting native-speaker
// review before publication — strings drafted by Claude on 2026-06-23
// using standard Vietnamese e-commerce phrasing (Shopee/Tiki style).
import type { Dict } from "./dict.en";

export const vi: Dict = {
  nav: {
    home: "Trang chủ",
    cart: "Giỏ hàng",
    openMenu: "Mở menu",
    search: "Tìm kiếm",
    searchPlaceholder: "Tìm dụng cụ, dây đeo, thương hiệu…",
    account: "Tài khoản"
  },
  home: {
    heroAlt: "Hammerex hero",
    featured: "Sản phẩm nổi bật",
    proPicks: "Lựa chọn của chuyên gia",
    browseTrades: "Duyệt theo nghề",
    viewAll: "Xem tất cả"
  },
  pdp: {
    addToCart: "Thêm vào giỏ",
    addedToCart: "Đã thêm ✓",
    outOfStock: "Hết hàng",
    inStock: "Còn hàng",
    inStockN: "Còn hàng: {n}",
    quotedAtCheckout: "Báo giá khi thanh toán",
    ref: "Mã",
    description: "Mô tả",
    specs: "Thông số",
    features: "Tính năng",
    deliveryReturns: "Giao hàng & đổi trả",
    deliveryQuotedTitle: "Đội Hammerex báo giá trong vòng 24 giờ",
    reviews: "Đánh giá",
    compare: "So sánh",
    wishlist: "Lưu",
    selectSize: "Chọn kích cỡ",
    selectThread: "Chọn màu chỉ",
    welcomeGift: "Quà chào mừng",
    dealBreaker: "Ưu đãi đặc biệt",
    save: "Tiết kiệm",
    bundleAndSave: "Mua trọn bộ & tiết kiệm {pct}%"
  },
  cart: {
    title: "Giỏ hàng của bạn",
    empty: "Giỏ hàng của bạn trống.",
    emptyCta: "Tiếp tục mua sắm",
    items: "sản phẩm",
    item: "sản phẩm",
    itemsSubtotal: "Tổng tiền hàng",
    delivery: "Vận chuyển",
    deliveryQuoted: "Báo giá trong 24 giờ",
    indicativeTotal: "Tổng dự kiến",
    proceedToCheckout: "Tiến hành thanh toán",
    clearCart: "Xóa giỏ hàng",
    confirmClear: "Xác nhận xóa",
    cancel: "Hủy",
    quoteRequestedAtCheckout: "Yêu cầu báo giá khi thanh toán"
  },
  checkout: {
    title: "Thanh toán",
    banner: "Phí vận chuyển sẽ được đội Hammerex báo giá — trong vòng 24 giờ.",
    bannerBody: "Điền thông tin của bạn và nhấn Yêu cầu báo giá vận chuyển — đơn hàng của bạn sẽ được gửi trực tiếp đến đội ngũ Hammerex. Chúng tôi tính mức giá tổng hợp tốt nhất cho toàn bộ đơn hàng như một gói duy nhất — không tính theo từng sản phẩm — và phản hồi qua email hoặc điện thoại. Bạn chỉ thanh toán sau khi đã xem và chấp nhận báo giá vận chuyển. Hàng được gửi đi 3–5 ngày làm việc sau khi thanh toán.",
    yourDetails: "Thông tin của bạn",
    fullName: "Họ và tên",
    email: "Email",
    phone: "Số điện thoại",
    country: "Quốc gia",
    deliveryAddress: "Địa chỉ giao hàng",
    orderSummary: "Tóm tắt đơn hàng",
    quoteMeDelivery: "Yêu cầu báo giá vận chuyển",
    sending: "Đang gửi…",
    fillEveryField: "Điền đầy đủ các trường ở trên để kích hoạt nút.",
    quotedWithin24h: "Phí vận chuyển báo giá trong 24 giờ",
    welcomeGiftAddPaid: "Quà chào mừng đi kèm với đơn hàng có phí đầu tiên của bạn — thêm ít nhất một sản phẩm để nhận quà."
  },
  common: {
    free: "MIỄN PHÍ",
    quoted: "Báo giá khi thanh toán",
    backToHome: "Về trang chủ",
    searchProducts: "Tìm sản phẩm",
    contactWhatsApp: "Liên hệ qua WhatsApp",
    languageSwitcherLabel: "Ngôn ngữ"
  }
};
