import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PNG to WebP Converter - Online Image Format Conversion',
  description: 'Fast, secure PNG to WebP image format conversion. Support batch processing, quality adjustment, completely processed in browser, protecting your privacy.',
  keywords: 'PNG, WebP, image conversion, format conversion, online tool, batch processing, image compression',
  authors: [{ name: 'wengxiaoxiong' }],
  creator: 'wengxiaoxiong',
  publisher: 'wengxiaoxiong',
  robots: 'index, follow',
  openGraph: {
    title: 'PNG to WebP Converter',
    description: 'Fast, secure PNG to WebP image format conversion',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNG to WebP Converter',
    description: 'Fast, secure PNG to WebP image format conversion',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
