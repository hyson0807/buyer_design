'use client';

import { Check } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { formatUsd } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/lib/types';

/**
 * klow_web 브랜드관 카드 규격(aspect-[4/4.6] · object-cover)에 선택 토글을 얹었다.
 * 제품 상세 페이지(PDP)는 만들지 않는다 — 바이어는 사는 게 아니라 샘플을 고르는 중이고,
 * 카드 + 선택만으로 플로우가 완결된다.
 */
export function ProductCard({
  product,
  accent,
  selected,
  onToggle,
}: {
  product: ProductListItem;
  accent?: string | null;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="group block w-full text-left"
    >
      <div
        className={cn(
          'relative aspect-[4/4.6] overflow-hidden rounded-[10px] bg-field transition-shadow',
          selected && 'ring-2 ring-ink ring-offset-2 ring-offset-bg',
        )}
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          name={product.name}
          accent={accent}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <span
          className={cn(
            'absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border transition',
            selected
              ? 'border-ink bg-ink text-white'
              : 'border-white/70 bg-white/70 text-transparent backdrop-blur-sm group-hover:border-ink/40',
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </div>
      <div className="pt-2.5">
        <p className="line-clamp-2 text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
          {product.name}
        </p>
        <p className="mt-1 text-[12.5px] font-medium text-sub">
          {/* 소매가 참고값이다 — 바이어의 도매가는 브랜드와 채팅에서 협의한다. */}
          {formatUsd(product.customerPriceUsd)}
          <span className="ml-1 text-mute">retail</span>
        </p>
      </div>
    </button>
  );
}
