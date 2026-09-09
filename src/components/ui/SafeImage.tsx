'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';

/**
 * 이미지 + 폴백. **프로토타입용 임시방편이 아니다** — 실제 klow DB 를 조회해 보면
 * `logosCircle: []` 인 브랜드가 흔해서 klow_buyer 도 같은 폴백이 필요하다.
 * BrandCard · ProductCard · 채팅 아바타 3곳이 같은 로직을 쓴다.
 *
 * ⚠️ 이미지 뒤에는 항상 바닥색을 깐다 — 안 그러면 30장 그리드가 로딩 중 흰색으로 번쩍인다.
 */
export function SafeImage({
  src,
  alt,
  name,
  accent,
  sizes,
  priority,
  className,
}: {
  src?: string | null;
  alt: string;
  /** 폴백 타일에 그릴 이니셜의 출처. */
  name: string;
  /** 폴백 그라데이션의 기준색. Brand.accentColor 를 그대로 넘긴다. */
  accent?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const base = accent && /^#[0-9A-Fa-f]{6}$/.test(accent) ? accent : '#A1A1AA';

  if (!src || failed) {
    return (
      <div
        className={cn('flex h-full w-full items-center justify-center', className)}
        style={{ background: `linear-gradient(135deg, ${base}33 0%, ${base}14 100%)` }}
        aria-label={alt}
        role="img"
      >
        <span className="font-display text-[15px] font-semibold tracking-wide" style={{ color: base }}>
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
