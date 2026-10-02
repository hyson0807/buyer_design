'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FREE_SHIPPING_SKUS } from '@/lib/sampling';
import { cn } from '@/lib/utils';

/**
 * 히어로 바로 아래의 검정 섹션 — 샘플 프로그램. KLOW BUYER(klow-wholesale) 홈의
 * `#sampling` 섹션을 이 프로젝트의 토큰으로 옮겼다.
 *
 * 왼쪽은 안내문(소제목 + 제목 + 세 단계), 오른쪽은 어두운 사진.
 *   01 단품으로 고른다 → 02 5 SKU 를 채우면 무료배송 → 03 도매 수량으로 재주문
 *
 * 사진은 세 장이 히어로와 같은 리듬(7초 · 1.4초 페이드)으로 천천히 바뀐다.
 * 사진과 글 사이에는 **잉크색 → 투명 그라데이션**을 깔아 사진이 검정 벽에서 번져 나오듯
 * 이어지게 한다(lg 는 왼쪽 → 오른쪽, 모바일은 위 → 아래). 명패 아래에도 얕은 그늘 한 겹.
 * ⚠️ DESIGN §2 "사진 위에 그라데이션 없음" 의 **유일한 예외**다 — 진열창(브랜드·제품 사진)이
 *    아니라 분위기 사진이고, 글과 사진이 한 면으로 읽히게 하려는 자리라서 허용했다(2026-10-01).
 *    브랜드·제품 사진에는 여전히 아무것도 덮지 않는다.
 * ⚠️ 대문자 mono eyebrow 는 옮기지 않았다(DESIGN §3). 숫자는 `lib/sampling.ts` 상수만 쓴다.
 */
const STEPS = [
  {
    title: 'Choose single units',
    body: 'Pick any product in the collection. One unit is enough, priced exactly as your wholesale order will be.',
  },
  {
    title: `Reach ${FREE_SHIPPING_SKUS} SKUs`,
    body: `Combine products across brands. At ${FREE_SHIPPING_SKUS} SKUs, international shipping from Seoul is complimentary.`,
  },
  {
    title: 'Reorder at scale',
    body: 'Move what works into wholesale quantities, with documentation for your market prepared in advance.',
  },
];

/**
 * 분위기 사진 — Pexels 의 어두운 바닥 위 앰버 세럼 세 장. 브랜드 글자가 보이지 않는 것만 골랐다.
 * w=2000 으로 요청해 1440 폭의 절반 칸(≈700px)에서 2x 로도 선명하다.
 *
 * 사진마다 **명패**(브랜드 · 용량 / 제품명 / 도매가 + MSRP / 마케팅 지원)가 사진 왼쪽 아래에
 * 앉고, 사진과 함께 바뀐다. KLOW BUYER(klow-wholesale) 제품 카드 본문과 같은 구성이다.
 * ⚠️ 연출용 데모 데이터다 — 이 플랫폼의 mock-brands 와는 무관하고 링크도 없다.
 */
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;

const PHOTOS = [
  {
    src: pexels(12563412),
    alt: 'Amber serum bottle with a dropper held above it on a dark reflective surface',
    brand: 'Haeum Lab',
    size: '50 ml',
    name: 'Ceramide Barrier Cream',
    wholesale: '$9.80',
    msrp: '$26.00',
  },
  {
    src: pexels(18708751),
    alt: 'Amber dropper bottle resting on black stones',
    brand: 'Sooan',
    size: '30 ml',
    name: 'Red Ginseng Firming Serum',
    wholesale: '$14.50',
    msrp: '$42.00',
  },
  {
    src: pexels(8789609),
    alt: 'Amber glass bottle with a brass cap on a stone, against black',
    brand: 'Gyeol',
    size: '30 ml',
    name: 'Peptide Lift Ampoule',
    wholesale: '$13.90',
    msrp: '$48.00',
  },
];

const INTERVAL_MS = 7000;

