'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BrandCard } from '@/components/brand/BrandCard';
import { optionLabel } from '@/lib/concierge';
import { matchBrands } from '@/lib/matching';
import { getBrands } from '@/lib/mock-brands';
import { useAppState } from '@/lib/store';

/**
 * 매칭에 답한 바이어에게만 보이는 쇼트리스트(홈, 전체 브랜드 위).
 * 답이 없으면 아무것도 그리지 않는다 — 빈 초대 상자를 두지 않는다(히어로가 이미 초대한다).
 */
export function MatchedBrands() {
  const { match, hydrated } = useAppState();
  const results = useMemo(() => (match ? matchBrands(match, getBrands()) : []), [match]);

  if (!hydrated || !match || results.length === 0) return null;

  return (
    <section id="for-you" className="scroll-mt-24 pb-16 pt-10 md:pb-20">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-ink md:text-[28px]">
            Selected for your business
          </h2>
          <p className="mt-2 text-[14px] font-light text-sub">
            {optionLabel('kind', match.kind)} · {optionLabel('region', match.region)} ·{' '}
            {match.needs.map((n) => optionLabel('needs', n)).join(', ')}
          </p>
        </div>
        <Link href="/match" className="text-[14px] text-ink underline underline-offset-4 hover:opacity-70">
          Change answers
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {results.map(({ brand, reasons }) => (
          // 카드 캡션은 왼쪽 이유 · 오른쪽 가격이라 이유는 가장 강한 하나만 보낸다.
          <BrandCard key={brand.id} brand={brand} reason={reasons[0]} />
        ))}
      </div>
    </section>
  );
}
