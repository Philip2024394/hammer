// Bahasa Indonesia. Mirrors `dict.en.ts` shape. Awaiting native-speaker
// review before publication — strings drafted by Claude on 2026-06-23
// from KBBI conventions + common Indonesian e-commerce phrasing
// (Tokopedia / Shopee style).
import type { Dict } from "./dict.en";

export const id: Dict = {
  nav: {
    home: "Beranda",
    cart: "Keranjang",
    openMenu: "Buka menu",
    search: "Cari",
    searchPlaceholder: "Cari alat, sabuk, merek…",
    account: "Akun"
  },
  home: {
    heroAlt: "Hammerex hero",
    featured: "Produk pilihan",
    proPicks: "Pilihan Profesional",
    browseTrades: "Jelajahi berdasarkan profesi",
    viewAll: "Lihat semua"
  },
  pdp: {
    addToCart: "Tambahkan ke keranjang",
    addedToCart: "Ditambahkan ✓",
    outOfStock: "Habis",
    inStock: "Tersedia",
    inStockN: "Tersedia: {n}",
    quotedAtCheckout: "Harga dihitung di kasir",
    ref: "Ref",
    description: "Deskripsi",
    specs: "Spesifikasi",
    features: "Fitur",
    deliveryReturns: "Pengiriman & pengembalian",
    deliveryQuotedTitle: "Dihitung oleh tim Hammerex dalam 24 jam",
    reviews: "Ulasan",
    compare: "Bandingkan",
    wishlist: "Simpan",
    selectSize: "Pilih ukuran",
    selectThread: "Pilih warna benang",
    welcomeGift: "Hadiah selamat datang",
    dealBreaker: "Penawaran Spesial",
    save: "Hemat",
    bundleAndSave: "Beli sepaket & hemat {pct}%"
  },
  cart: {
    title: "Keranjang Anda",
    empty: "Keranjang Anda kosong.",
    emptyCta: "Lanjutkan belanja",
    items: "barang",
    item: "barang",
    itemsSubtotal: "Subtotal barang",
    delivery: "Pengiriman",
    deliveryQuoted: "Dihitung dalam 24 jam",
    indicativeTotal: "Perkiraan total barang",
    proceedToCheckout: "Lanjut ke kasir",
    clearCart: "Kosongkan keranjang",
    confirmClear: "Konfirmasi",
    cancel: "Batal",
    quoteRequestedAtCheckout: "Diminta penawaran di kasir"
  },
  checkout: {
    title: "Kasir",
    banner: "Pengiriman dihitung oleh tim Hammerex — dalam 24 jam.",
    bannerBody: "Isi detail Anda dan tekan Minta penawaran pengiriman — pesanan Anda langsung diteruskan ke anggota tim Hammerex. Kami menghitung tarif gabungan terbaik untuk seluruh pesanan Anda sebagai satu paket — bukan per barang — dan membalas melalui email atau telepon. Anda hanya membayar setelah melihat dan menyetujui penawaran pengiriman. Pengiriman dilakukan 3–5 hari kerja setelah pembayaran.",
    yourDetails: "Detail Anda",
    fullName: "Nama lengkap",
    email: "Email",
    phone: "Nomor telepon",
    country: "Negara",
    deliveryAddress: "Alamat pengiriman",
    orderSummary: "Ringkasan pesanan",
    quoteMeDelivery: "Minta penawaran pengiriman",
    sending: "Mengirim…",
    fillEveryField: "Isi setiap kolom di atas untuk mengaktifkan tombol.",
    quotedWithin24h: "Pengiriman dihitung dalam 24 jam",
    welcomeGiftAddPaid: "Hadiah selamat datang Anda akan disertakan dengan pesanan berbayar pertama — tambahkan setidaknya satu barang untuk mengklaimnya."
  },
  common: {
    free: "GRATIS",
    quoted: "Harga dihitung di kasir",
    backToHome: "Kembali ke beranda",
    searchProducts: "Cari produk",
    contactWhatsApp: "Hubungi kami di WhatsApp",
    languageSwitcherLabel: "Bahasa"
  }
};
