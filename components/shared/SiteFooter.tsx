import { Container } from "@/components/shared/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <Container>
        <div className="flex flex-col gap-2 py-10 text-sm text-black/60 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} An-Nisa</div>
          <div className="flex items-center gap-3">
            <span className="stitch-border rounded-xl px-3 py-1 text-xs">
              Crafted with care
            </span>
            <span className="text-xs">Soft pink. Bold detail. Premium feel.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

