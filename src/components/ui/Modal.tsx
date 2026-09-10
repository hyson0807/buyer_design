'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * klow_brand/src/components/Modal.tsx 이식. size 를 sm|md|lg 로 축약했다.
 *
 * ⚠️ 배경 스크롤 잠금과 Escape 를 **별도 useEffect 로 분리**한다 — 한 이펙트에 묶으면
 *    의존성 하나가 바뀌는 순간 cleanup 이 돌아 body overflow 가 조기 복원된다.
 * ⚠️ 배경 클릭은 click 이 아니라 onMouseDown + `e.target === e.currentTarget` 이다.
 *    안에서 드래그를 시작해 밖에서 놓으면 click 이 오버레이에서 발화해 모달이 닫힌다.
 *
 * ⚠️⚠️ **모바일(<640px)에서는 가운데 뜨는 카드가 아니라 화면 바닥에 붙는 바텀시트다.**
 *      좁은 화면에서 좌우 여백(16px×2)과 카드 안쪽 패딩(28px×2)을 합치면 88px —
 *      360px 화면의 1/4 이 사라져서, 요청 모달의 제품 행이 이름 58px 만 남고 잘렸다.
 *      바닥에 붙이면 폭이 100% 가 되고 CTA 가 엄지 근처에 온다.
 * ⚠️ 안쪽 패딩이 모바일 20px / 데스크탑 28px 로 **갈린다**. sticky 푸터를 가진 자식
 *    (SampleRequestModal · BusinessDetailsStep)은 그 패딩을 음수 마진으로 상쇄하므로
 *    여기 값을 바꾸면 그 두 파일의 `-mx-5/-mb-5/px-5/pb-5/-bottom-5` 짝도 함께 바꿔야 한다.
 */
const SIZE = { sm: 'sm:max-w-[420px]', md: 'sm:max-w-[520px]', lg: 'sm:max-w-[640px]' } as const;

export function Modal({
  open,
  onClose,
  labelledBy,
  size = 'sm',
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  size?: keyof typeof SIZE;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        className={cn(
          'relative w-full overflow-y-auto bg-surface shadow-pop',
          // 모바일: 바닥에 붙는 시트(위 모서리만 둥글게 · 좌우 테두리 없음 — 화면 끝까지
          // 닿는 시트에 세로 실선이 남으면 카드를 억지로 늘린 것처럼 보인다)
          'max-h-[92dvh] rounded-t-xl2 border-t border-line p-5 animate-slide-up',
          'sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl2 sm:border sm:p-7 sm:animate-pop',
          SIZE[size],
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-sub transition hover:bg-ink/5 hover:text-ink sm:right-4 sm:top-4 sm:h-8 sm:w-8"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
        {children}
      </div>
    </div>
  );
}
