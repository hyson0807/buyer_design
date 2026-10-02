'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { SamplePrice } from '@/components/product/SamplePrice';
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
  // 제목의 마지막 낱말 — 화살표와 함께 줄바꿈되지 않게 묶어 둘 조각이다.
  const words = product.name.split(' ');
  const tail = words.pop() ?? '';
  const head = words.length ? `${words.join(' ')} ` : '';

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
            'relative aspect-[4/4.6] overflow-hidden rounded-none bg-field transition-shadow',
            selected && 'outline outline-[1.5px] outline-offset-[3px] outline-ink',
          )}
        >
          <SafeImage
            src={product.image}
            alt={product.name}
            name={product.name}
            accent={accent}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <div className="pt-3.5">
          {/*
            "새 탭으로 나간다"는 신호는 **제품명 옆 화살표 하나**다.
            ⚠️ 예전에는 사진 위에 흰 알약 배지("View on KLOW")를 얹었는데, 터치 기기에는
               hover 가 없어 모바일에서 늘 보이게 둘 수밖에 없었다 — 그러면 그리드의
               모든 사진마다 스티커가 하나씩 붙는다(제품 5개면 5개). 화살표는 같은 사실을
               말하면서 사진을 건드리지 않고, hover 유무로 갈리지도 않아 기기별 분기가
               통째로 사라진다.
            ⚠️ 제목 자리 높이를 두 줄로 못 박는다. 한 줄짜리 이름과 두 줄짜리 이름이 섞이면
               같은 행에서 가격 줄의 기준선이 어긋난다.
          */}
          <p className="line-clamp-2 min-h-[2.7em] text-[14px] leading-[1.35] text-ink sm:text-[14.5px]">
            {head}
            {/*
              ⚠️ 화살표는 **마지막 낱말과 한 덩어리로 묶는다.** 그냥 이어 붙이면 이름이
                 줄 끝에 딱 맞는 제품에서 화살표만 다음 줄로 떨어져(고아), 두 줄로 못
                 박아 둔 제목 칸이 세 줄이 되면서 같은 행의 가격 기준선이 어긋난다
                 (실측: 1024px 에서 4개 중 2개가 그랬다).
            */}
            <span className="whitespace-nowrap">
              {tail}
              <ArrowUpRight
                className="ml-1 inline-block h-3.5 w-3.5 align-[-1px] text-mute transition-colors group-hover:text-ink"
                strokeWidth={2.25}
              />
            </span>
          </p>
          {/* 도매가(= 샘플가)가 주인공, 소매가는 RRP 참고값 — SamplePrice 주석 참고. */}
          <SamplePrice product={product} />
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
          'absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center border transition',
          'before:absolute before:-inset-2 before:content-[""] sm:before:hidden',
          selected
            ? 'border-ink bg-ink text-white'
            // ⚠️ 미선택 원을 불투명 흰색으로 두면 사진마다 흰 점이 하나씩 찍혀 그리드가
            //    시끄러워진다. 반대로 완전히 투명하게 두면 흰 배경 사진에서 원이 사라져,
            //    이 페이지의 주된 동작(체크)을 찾을 수 없다. 어둡게 눌러 둔 안쪽 +
            //    흰 테두리 + 바깥쪽 잉크 링 1px 이면 밝은 사진과 어두운 사진 양쪽에서
            //    윤곽만 또렷하게 남는다.
            : 'border-white bg-ink/20 text-transparent ring-1 ring-ink/15 backdrop-blur-[2px] hover:bg-ink/50 hover:text-white',
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
