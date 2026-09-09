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
 */
const SIZE = { sm: 'max-w-[420px]', md: 'max-w-[520px]', lg: 'max-w-[640px]' } as const;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
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
          'relative w-full max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl2 border border-line',
          'bg-surface p-7 shadow-pop animate-pop',
          SIZE[size],
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-sub transition hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
        {children}
      </div>
    </div>
  );
}
