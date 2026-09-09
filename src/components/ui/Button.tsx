import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * klow_brand 는 프리미티브 없이 클래스 문자열을 반복하지만, 거기서도 사실상 3종이
 * 굳어져 있다(= 프리미티브가 필요했다는 증거). 여기선 같은 CTA 가 브랜드 상세 헤더 ·
 * sticky 선택 바 · 모달 제출 · 빈 상태 · 채팅 전송 등 6곳에 나오므로 컴포넌트로 둔다.
 *
 * ⚠️ primary 배경은 accent(#8F5CFF)가 아니라 **accent-strong(#7C3AED)** 이다 —
 *    흰 글씨 대비가 4.08:1(미달) → 5.70:1(통과)로 갈린다.
 */
type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent-strong text-white hover:opacity-90',
  outline: 'border border-line bg-surface text-ink hover:border-ink/40',
  ghost: 'text-sub hover:bg-ink/[0.05] hover:text-ink',
};

const SIZE: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px] rounded-[10px]',
  sm: 'h-9 px-3.5 text-[13px] rounded-[10px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition-all',
        'active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/40',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
}
