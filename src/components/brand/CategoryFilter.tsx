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
}: {
  /** 단일 선택은 CategoryKey | null, 다중 선택은 CategoryKey[] */
  selected: CategoryKey | null | CategoryKey[];
  onSelect: (key: CategoryKey | null) => void;
  includeAll?: boolean;
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
        'relative shrink-0 py-2 text-[14px] transition-colors',
        isOn(key)
          ? 'font-semibold text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink'
          : 'font-normal text-sub hover:text-ink',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="scrollbar-hide -mx-1 flex items-center gap-6 overflow-x-auto px-1 lg:gap-8">
      {includeAll && item(null, 'All')}
      {CATEGORIES.map((c) => item(c.key, c.label))}
    </div>
  );
}
