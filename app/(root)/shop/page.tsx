import Link from "next/link";
import { Container } from "@/components/shared/Container";

export default function ShopPage() {
  return (
    <main className="flex-1 bg-white">
      <Container>
        <div className="py-12">
          <h1 className="font-serif text-3xl tracking-tight">Shop</h1>
          <p className="mt-2 text-sm text-black/65">
            Starter page. Products are served from `GET /api/products`.
          </p>

          <div className="mt-8 rounded-xl stitch-border bg-white p-6 shadow-softSm">
            <div className="text-sm text-black/70">
              Try visiting a product page:
            </div>
            <Link
              href="/product/sample-product"
              className="mt-3 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              /product/sample-product
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}

