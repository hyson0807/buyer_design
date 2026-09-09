import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { Header } from '@/components/layout/Header';
import { AuthModalMount } from '@/components/auth/AuthModal';
import { DemoFooter } from '@/components/layout/DemoFooter';

export const metadata: Metadata = {
  title: {
    default: 'KLOW for Buyers — Source Korean indie beauty',
    template: '%s · KLOW for Buyers',
  },
  description:
    'Browse independent Korean beauty brands, request samples, and talk to the founders directly.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FAFAF9' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {/* 헤더가 fixed 라 본문 상단에 헤더 높이(64px)만큼 여백을 준다. */}
          <main className="pt-16">{children}</main>
          <DemoFooter />
          {/* 인증은 라우트가 아니라 전역 모달이다 — 브랜드 페이지를 떠나지 않아야
              선택해 둔 제품이 살아남는다. */}
          <AuthModalMount />
        </Providers>
      </body>
    </html>
  );
}
