import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PNG 转 WebP 工具 - 在线图片格式转换',
  description: '快速、安全地将 PNG 图片转换为 WebP 格式。支持批量处理、质量调节，完全在浏览器中处理，保护您的隐私。',
  keywords: 'PNG, WebP, 图片转换, 格式转换, 在线工具, 批量处理, 图片压缩',
  authors: [{ name: 'wengxiaoxiong' }],
  creator: 'wengxiaoxiong',
  publisher: 'wengxiaoxiong',
  robots: 'index, follow',
  openGraph: {
    title: 'PNG 转 WebP 工具',
    description: '快速、安全地将 PNG 图片转换为 WebP 格式',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNG 转 WebP 工具',
    description: '快速、安全地将 PNG 图片转换为 WebP 格式',
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
