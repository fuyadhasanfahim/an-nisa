import { Suspense } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { FloatingAIChat } from "@/components/shared/FloatingAIChat";

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
      <FloatingAIChat />
    </>
  );
}
