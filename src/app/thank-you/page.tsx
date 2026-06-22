import { Suspense } from "react";
import { Header } from "@/components/Header";
import { ThankYouContent } from "./Content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thanks — Hammerex"
};

export default function ThankYouPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <ThankYouContent />
      </Suspense>
    </main>
  );
}
