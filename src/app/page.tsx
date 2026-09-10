import { BrandGrid } from '@/components/brand/BrandGrid';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-8 md:px-10 md:pt-14 lg:px-15">
      {/* 풀스크린 히어로를 두지 않는다 — 바이어는 물건을 보러 온 사람이라
          한 화면을 지나가게 만들 이유가 없다. 인트로는 여기 여섯 줄로 끝낸다. */}
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-strong">
        K-Beauty sourcing
      </p>
      {/* ⚠️ 38px 를 모바일 최소 크기로 두면 360px 화면에서 이 문장이 넉 줄이 되어
          첫 화면이 제목만으로 채워진다. 브랜드 그리드가 주인공이므로 한 단 낮춘다. */}
      <h1 className="mt-3 max-w-[640px] font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[38px] md:text-[52px]">
        Korean indie beauty brands
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-sub sm:mt-4 sm:text-[16px]">
        Browse independent brands, request samples, and talk to the founders directly — no
        trade show, no middleman.
      </p>

      <BrandGrid />
    </div>
  );
}
