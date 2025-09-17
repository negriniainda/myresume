import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// import { I18nProvider } from '@/components/providers/I18nProvider';
import StructuredData from '@/components/seo/StructuredData';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: 'Marcelo Negrini - Professional Resume',
    template: '%s | Marcelo Negrini',
  },
  description: 'AI & Technology Leadership Expert - Interactive bilingual resume showcasing professional experience in digital transformation, team leadership, and strategic innovation.',
  keywords: [
    'AI Leadership',
    'Technology Executive',
    'Digital Transformation',
    'Team Leadership',
    'Strategic Innovation',
    'Bilingual Professional',
    'Resume',
    'Portfolio',
  ],
  authors: [{ name: 'Marcelo Negrini' }],
  creator: 'Marcelo Negrini',
  publisher: 'Marcelo Negrini',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://marcelonegrini.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'pt-BR': '/pt',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Marcelo Negrini - Professional Resume',
    description: 'AI & Technology Leadership Expert - Interactive bilingual resume',
    siteName: 'Marcelo Negrini Resume',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Marcelo Negrini - Professional Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcelo Negrini - Professional Resume',
    description: 'AI & Technology Leadership Expert - Interactive bilingual resume',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'M. Negrini Resume',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="M. Negrini Resume" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="M. Negrini Resume" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Critical CSS will be inlined here by build process */}
        
        {/* Structured Data for SEO */}
        <StructuredData type="person" />
        <StructuredData type="website" />
        <StructuredData type="breadcrumb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {children}
        
        {/* Performance Monitor - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div id="performance-monitor" />
        )}
        
        {/* Analytics and Performance Monitoring */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Performance monitoring script */}
        <Script id="performance-monitoring" strategy="afterInteractive">
          {`
            // Critical performance monitoring
            if ('performance' in window && 'PerformanceObserver' in window) {
              // Monitor LCP
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (window.gtag) {
                  gtag('event', 'performance', {
                    event_category: 'core_web_vitals',
                    event_label: 'LCP',
                    value: Math.round(lastEntry.startTime)
                  });
                }
              }).observe({ entryTypes: ['largest-contentful-paint'] });
              
              // Monitor CLS
              let clsValue = 0;
              new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                  }
                }
                if (window.gtag) {
                  gtag('event', 'performance', {
                    event_category: 'core_web_vitals',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000)
                  });
                }
              }).observe({ entryTypes: ['layout-shift'] });
              
              // Monitor FID
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                  const fid = entry.processingStart - entry.startTime;
                  if (window.gtag) {
                    gtag('event', 'performance', {
                      event_category: 'core_web_vitals',
                      event_label: 'FID',
                      value: Math.round(fid)
                    });
                  }
                });
              }).observe({ entryTypes: ['first-input'] });
            }
            
            // Error tracking
            window.addEventListener('error', (event) => {
              if (window.gtag) {
                gtag('event', 'exception', {
                  description: event.message,
                  fatal: false
                });
              }
            });
            
            window.addEventListener('unhandledrejection', (event) => {
              if (window.gtag) {
                gtag('event', 'exception', {
                  description: 'Unhandled Promise Rejection: ' + event.reason,
                  fatal: false
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
