"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-brand-line px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-muted hover:border-brand-accent hover:text-brand-accent"
    >
      Sign out
    </button>
  );
}
