import Link from 'next/link';

/** 페이지 끝의 검정 섹션 — 마지막으로 한 번 더 매칭으로 보낸다. */
export function MatchCta() {
  return (
    <section className="bg-ink py-20 md:py-30">
      <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10 lg:px-15">
        <h2 className="font-display text-[28px] font-semibold tracking-[-0.01em] text-white md:text-[36px]">
          Not sure where to start?
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-[15px] font-light leading-relaxed text-white/60 md:text-[16px]">
          Answer five quick questions about your business. We&apos;ll show you the Korean brands
          that fit — and what to sample first.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 md:mt-12">
          <Link
            href="/match"
            className="inline-flex h-[52px] items-center justify-center bg-white px-10 text-[14px] font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-white/90"
          >
            Find your match
          </Link>
          <a
            href="#brands"
            className="inline-flex h-[52px] items-center justify-center border border-white/25 px-10 text-[14px] font-normal tracking-[0.04em] text-white transition-colors hover:bg-white/10"
          >
            Browse all brands
          </a>
        </div>
      </div>
    </section>
  );
}
