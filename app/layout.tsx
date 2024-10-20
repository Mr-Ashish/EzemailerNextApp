import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'EzeEmail - Simplify Your Email Template Conversion',
  description:
    'Effortlessly convert HTML templates into email-compatible versions with EzEmail by MicroAppLab. Optimize your email campaigns with validation and customization features.',
  keywords: [
    'EzeEmail',
    'Email Template Conversion',
    'HTML to Email HTML',
    'Email Marketing Tool',
    'MicroAppLab',
  ],
  authors: [{ name: 'MicroAppLab', url: 'https://microapplab.com' }],
  creator: 'MicroAppLab',
  themeColor: '#04616B', // Your brand color
  icons: {
    icon: '/favicon.ico',
    // apple: '/apple-touch-icon.png',
    // shortcut: '/favicon-16x16.png',
  },
  openGraph: {
    title: 'EzEmail - Convert HTML Templates to Email-Compatible HTML',
    description:
      'Use EzEmail to transform your HTML templates into email-ready formats. Validate across email clients and streamline your marketing efforts.',
    url: 'https://ezemail.microapplab.com',
    siteName: 'EzEmail by MicroAppLab',
    images: [
      {
        url: 'https://app.microapplab.com/envelope.svg', // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: 'EzeEmail Tool Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'EzEmail - Streamline Your Email Campaigns',
  //   description:
  //     'Simplify email template conversion with EzEmail. Validate and customize for optimal email marketing performance.',
  //   images: ['https://ezemail.microapplab.com/twitter-image.jpg'], // Replace with your actual image URL
  //   creator: '@MicroAppLab', // Replace with your actual Twitter handle
  // },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>{children} </SessionProvider>
      </body>
    </html>
  );
}
