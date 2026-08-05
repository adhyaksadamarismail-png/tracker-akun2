import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '📦 Tracker Akun Voucher',
  description: 'Aplikasi tracker akun voucher kopi & minuman modern, ringan, dan cepat.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-800">
        {children}
      </body>
    </html>
  );
}
