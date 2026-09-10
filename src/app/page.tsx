import { BrandGrid } from '@/components/brand/BrandGrid';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-8 md:px-10 md:pt-14 lg:px-15">
      {/*
        풀스크린 히어로를 두지 않는다 — 바이어는 물건을 보러 온 사람이라 한 화면을
        지나가게 만들 이유가 없다. 인트로는 제목 한 줄 + 문장 하나로 끝낸다.

        ⚠️ 보라 대문자 eyebrow("K-BEAUTY SOURCING")를 두지 않는다. 카테고리 필터·그리드
           바로 위에서 유일한 유채색 덩어리가 되어, 사진보다 먼저 읽힌다. 같은 이유로
           제목도 52px 에서 한 단 내렸다 — 첫 화면의 절반을 글자가 가져가지 않게 한다.
        ⚠️ 38px 를 모바일 최소 크기로 두면 360px 화면에서 제목이 넉 줄이 된다.
      */}
      <h1 className="max-w-[640px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[34px] md:text-[42px]">
        Korean indie beauty brands
      </h1>
      <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-sub sm:text-[16px]">
        Pick the products you want to try. The brand packs the samples and ships them to you
        from Korea.
      </p>

      <BrandGrid />
    </div>
  );
}
