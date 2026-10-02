import { FREE_SHIPPING_SKUS } from '@/lib/sampling';
import { SectionHead } from '@/components/home/SectionHead';

/**
 * 샘플이 손에 들어오기까지의 세 단계. 쇼룸의 안내판이다 — 왜 좋은지(마케팅)가 아니라
 * 어떻게 하는지(길 안내)를 말한다. 번호는 실제 순서라서 붙인다.
 *
 * ⚠️ 예전의 "Why" 네 칸(큰 숫자 + 제목 + 문장)은 템플릿의 통계 블록처럼 읽혔고,
 *    네 칸 중 셋이 같은 약속(도매가·1개·5 SKU)을 쪼개 말하고 있었다. 여기서는 같은
 *    약속을 각 단계에서 자연스럽게 지나가며 말한다.
 */
const STEPS = [
  {
    title: 'Pick products on a brand page',
    body: 'Tick any product to add it to your request. One unit is enough; there is no minimum per SKU.',
  },
  {
    title: 'Send one request',
    body: 'Add where to ship and a note for the brand. Every sample is billed at the wholesale price you would pay on a first order.',
  },
  {
    title: 'Talk to the brand, receive samples',
    body: `The brand replies in your request thread. Pick ${FREE_SHIPPING_SKUS} SKUs or more from one brand and shipping from Korea is free.`,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-15">
        <SectionHead
          title="How sampling works"
          sub="Three steps from a brand page to samples on your desk."
        />
        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-8 md:mt-14 lg:gap-12">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-ink pt-5">
              <span className="block text-[13px] tabular-nums text-mute">{i + 1}</span>
              <h3 className="mt-5 font-display text-[18px] font-semibold tracking-[-0.01em] text-ink md:text-[20px]">
                {s.title}
              </h3>
              <p className="mt-2.5 max-w-[360px] text-[14.5px] font-light leading-relaxed text-sub">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
