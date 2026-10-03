import type { Metadata, Viewport } from 'next';
import '../styles.css';

export const metadata: Metadata = {
  title: '简言 Saylit · 让好内容，流动起来',
  description: '轻松写作，随心排版。30 套原创主题，实时预览，一键复制公众号。',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#3756c5'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
