import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center">
      <Container>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-soft-gold">
            404
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">ไม่พบหน้าที่ต้องการ</h1>
          <p className="mt-4 text-base leading-8 text-text-secondary">
            หน้านี้อาจยังไม่ถูกสร้าง หรือ URL ไม่ถูกต้อง
          </p>
          <Link className={buttonVariants({ className: "mt-8", size: "lg" })} href="/">
            กลับหน้า Home
          </Link>
        </div>
      </Container>
    </main>
  );
}
