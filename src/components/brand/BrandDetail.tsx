'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductCard } from '@/components/product/ProductCard';
import { SampleRequestModal } from '@/components/request/SampleRequestModal';
import { brandIntro, parseBrandTags } from '@/lib/brand-tags';
import { categoryLabel } from '@/lib/categories';
import { getProducts } from '@/lib/mock-brands';
import { storefrontUrl } from '@/lib/klow-web';
import { useAppActions, useAppState, useBuyer } from '@/lib/store';
import type { BuyerBrand } from '@/lib/types';

export function BrandDetail({ brand }: { brand: BuyerBrand }) {
  const products = getProducts(brand.id); // @PORT(api): GET /v1/products?brandId=
  const buyer = useBuyer();
  const { openAuth, setPendingIntent, clearPendingIntent } = useAppActions();
  const { pendingIntent } = useAppState();

  const [selected, setSelected] = useState<string[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);

  // ⚠️ tagline 은 태그 마커 문자열이다. 소개문은 description.
  const tags = parseBrandTags(brand.tagline);
  const storefront = storefrontUrl(brand.slug);

  /**
   * 가입/로그인을 마치면 보관해 둔 의도를 소비해 요청 폼을 그대로 이어 연다.
   * ⚠️ brandId 를 확인하지 않으면 다른 브랜드에서 남긴 의도가 여기서 열린다.
   */
  useEffect(() => {
    if (!buyer || !pendingIntent || pendingIntent.brandId !== brand.id) return;
    setSelected(pendingIntent.productIds);
    setRequestOpen(true);
    clearPendingIntent();
  }, [buyer, pendingIntent, brand.id, clearPendingIntent]);

  /**
   * 진입점은 둘(상단 CTA · sticky 선택 바)이지만 폼은 하나다.
   * 미로그인이면 의도를 저장해 두고 인증 모달을 연다 — 로그인 후 고른 제품이 살아남는다.
   */
  const requestSamples = (productIds: string[]) => {
    if (!buyer) {
      setPendingIntent({ brandId: brand.id, productIds });
      openAuth();
      return;
    }
    setSelected(productIds);
    setRequestOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-6 md:px-10 md:pb-24 md:pt-10 lg:px-15">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sub transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to brands
      </Link>

      {/*
        브랜드 머리 = 사진 한 칸 + 정보 한 칸.
        ⚠️⚠️ 예전에는 제목·소개가 **그리드 위**에 가로로 놓이고 그 아래에서 사진·팩트가
             갈렸다. 그러면 1440px 에서 제목 블록 오른쪽(700×240)이 통째로 비고, 사진이
             팩트보다 90px 더 길어 오른쪽 아래에도 구멍이 하나 더 생긴다 — 한 화면에
             빈 사각형이 둘이었다.
             지금은 lg 에서 사진이 왼쪽 한 칸을 **두 줄에 걸쳐** 차지하고, 오른쪽 칸에
             제목·소개(1행)와 팩트·CTA(2행)가 쌓인다. 두 칸이 같은 높이에서 끝난다.
        ⚠️ DOM 순서는 좁은 화면 기준(제목 → 사진 → 팩트)이고 자리는 `lg:col/row-start`
           로만 바꾼다. 순서를 바꾸면 모바일에서 사진보다 스펙표가 먼저 온다.
        ⚠️ 사진은 lg 에서 비율이 아니라 `h-full` 이다 — 정보 칸 높이가 브랜드마다
           다른데(인증·수출국 줄 수가 다르다) 비율로 고정하면 어느 브랜드에서는 사진이
           남고 어느 브랜드에서는 모자란다.
      */}
      <div className="mt-5 grid grid-cols-1 gap-8 md:mt-7 md:gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8">
        <header className="lg:col-start-2 lg:row-start-1">
          <h1 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[38px] lg:text-[42px]">
            {brand.name}
          </h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-sub sm:text-[16px]">
            {brandIntro(brand)}
          </p>
          {/*
            ⚠️ 태그를 보라 알약으로 두지 말 것. 제품 사진이 화면의 주인공인데 유채색 알약
               셋이 얹히면 페이지에서 가장 먼저 읽히는 것이 태그가 된다. 소개문 다음의
               조용한 한 줄이면 같은 정보를 주면서 시선 순서를 사진 → 이름 → 소개 →
               태그로 되돌린다.
          */}
          {tags.length > 0 && (
            <p className="mt-3 text-[13px] text-mute">{tags.join('  ·  ')}</p>
          )}
        </header>

        <div className="relative aspect-[4/3] overflow-hidden bg-field lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:aspect-auto lg:h-full lg:min-h-[460px]">
          <SafeImage
            src={brand.heroImage}
            alt={brand.name}
            name={brand.name}
            accent={brand.accentColor}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="lg:col-start-2 lg:row-start-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-mute">
            Brand facts
          </h2>
          <dl className="mt-4">
            <Fact label="Founded" value={String(brand.yearFounded)} />
            <Fact label="Categories" value={brand.categoryKeys.map(categoryLabel).join(', ')} />
            <Fact label="Minimum order" value={`${brand.moqUnits} units`} />
            <Fact label="Lead time" value={`${brand.leadTimeDays} days`} />
            <Fact label="Certifications" value={brand.certifications.join(', ')} />
            <Fact label="Exports to" value={brand.exportMarkets.join(', ')} />
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {/* ⚠️ 좁은 화면에서는 두 버튼이 한 줄을 반씩 나눠 갖는다 — `flex-wrap` 만
                두면 "View storefront" 가 혼자 다음 줄로 떨어져 어색하게 걸린다. */}
            <Button className="flex-1 sm:flex-none" onClick={() => requestSamples(selected)}>
              Request samples
            </Button>
            {/* 보조 액션 — 소매 화면(klow_web 브랜드관)에서 실제 판매 페이지를 확인한다.
                ⚠️ 새 탭으로 연다. 같은 탭이면 골라 둔 제품 선택이 날아간다. */}
            {storefront && (
              <a
                href={storefront}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-line bg-surface px-4 text-[15px] font-semibold text-ink transition-all hover:border-ink/40 active:scale-[0.99] sm:flex-none sm:px-5"
              >
                View storefront
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
              </a>
            )}
          </div>
          <p className="mt-2.5 text-[12.5px] text-mute">
            Samples are free. The brand ships from Korea and answers you here.
          </p>
        </div>
      </div>

      <section className="mt-14 md:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {/* ⚠️ 제목 뒤에 숫자만 붙이면("Products 5") 제목의 일부처럼 붙어 읽힌다.
                 개수는 오른쪽 안내줄이 이미 문장으로 말하므로 여기서 뺀다. */}
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[22px]">
            Products
          </h2>
          {/*
            카드는 두 가지 일을 한다(체크 = 샘플 선택 / 본문 = KLOW 상세 열기). 후자는
            카드 위 "View on KLOW" 배지가 이미 말하므로, 여기서는 전자만 알려 준다 —
            둘 다 적으면 한 줄이 두 줄로 접히고 문장이 안내문처럼 길어진다.
          */}
          <p className="text-[12.5px] text-mute">
            <span className="tabular-nums">{products.length}</span> products · tick the ones you
            want sampled
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              brandSlug={brand.slug}
              accent={brand.accentColor}
              selected={selected.includes(p.id)}
              onToggle={() =>
                setSelected((prev) =>
                  prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                )
              }
            />
          ))}
        </div>
      </section>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-[10px]">
          {/*
            ⚠️ 좁은 화면에서는 "products" 를 떨어뜨려 `3 selected` 로 줄인다. 전체
               문구를 두면 360px 에서 두 줄로 접히며 바 높이가 75px 로 부푼다(실측).
            ⚠️ 바가 화면 바닥에 붙으므로 iOS 홈 인디케이터만큼 아래 여백을 더한다 —
               안 그러면 버튼 아래쪽이 인디케이터에 깔린다.
            ⚠️ 좌우 여백만 페이지 거터(24px)보다 4px 좁다. 320px 에서 개수·Clear·CTA 가
               한 줄에 들어가는 여유가 딱 그만큼이라, 되돌리면 개수 문구가 두 줄로
               접히며 바가 부푼다. 불투명한 오버레이라 그리드와의 4px 차는 보이지 않는다.
               (Button 의 px 를 className 으로 줄이는 방법은 안 통한다 — cn() 이
                tailwind-merge 가 아니라 단순 join 이다.)
          */}
          <div className="mx-auto flex max-w-[1400px] items-center gap-1.5 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-6 sm:py-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-10 lg:px-15">
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-ink sm:text-[14px]">
              <span className="tabular-nums">{selected.length}</span>{' '}
              <span className="hidden sm:inline">
                {selected.length === 1 ? 'product' : 'products'}{' '}
              </span>
              selected
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              Clear
            </Button>
            <Button size="sm" onClick={() => requestSamples(selected)}>
              Request samples
            </Button>
          </div>
        </div>
      )}

      <SampleRequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        brand={brand}
        productIds={selected}
      />
    </div>
  );
}

/**
 * 스펙 한 줄. 라벨은 왼쪽, 값은 **오른쪽 끝에 맞춘다** — 값들이 같은 세로선에서
 * 끝나 표가 정돈돼 보이고, 라벨 칸 폭을 못 박지 않아도 된다.
 *
 * ⚠️ 예전에는 라벨 칸을 130px(좁은 화면 100px)로 고정했는데, 그러면 남는 폭이 118px
 *    뿐이라 `CPNP, Halal, ISO 22716` 같은 값이 두세 줄로 접혔다. `justify-between` 은
 *    값에 남는 폭을 전부 주므로 같은 값이 한 줄에 들어간다.
 * ⚠️ 그렇다고 라벨을 값 **위로** 올리지 말 것(2줄 배치) — 행 높이가 45 → 63px 로 늘어
 *    `2019` 같은 짧은 값까지 같이 커진다.
 */
function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-b-0 sm:py-3">
      <dt className="shrink-0 text-[13px] text-sub sm:text-[14px]">{label}</dt>
      <dd className="text-right text-[13.5px] font-medium text-ink sm:text-[14px]">{value}</dd>
    </div>
  );
}
