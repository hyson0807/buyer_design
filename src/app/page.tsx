import { BrandGrid } from '@/components/brand/BrandGrid';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { MatchCta } from '@/components/home/MatchCta';
import { MatchedBrands } from '@/components/home/MatchedBrands';
import { SampleProgram } from '@/components/home/SampleProgram';

/**
 * 홈 = 쇼룸 입구(안내문 + 진열창) → 검정 샘플 프로그램 섹션 → (매칭에 답했으면) 내 쇼트리스트
 *      → 전체 브랜드(카테고리 탭 + 4:5 그리드) → 샘플 받는 세 단계 → 검정 CTA → 검정 푸터.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SampleProgram />
      <div id="brands" className="mx-auto max-w-[1400px] scroll-mt-16 px-6 md:px-10 lg:px-15">
        <MatchedBrands />
        <section className="pb-20 pt-12 max-md:pb-15 max-md:pt-10">
          <BrandGrid />
        </section>
      </div>
      <HowItWorks />
      <MatchCta />
    </>
  );
}
