import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CaloAI - 拍照智能减脂助手',
  description: '基于视觉大模型与卡路里缺口模型的 iOS 极简减脂应用',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CaloAI',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="bg-black text-white antialiased select-none font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