export function SampleProgram() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), INTERVAL_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section id="sampling" className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 px-6 md:px-10 lg:grid-cols-2 lg:px-15">
        {/* 안내문 */}
        <div className="py-16 md:py-20 lg:py-28 lg:pr-16">
          <p className="text-[13px] font-normal text-white/50">The sample program</p>
          <h2 className="mt-4 max-w-[560px] font-display text-[32px] font-semibold leading-[1.06] tracking-[-0.025em] md:text-[40px] lg:text-[48px]">
            Test with confidence.
            <br />
            Commit when you&apos;re certain.
          </h2>
          <ol className="mt-12 border-t-2 border-white/90 lg:mt-14">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[56px_1fr] gap-4 border-b border-white/15 py-7"
              >
                <span className="pt-1.5 text-[12px] tabular-nums tracking-[0.08em] text-white/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-[20px] font-semibold tracking-[-0.02em] md:text-[22px]">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[420px] text-[14.5px] font-light leading-relaxed text-white/60">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/*
          사진 — 섹션 높이를 그대로 받는다(lg:h-full). 비율로 고정하면 왼쪽 글 높이와
          어긋나 아래에 구멍이 남는다(DESIGN §4). 모바일은 셸 좌우 여백을 벗어나 화면
          끝까지 닿게 `-mx-6` 로 당긴다.
          lg 에서는 글 칸의 pr-16 과 사진 왼쪽의 그라데이션이 만나 글 → 사진이 한 면이 된다.
        */}
        <div className="relative -mx-6 min-h-[360px] overflow-hidden bg-ink md:-mx-10 lg:mx-0 lg:h-full lg:min-h-[600px]">
          {PHOTOS.map((p, i) => (
            <div
              key={p.src}
              aria-hidden={i !== active}
              className={cn(
                'absolute inset-0 transition-opacity duration-[1600ms] ease-out',
                i === active ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
          ))}

          {/* 글 쪽에서 번져 나오는 그라데이션 — 잉크 → 투명. lg 는 가로, 그 아래는 세로. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgb(var(--c-ink)) 0%, rgb(var(--c-ink) / 0.55) 14%, rgb(var(--c-ink) / 0.18) 30%, rgb(var(--c-ink) / 0) 48%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, rgb(var(--c-ink)) 0%, rgb(var(--c-ink) / 0.72) 12%, rgb(var(--c-ink) / 0.32) 28%, rgb(var(--c-ink) / 0.08) 42%, rgb(var(--c-ink) / 0) 56%)',
            }}
          />
          {/* 캡션이 앉는 자리 — 바닥에서 올라오는 얕은 그늘. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
            style={{
              background:
                'linear-gradient(0deg, rgb(var(--c-ink) / 0.78) 0%, rgb(var(--c-ink) / 0.4) 45%, rgb(var(--c-ink) / 0) 100%)',
            }}
          />

          {/* 명패 — 사진과 같은 타이밍으로 바뀐다. 오버레이들보다 위에 둔다. */}
          <div className="absolute bottom-7 left-6 right-6 z-[1] md:left-8 lg:bottom-9 lg:left-10">
            {PHOTOS.map((p, i) => (
              <div
                key={p.src}
                aria-hidden={i !== active}
                className={cn(
                  'transition-opacity duration-[1600ms] ease-out',
                  i === active ? 'opacity-100' : 'pointer-events-none absolute inset-x-0 bottom-0 opacity-0',
                )}
              >
                <p className="text-[12px] text-white/60">
                  {p.brand} · {p.size}
                </p>
                <p className="mt-1 font-display text-[18px] font-semibold tracking-[-0.01em] text-white md:text-[20px]">
                  {p.name}
                </p>
                <p className="mt-1.5 flex items-baseline gap-2.5 tabular-nums">
                  <span className="text-[15px] font-medium text-white">{p.wholesale}</span>
                  <span className="text-[12px] text-white/55">MSRP {p.msrp}</span>
                </p>
                <p className="mt-3 flex items-center gap-2 text-[12px] text-white/80">
                  <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden />
                  Marketing support available
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
