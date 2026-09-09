'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePathname } from 'next/navigation';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAppActions, useAppState } from '@/lib/store';

export function Header() {
  const { buyer, requests, hydrated } = useAppState();
  const { openAuth } = useAppActions();
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-[10px]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-6 md:gap-8 md:px-10 lg:px-15">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-display text-[19px] font-bold tracking-[-0.02em] text-ink"
        >
          KLOW
          {/* KLOW 시그니처 그라데이션은 이 워드마크 한 곳에만 쓴다.
              ⚠️ 좁은 화면에서는 접미사를 숨긴다 — 안 그러면 워드마크가 두 줄이 되어
                 헤더 높이(64px)가 무너지고 우측 네비까지 밀려 내려간다. */}
          <span className="klow-mark hidden sm:inline"> for Buyers</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="shrink-0 rounded-[10px] px-3 py-2 text-[14px] font-medium text-sub transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            Brands
          </Link>

          {/*
            ⚠️ hydrated 가 false 인 동안에는 고정 폭 빈칸을 둔다.
               localStorage 를 읽기 전이라 로그인 여부를 알 수 없는데, 여기서 Sign in 을
               먼저 그리면 세션이 복원되는 순간 버튼이 바뀌며 레이아웃이 튄다.
          */}
          {!hydrated ? (
            <span aria-hidden className="h-11 w-[92px]" />
          ) : buyer ? (
            <>
              <Link
                href="/requests"
                aria-label="My requests"
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-[14px] font-medium text-sub transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                <MessageSquare className="h-4 w-4" strokeWidth={2} />
                <span className="hidden sm:inline">My requests</span>
                {requests.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-accent-pale px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-accent-strong">
                    {requests.length}
                  </span>
                )}
              </Link>
              {/*
                프로필은 드롭다운이 아니라 페이지로 간다 — 회사 정보 + 기본 배송지라
                메뉴에 담기엔 크고, 로그아웃도 거기 있다(다른 곳엔 로그아웃이 없다).
                아바타는 이니셜뿐이다. 바이어 사진을 받는 화면이 없으므로 이미지 자리를
                만들면 영원히 빈 채로 남는다.
              */}
              <Link
                href="/profile"
                aria-label="Profile"
                title={buyer.companyName}
                className={cn(
                  'ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold transition-colors',
                  pathname === '/profile'
                    ? 'bg-ink text-white'
                    : 'bg-accent-pale text-accent-strong hover:bg-accent/20',
                )}
              >
                {initials(buyer.fullName)}
              </Link>
            </>
          ) : (
            <Button size="sm" onClick={() => openAuth()} className="ml-2">
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
