"use client";

const KEY = "hammerex_wishlist_v1";
const EVENT = "hammerex:wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export const wishlist = {
  read,
  has(slug: string): boolean {
    return read().includes(slug);
  },
  count(): number {
    return read().length;
  },
  toggle(slug: string): boolean {
    const list = read();
    const i = list.indexOf(slug);
    if (i >= 0) {
      list.splice(i, 1);
      write(list);
      return false;
    }
    list.unshift(slug);
    write(list);
    return true;
  },
  remove(slug: string) {
    write(read().filter((s) => s !== slug));
  },
  clear() {
    write([]);
  },
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVENT, h);
      window.removeEventListener("storage", h);
    };
  }
};
