'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { formatUsd } from '@/lib/format';
import { productUrl } from '@/lib/klow-web';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/lib/types';

/**
 * klow_web 브랜드관 카드 규격(aspect-[4/4.6] · object-cover)에 선택 토글을 얹었다.
 *
 * ⚠️ 카드가 **두 가지 일을 한다** — 본문 클릭은 klow_web 제품 상세로 나가고,
 *    우상단 체크 원만 샘플 요청 선택을 토글한다. 그래서 마크업이 `<a>` 안에 `<button>`
 *    이 아니라 **형제**로 놓여 있다(중첩은 유효하지 않은 HTML 이고 클릭이 겹친다).
 *
 * ⚠️ 상세는 반드시 **새 탭**으로 연다. 같은 탭이면 제품 하나 보고 돌아왔을 때
 *    골라 둔 선택이 통째로 날아간다(선택은 브랜드 페이지의 React state 다).
 *
 * 제품 상세(PDP)를 여기서 만들지 않는 이유: klow_web 에 이미 있고, 바이어가 상세를
 * 보려는 목적이면 소매 화면이 정본이다.
 */
export function ProductCard({
  product,
  brandSlug,
  accent,
  selected,
  onToggle,
}: {
  product: ProductListItem;
  brandSlug: string | null;
  accent?: string | null;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative min-w-0">
      <a
        href={productUrl(product.id, brandSlug)}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
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
          {/* 새 탭으로 나간다는 신호.
              ⚠️ 터치 기기에는 hover 가 없다 — hover 전용으로 두면 모바일 사용자는
                 카드를 누르면 사이트를 벗어난다는 사실을 **끝까지 알 수 없다.**
                 그래서 좁은 화면에서는 늘 보이고, 포인터가 있는 화면에서만 숨긴다. */}
          <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 text-[10.5px] font-semibold text-ink backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            View on KLOW
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
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
      </a>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={
          selected ? `Remove ${product.name} from request` : `Add ${product.name} to request`
        }
        className={cn(
          // ⚠️ 원 자체는 28px 로 두되 `before:-inset-2` 로 히트영역만 44px 로 넓힌다.
          //    원을 키우면 사진 위 점이 커져 갤러리가 시끄러워지고, 그냥 두면 손가락으로
          //    누르기엔 너무 작아 카드 본문(= 새 탭으로 이탈)이 대신 눌린다.
          'absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border transition',
          'before:absolute before:-inset-2 before:content-[""] sm:before:hidden',
          selected
            ? 'border-ink bg-ink text-white'
            : 'border-white/70 bg-white/70 text-transparent backdrop-blur-sm hover:border-ink/40 hover:text-ink/30',
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
