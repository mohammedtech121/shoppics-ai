import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShopPics AI — Phone photos in, studio shots out',
  description:
    'ShopPics AI turns a phone product photo into studio-quality shots for Instagram, Meesho, Amazon & WhatsApp — powered end-to-end by Cloudinary (AI background removal, GenAI backdrops, marketplace sizing).',
  keywords: [
    'ShopPics AI',
    'product photography',
    'AI background removal',
    'Cloudinary',
    'Meesho seller tools',
    'Amazon listing images',
    'WhatsApp product photos',
  ],
  authors: [{ name: 'Mohammed Khan — Team HYDRA' }],
  openGraph: {
    title: 'ShopPics AI — Studio shots from phone photos',
    description:
      'One upload → AI cutout → studio backdrops → a 4-image marketplace Seller Pack. Heuristic suggestions, localStorage history, Cloudinary AI throughout.',
    siteName: 'ShopPics AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
