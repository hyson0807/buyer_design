import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { categoryLabel } from '@/lib/categories';
import { formatUsd } from '@/lib/format';
import { sampleFromCents } from '@/lib/mock-brands';
import type { BuyerBrand } from '@/lib/types';

/**
 * 진열품 카드: aspect-[4/5] · object-cover · hover 시 이미지만 확대 · **모서리 0 · 그림자 0**.
 *
 * 샘플가(도매가)는 **사진 아래에서 올라오는 검정 띠**로 말한다 — 포인터를 올리면 사진 하단에
 * `Samples from $6.50` 가 슥 올라온다(`.card-reveal`, globals.css).
 *
 * ⚠️ 터치 기기에는 hover 가 없다. 그래서 띠는 `@media (hover: hover)` 에서만 동작하고,
 *    hover 가 없는 기기에서는 같은 값을 캡션 오른쪽에 **상시** 둔다(`.card-price-static`).
 *    폭이 아니라 **입력 방식**으로 가르므로 "hover 로 갈리는 신호" 규칙의 예외가 아니라
 *    그 규칙을 지키는 방법이다 — 어느 기기에서도 가격이 사라지지 않는다.
 *
 * 캡션은 이름 한 줄 + 분류(또는 매칭 이유) 한 줄. 모든 줄은 **한 줄로 못 박는다(truncate)** —
 * 2컬럼 모바일(카드 폭 ≈150px)에서 줄 수가 카드마다 달라지면 그리드 기준선이 어긋난다.
 *
 * `reason` 은 컨시어지 쇼트리스트에서만 넘어온다(왜 이 브랜드가 골라졌는지 한 줄).
 */
export function BrandCard({
  brand,
  priority,
  reason,
}: {
  brand: BuyerBrand;
  priority?: boolean;
  reason?: string;
}) {
  const from = sampleFromCents(brand.id);
  return (
    <Link href={`/brands/${brand.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-field">
        <SafeImage
          src={brand.heroImage}
          alt={brand.name}
          name={brand.name}
          accent={brand.accentColor}
          priority={priority}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-400 group-hover:scale-[1.04]"
        />
        {from !== null && (
          <div
            aria-hidden
            className="card-reveal absolute inset-x-0 bottom-0 flex h-11 items-center justify-between bg-ink px-4 text-[13px] text-white"
          >
            <span className="text-white/70">Samples from</span>
            <span className="font-medium tabular-nums">{formatUsd(from)}</span>
          </div>
        )}
      </div>
      <div className="py-4 max-md:py-3">
        <h3 className="truncate font-display text-[15px] font-normal text-ink">{brand.name}</h3>
        <p className="mt-1 flex items-baseline justify-between gap-3 text-[13px] font-light text-mute">
          <span className="truncate">{reason ?? categoryLabel(brand.categoryKeys[0])}</span>
          {from !== null && (
            <span className="card-price-static shrink-0 tabular-nums text-sub">
              from {formatUsd(from)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
