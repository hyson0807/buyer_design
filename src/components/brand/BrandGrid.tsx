'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, X } from 'lucide-react';
import { BrandCard } from '@/components/brand/BrandCard';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import { Button } from '@/components/ui/Button';
import type { CategoryKey } from '@/lib/categories';
import { parseBrandTags } from '@/lib/brand-tags';
import { getBrands, getProducts } from '@/lib/mock-brands';
import { cn } from '@/lib/utils';

/** 찾는 게 없을 때 가는 곳. 검색어를 그대로 들고 가 폼을 미리 채운다. */
export function requestBrandHref(query: string): string {
  const q = query.trim();
  return q ? `/request-brand?q=${encodeURIComponent(q)}` : '/request-brand';
}

export function BrandGrid() {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [query, setQuery] = useState('');
  // @PORT(api): getBrands() → useQuery(qk.brands). 목데이터는 동기라 스켈레톤이 필요 없다.
  const brands = getBrands();

  /**
   * 브랜드 이름만 보지 않는다 — 바이어는 대개 제품("cleansing balm")이나 성분("ginseng")으로
   * 찾는다. 이름 · 소개 · 태그 · 제품명을 한 덩어리 소문자 문자열로 미리 만들어 둔다.
   * @PORT(api): 실서버에서는 GET /v1/brands?q= 로 넘긴다.
   */
  const index = useMemo(
    () =>
      new Map(
        brands.map((b) => [
          b.id,
          [b.name, b.description, ...parseBrandTags(b.tagline), ...getProducts(b.id).map((p) => p.name)]
            .join(' ')
            .toLowerCase(),
        ]),
      ),
    [brands],
  );

  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      brands.filter(
        (b) =>
          (!category || b.categoryKeys.includes(category)) &&
          (!q || q.split(/\s+/).every((w) => index.get(b.id)!.includes(w))),
      ),
    [brands, category, q, index],
  );

  const noMatch = !!q && visible.length === 0;

  return (
    <>
      {/*
        ⚠️ 브랜드 개수를 두지 않는다 — "18 brands" 는 바이어에게 아무 결정도 돕지 않고,
           카탈로그가 작다는 인상만 준다. 그 자리는 검색창이 갖는다.
        좁은 화면에서는 카테고리 줄 아래로 검색창이 한 줄을 통째로 쓴다.
      */}
      <div className="mb-10 flex flex-col gap-5 max-md:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            // 결과가 없는 채로 Enter 를 누르면 바로 요청으로 넘어간다.
            if (noMatch) router.push(requestBrandHref(query));
          }}
          className={cn(
            'group flex h-11 w-full shrink-0 items-center gap-2.5 border-b transition-colors lg:w-[340px]',
            noMatch ? 'border-ink' : 'border-line focus-within:border-ink',
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-mute group-focus-within:text-ink" strokeWidth={1.75} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands, products, ingredients"
            aria-label="Search brands"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-light text-ink placeholder:text-mute focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {/*
            ⚠️ 결과가 없을 때 요청 버튼을 **검색창 안**에 둔다. 아래 빈 상태까지 내려가야
               보이면, 그리드가 사라진 걸 본 손님은 거기서 검색어를 지우고 끝낸다.
          */}
          {noMatch ? (
            <Link
              href={requestBrandHref(query)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 bg-ink px-3 text-[12.5px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-ink/85"
            >
              Request
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          ) : (
            query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-mute transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )
          )}
        </form>
      </div>

      {/*
        ⚠️ cosmed-web 은 Tailwind v4 에 브레이크포인트를 재정의(md=992)해서 `max-md:` 를 쓴다.
           v3 로 그대로 옮기면 768–991px 구간이 조용히 깨지므로 모바일 우선으로 다시 썼다.
      */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {visible.map((brand, i) => (
          <BrandCard key={brand.id} brand={brand} priority={i < 6} />
        ))}
      </div>

      {noMatch ? (
        <div className="pt-4 sm:pt-6">
          <p className="font-display text-[18px] font-semibold text-ink">
            &ldquo;{query.trim()}&rdquo; isn&rsquo;t on KLOW yet.
          </p>
          <p className="mt-2 max-w-[440px] text-[14px] font-light leading-relaxed text-sub">
            Tell us what you&rsquo;re looking for and our team in Seoul will reach out to the brand
            for you — usually within 5 business days.
          </p>
          <Button className="mt-6" onClick={() => router.push(requestBrandHref(query))}>
            Request this brand
          </Button>
        </div>
      ) : (
        visible.length === 0 && (
          <p className="py-20 text-center text-[14px] text-sub">No brands in this category yet.</p>
        )
      )}

      {/* 결과가 있어도 찾던 게 아닐 수 있다 — 검색 중일 때만 조용히 길을 하나 남긴다. */}
      {q && !noMatch && (
        <p className="mt-10 text-[13px] text-sub">
          Not what you&rsquo;re looking for?{' '}
          <Link href={requestBrandHref(query)} className="font-medium text-ink underline underline-offset-2">
            Request a brand from Korea
          </Link>
        </p>
      )}
    </>
  );
}
