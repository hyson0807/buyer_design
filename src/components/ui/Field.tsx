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
        {/* ⚠️ 별표를 보라로 두지 말 것 — 프로필 폼 한 화면에 12개가 흩어져 유채색
               얼룩이 되고, 정작 그 색이 뜻하는 주 CTA 와 구분이 안 된다. */}
        {required && <span className="ml-1 text-mute">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-sub">{hint}</span>}
    </label>
  );
}
