'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { getBrands, getFeaturedProducts } from '@/lib/mock-brands';
import { FREE_SHIPPING_SKUS } from '@/lib/sampling';
import { cn } from '@/lib/utils';

/**
 * 쇼룸 입구 — 왼쪽은 벽(바닥색)에 붙은 안내문, 오른쪽은 **액자처럼 걸린 사진 한 장**.
 *
 * ⚠️ 사진은 화면 끝까지 흘리지 않고 페이지 셸 안의 **박스**로 둔다(사방에 벽이 보인다).
 *    사진 위에는 아무것도 올리지 않는다 — 안개도, 명패도. 사진 아래 한 줄에 브랜드 이름과
 *    화살표만 두고, 사진·캡션 전체가 브랜드 페이지로 가는 링크다.
 *    (흰 명패에 제품명·가격·화살표 칸까지 넣었던 버전은 "짜친다"는 평으로 걷어냈다.)
 *
 * 말하는 것은 두 가지뿐이다.
 *   ① 샘플을 도매가로, 1개부터, 5 SKU 면 무료배송 → 제목 + 본문 한 단락
 *   ② 내 사업에 맞는 브랜드 찾기                    → 주 CTA 하나 (보조 링크 없음)
 *
 * 모션은 이 페이지에 하나뿐이다 — 사진과 캡션이 함께 천천히 바뀐다.
 */
const INTERVAL_MS = 7000;
const FEATURED = 3;

/** 제품 썸네일 URL(w=500) 을 히어로용 고해상도로 바꾼다. 다른 파라미터는 그대로 둔다. */
function hiRes(url: string): string {
  return url.replace(/([?&])w=\d+/, '$1w=1800').replace(/([?&])q=\d+/, '$1q=82');
}

export function Hero() {
  const brandCount = getBrands().length;
  // 액자에는 브랜드 대표 제품을 건다 — 바로 아래 그리드의 브랜드 사진과 겹치지 않는다.
  const featured = getFeaturedProducts(FEATURED);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % featured.length), INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [featured.length]);

  const { brand: current } = featured[active];

  return (
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-y-10 px-6 pb-12 pt-10 md:px-10 md:pt-14 lg:h-[calc(100dvh-4rem)] lg:max-h-[880px] lg:min-h-[640px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-x-16 lg:px-15 lg:py-12">
      {/* 벽 — 안내문. */}
      <div className="flex flex-col justify-center lg:pr-6">
        <h1 className="max-w-[560px] font-display text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] text-ink sm:text-[48px] lg:text-[54px] xl:text-[60px]">
          Korean indie beauty, sampled at wholesale.
        </h1>
        <p className="mt-6 max-w-[460px] text-[15.5px] font-light leading-relaxed text-sub md:text-[17px]">
          {brandCount} brands, every one ready to ship a single unit at the price you would pay
          on a first order. Pick {FREE_SHIPPING_SKUS} SKUs from one brand and shipping from Korea is
          on us.
        </p>
        <div className="mt-9">
          <Link
            href="/match"
            className="inline-flex h-[52px] w-full items-center justify-center whitespace-nowrap bg-ink px-10 text-[14px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-ink/85 sm:w-auto"
          >
            Find brands for your business
          </Link>
        </div>
      </div>

      {/*
        사진 한 장 + 아래 캡션(브랜드 이름 · 화살표). 전체가 링크다.
        ⚠️ 사진은 **정사각형**이다. lg 에서 한 변 = min(칸 폭, 화면 높이 − 헤더·여백·캡션(13rem)).
           폭을 먼저 정하고(`w-[min(...)]`) `aspect-square` 로 높이가 따라온다. 링크는 칸의
           오른쪽 끝에 붙인다(`justify-self-end`). 높이에서 폭을 유도하는 방식(flex-1 + aspect)은
           Chrome 에서 폭이 0 으로 접혀 세로 띠가 됐다(실측) — 되돌리지 말 것.
      */}
      <Link
        href={`/brands/${current.slug}`}
        className="group flex w-full flex-col lg:w-[min(100%,calc(100dvh-13rem))] lg:max-w-[760px] lg:justify-self-end lg:self-center"
        aria-label={`Open ${current.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-field">
          {featured.map(({ brand: b, product: p }, i) => (
            <div
              key={p.id}
              aria-hidden={i !== active}
              className={cn(
                'absolute inset-0 transition-opacity duration-[1400ms] ease-out',
                i === active ? 'opacity-100' : 'opacity-0',
              )}
            >
              <SafeImage
                src={hiRes(p.image)}
                alt={`${b.name} ${p.name}`}
                name={b.name}
                accent={b.accentColor}
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 760px"
              />
            </div>
          ))}
        </div>
        <div
          key={current.id}
          className="flex shrink-0 animate-fade-in items-center justify-between gap-4 pt-4"
        >
          <span className="truncate font-display text-[16px] font-semibold tracking-[-0.01em] text-ink">
            {current.name}
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-ink transition-transform duration-300 ease-out group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </div>
      </Link>
    </section>
  );
}
