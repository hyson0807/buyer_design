'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppActions } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';

/**
 * 검정 푸터. 위의 검정 CTA 섹션(홈)과 이어져 한 덩어리로 끝난다.
 * "Reset demo" 는 @PORT(drop) — 반복 시연에 필수다.
 */
export function DemoFooter() {
  const { resetDemo } = useAppActions();
  const toast = useToast();
  // 홈은 검정 CTA 섹션이 바로 위에 붙어 한 덩어리가 된다 — 거기만 위 여백을 없앤다.
  const flush = usePathname() === '/';

  return (
    <footer className={cn(flush ? '' : 'mt-16 md:mt-24', 'border-t border-white/[0.08] bg-ink pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-15')}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-15">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="mb-2 font-display text-[19px] font-semibold tracking-[0.08em] text-white">KLOW</div>
            <p className="text-[13px] font-light tracking-[0.02em] text-mute">
              Korean beauty wholesale for global buyers
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 md:gap-8">
            <Link href="/#brands" className="text-[13px] tracking-[0.02em] text-mute transition-colors hover:text-white">
              Brands
            </Link>
            <Link href="/match" className="text-[13px] tracking-[0.02em] text-mute transition-colors hover:text-white">
              Find your match
            </Link>
            <Link href="/request-brand" className="text-[13px] tracking-[0.02em] text-mute transition-colors hover:text-white">
              Request a brand
            </Link>
            <Link href="/requests" className="text-[13px] tracking-[0.02em] text-mute transition-colors hover:text-white">
              Requests
            </Link>
          </nav>
        </div>
        <div className="my-8 h-px bg-white/[0.08]" />
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="text-[12px] font-light tracking-[0.02em] text-white/30">
            Design prototype — brands and products shown are placeholders.
          </p>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              toast.info('Demo reset');
            }}
            className="text-[12px] font-light tracking-[0.02em] text-white/30 transition-colors hover:text-white"
          >
            Reset demo
          </button>
        </div>
      </div>
    </footer>
  );
}
