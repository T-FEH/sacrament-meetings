import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Absolute base for Open Graph and canonical URLs. Social crawlers will not
 * resolve relative image paths, so metadataBase must be set for the
 * app/opengraph-image.png convention to produce a usable absolute URL.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

const siteDescription =
  'Plan, review, and print sacrament meeting agendas including hymns, prayers, ward business, speakers, and musical numbers.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sacrament Meeting Planner',
    template: '%s | Sacrament Meeting Planner',
  },
  description: siteDescription,
  applicationName: 'Sacrament Meeting Planner',
  keywords: [
    'sacrament meeting',
    'ward bulletin',
    'meeting agenda',
    'hymns',
    'bishopric',
    'program',
  ],
  authors: [{ name: 'Boluwatife Alewi' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Sacrament Meeting Planner',
    title: 'Sacrament Meeting Planner',
    description: siteDescription,
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sacrament Meeting Planner',
    description: siteDescription,
  },
};

/**
 * The Header shows today's date, which is request-time data. Without this the
 * landing page would prerender at build time and keep serving the build date
 * for as long as the deployment lives. Every page that queries the database is
 * already dynamic, so this costs almost nothing.
 */
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${playfair.variable} flex min-h-screen flex-col`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-900 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
