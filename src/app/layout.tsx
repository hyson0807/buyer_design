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
  // 홈 상단 문장과 같은 말을 한다 — 검색 결과와 첫 화면이 다른 약속을 하지 않게.
  description:
    'Pick the products you want to try. The brand packs the samples and ships them to you from Korea.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FAFAF9' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {/*
            헤더가 fixed 라 본문 상단에 헤더 높이(64px)만큼 여백을 준다.
            ⚠️ 셸을 `flex min-h-screen` 으로 두고 main 에 `flex-1` 을 준다 — 안 그러면
               내용이 짧은 화면(요청 목록·빈 상태)에서 푸터가 화면 중간에 뜨고 그 아래로
               바닥색만 남아 페이지가 잘린 것처럼 보인다.
          */}
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 pt-16">{children}</main>
            <DemoFooter />
          </div>
          {/* 인증은 라우트가 아니라 전역 모달이다 — 브랜드 페이지를 떠나지 않아야
              선택해 둔 제품이 살아남는다. */}
          <AuthModalMount />
        </Providers>
      </body>
    </html>
  );
}
