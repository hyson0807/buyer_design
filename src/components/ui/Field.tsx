import type { ReactNode } from 'react';

/** klow_brand/src/components/Field.tsx 이식. 라벨만 영문 톤으로 조정. */
export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-accent-strong">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-sub">{hint}</span>}
    </label>
  );
}
