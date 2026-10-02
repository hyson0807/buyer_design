import type { ReactNode } from 'react';

/**
 * 섹션 머리 — 제목 하나 + 회색 문장 하나, **왼쪽 정렬**.
 * 쇼룸의 안내판은 통로 입구에 붙는다. 가운데 정렬은 랜딩 페이지 문법이라 걷어냈다.
 */
export function SectionHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="max-w-[640px]">
      <h2 className="font-display text-[26px] font-semibold tracking-[-0.015em] text-ink md:text-[32px]">
        {title}
      </h2>
      {sub && <p className="mt-3 text-[15px] font-light leading-relaxed text-sub md:text-[16px]">{sub}</p>}
    </div>
  );
}
