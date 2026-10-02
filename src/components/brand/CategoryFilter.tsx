'use client';

import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import { cn } from '@/lib/utils';

/**
 * 텍스트만 있는 밑줄형 필터 — 배경도 보더도 없다. 브랜드 이미지 그리드 바로 위에 놓이므로
 * 칩 형태로 만들면 그리드보다 시선을 먼저 가져간다.
 *
 * 홈(단일 선택)과 가입 폼의 "Categories of interest"(다중 선택)가 같은 컴포넌트를 쓴다.
 */
export function CategoryFilter({
  selected,
  onSelect,
  includeAll = true,
  wrap = false,
}: {
  /** 단일 선택은 CategoryKey | null, 다중 선택은 CategoryKey[] */
  selected: CategoryKey | null | CategoryKey[];
  onSelect: (key: CategoryKey | null) => void;
  includeAll?: boolean;
  /**
   * 폼 안의 다중 선택이면 `true`.
   *
   * ⚠️⚠️ 홈의 필터는 가로 스크롤이지만(그리드 위 한 줄로 눌러 둬야 한다), **폼 필드는
   *    반드시 줄바꿈**이다. 스크롤로 두면 390px 화면에서 `Mask` 뒤가 잘리고 스크롤바도
   *    숨겨져 있어(`scrollbar-hide`), 손님은 선택지가 넷뿐이라고 믿는다 — 고를 수 있는
   *    것을 못 보게 만드는 건 목록을 안 보여준 것과 같다.
   */
  wrap?: boolean;
}) {
  const multi = Array.isArray(selected);
  const isOn = (key: CategoryKey | null) =>
    multi ? key !== null && (selected as CategoryKey[]).includes(key) : selected === key;

  const item = (key: CategoryKey | null, label: string) => (
    <button
      key={key ?? 'all'}
      type="button"
      onClick={() => onSelect(key)}
      className={cn(
        'relative shrink-0 py-2 text-[14px] tracking-[0.01em] transition-colors max-md:py-1.5 max-md:text-[13px]',
        isOn(key)
          ? 'font-normal text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink'
          : 'font-light text-sub hover:text-ink',
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        '-mx-1 flex items-center px-1',
        wrap ? 'flex-wrap gap-x-6 gap-y-1' : 'scrollbar-hide gap-6 overflow-x-auto lg:gap-8',
      )}
    >
      {includeAll && item(null, 'All')}
      {CATEGORIES.map((c) => item(c.key, c.label))}
    </div>
  );
}
