'use client';

import Link from 'next/link';
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
          {/*
            ⚠️⚠️ 접미사에 분홍→보라 그라데이션을 **쓰지 않는다.** 무채색 위에 얹힌
                 그라데이션 글자는 화면에서 가장 강한 요소가 되어, 사진이 주인공이라는
                 이 디자인의 전제를 헤더가 먼저 깬다(스크롤 내내 따라다닌다).
                 위계는 색이 아니라 **굵기와 밝기**로 만든다 — KLOW 는 굵은 잉크,
                 접미사는 보통 굵기의 회색.
            ⚠️ 좁은 화면에서는 접미사를 숨긴다 — 안 그러면 워드마크가 두 줄이 되어
               헤더 높이(64px)가 무너지고 우측 네비까지 밀려 내려간다.
          */}
          <span className="hidden font-medium text-mute sm:inline"> for Buyers</span>
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
                {/* ⚠️ 말풍선 아이콘을 두지 않는다. 좁은 화면에서 라벨을 숨기느라 아이콘을
                       뒀던 것인데, 그러면 같은 링크가 폭에 따라 아이콘이었다 글자였다
                       한다. 라벨을 짧게(Requests) 줄이면 320px 에서도 글자로 남는다. */}
                <span>Requests</span>
                {/* ⚠️ 개수를 보라 알약으로 두면 헤더에 워드마크 말고 유채색이 하나 더
                       생겨, 스크롤 내내 그리드보다 먼저 보인다. 숫자만 남긴다. */}
                {requests.length > 0 && (
                  <span className="tabular-nums text-mute">{requests.length}</span>
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
                    : 'border border-line bg-surface text-sub hover:border-ink/40 hover:text-ink',
                )}
              >
                {initials(buyer.fullName)}
              </Link>
            </>
          ) : (
            /* ⚠️ 헤더의 Sign in 은 **주 CTA 가 아니다.** 채운 보라로 두면 홈에서 가장
                  강한 색 덩어리가 화면 우상단에 고정돼, 브랜드 사진 그리드보다 먼저
                  읽힌다. 이 앱에서 채운 보라는 "지금 이 화면에서 할 일"(Request
                  samples · Send request · Continue)에만 남긴다. */
            <Button variant="outline" size="sm" onClick={() => openAuth()} className="ml-2">
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
