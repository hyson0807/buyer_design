'use client';

import { useMemo, useState } from 'react';
import { BrandCard } from '@/components/brand/BrandCard';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import type { CategoryKey } from '@/lib/categories';
import { getBrands } from '@/lib/mock-brands';

export function BrandGrid() {
  const [category, setCategory] = useState<CategoryKey | null>(null);
  // @PORT(api): getBrands() → useQuery(qk.brands). 목데이터는 동기라 스켈레톤이 필요 없다.
  const brands = getBrands();

  const visible = useMemo(
    () => (category ? brands.filter((b) => b.categoryKeys.includes(category)) : brands),
    [brands, category],
  );

  return (
    <>
      <div className="mt-10 border-b border-line">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/*
        ⚠️ cosmed-web 은 Tailwind v4 에 브레이크포인트를 재정의(md=992)해서 `max-md:` 를 쓴다.
           v3 로 그대로 옮기면 768–991px 구간이 조용히 깨지므로 모바일 우선으로 다시 썼다.
      */}
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-4 md:mt-8 lg:grid-cols-3 lg:gap-6">
        {visible.map((brand, i) => (
          <BrandCard key={brand.id} brand={brand} priority={i < 6} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-20 text-center text-[14px] text-sub">No brands in this category yet.</p>
      )}
    </>
  );
}
