'use client';

import { useAppActions } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';

/**
 * @PORT(drop) — 프로토타입 전용 푸터.
 * "Reset demo" 는 반복 시연에 필수다. 빠뜨리면 매번 devtools 로 localStorage 를 지워야 한다.
 */
export function DemoFooter() {
  const { resetDemo } = useAppActions();
  const toast = useToast();

  return (
    <footer className="mt-16 border-t border-line md:mt-24">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[12px] text-mute md:px-10 md:py-8 lg:px-15">
        <span>KLOW for Buyers — design prototype. Brands and products shown are placeholders.</span>
        <button
          type="button"
          onClick={() => {
            resetDemo();
            toast.info('Demo reset');
          }}
          className="ml-auto underline underline-offset-2 transition-colors hover:text-ink"
        >
          Reset demo
        </button>
      </div>
    </footer>
  );
}
