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

      <header className="mt-6 md:mt-8">
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent-pale px-2.5 py-1 text-[11.5px] font-semibold text-accent-strong"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[38px] md:text-[48px]">
          {brand.name}
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-sub sm:mt-4 sm:text-[16px]">
          {brandIntro(brand)}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-12 md:gap-10 lg:grid-cols-2 lg:gap-25">
        {/* 좁은 화면에서 aspect-square 는 폭만큼 높아져 900px 에서 850px 짜리 사진이 된다.
            2컬럼이 되는 lg 이상에서만 정사각으로 둔다. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-field lg:sticky lg:top-24 lg:aspect-square lg:self-start">
          <SafeImage
            src={brand.heroImage}
            alt={brand.name}
            name={brand.name}
            accent={brand.accentColor}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
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
            Free samples, shipped from Korea. The brand replies in chat.
          </p>
        </div>
      </div>

      <section className="mt-14 md:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[22px]">
            Products <span className="font-normal tabular-nums text-mute">{products.length}</span>
          </h2>
          {/* 카드가 두 가지 일을 하므로(선택 / 상세 열기) 한 줄로 알려 준다. */}
          <p className="text-[12.5px] text-mute">
            Tick to add to your sample request · click a product to view it on KLOW
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
 * ⚠️ 라벨 130px + 간격 24px 를 좁은 화면에서 그대로 두면 값에 남는 폭이 118px 뿐이라
 *    `CPNP, Halal, ISO 22716` 같은 값이 두세 줄로 접힌다. 그렇다고 라벨을 값 **위로**
 *    올리면(2줄 배치) 행 높이가 45 → 63px 로 늘어 `2017` 같은 짧은 값까지 같이 커진다.
 *    그래서 한 줄을 유지하되 좁은 화면에서 라벨 칸만 100px 로 줄인다 — 가장 긴 라벨
 *    (`Certifications`)과 가장 긴 값(`CPNP, FDA, ISO 22716`)이 둘 다 한 줄에 들어간다.
 */
function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 border-b border-line py-2.5 last:border-b-0 sm:gap-6 sm:py-3">
      <dt className="w-[100px] shrink-0 text-[13px] text-sub sm:w-[130px] sm:text-[14px]">
        {label}
      </dt>
      <dd className="text-[13.5px] font-medium text-ink sm:text-[14px]">{value}</dd>
    </div>
  );
}
