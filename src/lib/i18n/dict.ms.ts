// Bahasa Melayu. Mirrors `dict.en.ts` shape. Awaiting native-speaker
// review before publication — strings drafted by Claude on 2026-06-23
// using Dewan Bahasa dan Pustaka conventions and Malaysian e-commerce
// phrasing (Shopee MY / Lazada MY style).
import type { Dict } from "./dict.en";

export const ms: Dict = {
  nav: {
    home: "Laman utama",
    cart: "Troli",
    openMenu: "Buka menu",
    search: "Cari",
    searchPlaceholder: "Cari alatan, tali pinggang, jenama…",
    account: "Akaun"
  },
  home: {
    heroAlt: "Hammerex hero",
    featured: "Produk pilihan",
    proPicks: "Pilihan Profesional",
    browseTrades: "Lihat mengikut bidang",
    viewAll: "Lihat semua"
  },
  pdp: {
    addToCart: "Masukkan ke troli",
    addedToCart: "Ditambah ✓",
    outOfStock: "Habis stok",
    inStock: "Ada stok",
    inStockN: "Ada stok: {n}",
    quotedAtCheckout: "Sebut harga semasa pembayaran",
    ref: "Ruj",
    description: "Penerangan",
    specs: "Spesifikasi",
    features: "Ciri-ciri",
    deliveryReturns: "Penghantaran & pemulangan",
    deliveryQuotedTitle: "Disebut harga oleh pasukan Hammerex dalam 24 jam",
    reviews: "Ulasan",
    compare: "Banding",
    wishlist: "Simpan",
    selectSize: "Pilih saiz",
    selectThread: "Pilih warna benang",
    welcomeGift: "Hadiah selamat datang",
    dealBreaker: "Tawaran Istimewa",
    save: "Jimat",
    bundleAndSave: "Beli pakej & jimat {pct}%"
  },
  cart: {
    title: "Troli anda",
    empty: "Troli anda kosong.",
    emptyCta: "Sambung membeli-belah",
    items: "barang",
    item: "barang",
    itemsSubtotal: "Subjumlah barang",
    delivery: "Penghantaran",
    deliveryQuoted: "Disebut harga dalam 24 jam",
    indicativeTotal: "Anggaran jumlah barang",
    proceedToCheckout: "Teruskan ke pembayaran",
    clearCart: "Kosongkan troli",
    confirmClear: "Sahkan kosongkan",
    cancel: "Batal",
    quoteRequestedAtCheckout: "Sebut harga diminta semasa pembayaran"
  },
  checkout: {
    title: "Pembayaran",
    banner: "Penghantaran disebut harga oleh pasukan Hammerex — dalam 24 jam.",
    bannerBody: "Isi maklumat anda dan tekan Minta sebut harga penghantaran — pesanan anda akan dihantar terus kepada ahli pasukan Hammerex. Kami mengira kadar gabungan terbaik untuk seluruh pesanan anda sebagai satu pakej — bukan setiap barang — dan balas melalui e-mel atau telefon. Anda hanya membayar setelah melihat dan menerima sebut harga penghantaran. Penghantaran dibuat 3–5 hari bekerja selepas bayaran.",
    yourDetails: "Maklumat anda",
    fullName: "Nama penuh",
    email: "E-mel",
    phone: "Nombor telefon",
    country: "Negara",
    deliveryAddress: "Alamat penghantaran",
    orderSummary: "Ringkasan pesanan",
    quoteMeDelivery: "Minta sebut harga penghantaran",
    sending: "Sedang menghantar…",
    fillEveryField: "Isi setiap medan di atas untuk mengaktifkan butang.",
    quotedWithin24h: "Penghantaran disebut harga dalam 24 jam",
    welcomeGiftAddPaid: "Hadiah selamat datang anda disertakan dengan pesanan berbayar pertama — tambah sekurang-kurangnya satu barang untuk menuntutnya."
  },
  common: {
    free: "PERCUMA",
    quoted: "Sebut harga semasa pembayaran",
    backToHome: "Kembali ke laman utama",
    searchProducts: "Cari produk",
    contactWhatsApp: "Hubungi kami di WhatsApp",
    languageSwitcherLabel: "Bahasa"
  }
};
