import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/store/providers';
import { ToastProvider } from '@/components/shared/toast/ToastProvider';
import { BannedUserGate } from '@/components/auth/BannedUserGate';

export const metadata: Metadata = {
    title: "An-Nisa's World — Premium Embroidery",
    description: 'Minimal, elegant, premium embroidery service.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html suppressHydrationWarning lang="en" className="h-full antialiased">
            <body className="min-h-full flex flex-col bg-brand-white text-brand-black">
                <Providers>
                    <BannedUserGate>
                        <ToastProvider>{children}</ToastProvider>
                    </BannedUserGate>
                </Providers>
            </body>
        </html>
    );
}
