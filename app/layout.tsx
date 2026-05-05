import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/store/providers";
import { ToastProvider } from "@/components/shared/toast/ToastProvider";

export const metadata: Metadata = {
  title: "An-Nisa's World — Premium Embroidery",
  description: "Minimal, elegant, premium embroidery service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-brand-white text-brand-black">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
