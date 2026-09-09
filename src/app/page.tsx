import { BrandGrid } from '@/components/brand/BrandGrid';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-14 md:px-10 lg:px-15">
      {/* 풀스크린 히어로를 두지 않는다 — 바이어는 물건을 보러 온 사람이라
          한 화면을 지나가게 만들 이유가 없다. 인트로는 여기 여섯 줄로 끝낸다. */}
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-strong">
        K-Beauty sourcing
      </p>
      <h1 className="mt-3 max-w-[640px] font-display text-[38px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[52px]">
        Korean indie beauty brands
      </h1>
      <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-sub">
        Browse independent brands, request samples, and talk to the founders directly — no
        trade show, no middleman.
      </p>

      <BrandGrid />
    </div>
  );
}
