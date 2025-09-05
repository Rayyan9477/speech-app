import { Urbanist, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-provider';
import '@/index.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
});
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'AI Language Processor',
  description: 'AI-powered speech processing application',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#5546FF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${urbanist.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="voicify-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
