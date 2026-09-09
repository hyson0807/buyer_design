import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { categoryLabel } from '@/lib/categories';
import type { BuyerBrand } from '@/lib/types';

/**
 * cosmed-web 의 갤러리 카드 공식: aspect-[4/5] · object-cover · hover 시 이미지만 확대 ·
 * **모서리 0 · 그림자 0**. 카드에 라운딩이나 그림자를 붙이는 순간 사진들이 각자
 * 떠 있는 타일이 되어 진열장 느낌이 사라진다.
 *
 * 두 번째 줄(카테고리 · MOQ)은 장식이 아니다 — 바이어가 카드에서 알아야 하는 최소 정보다.
 */
export function BrandCard({ brand, priority }: { brand: BuyerBrand; priority?: boolean }) {
  return (
    <Link href={`/brands/${brand.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-field">
        <SafeImage
          src={brand.heroImage}
          alt={brand.name}
          name={brand.name}
          accent={brand.accentColor}
          priority={priority}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-400 group-hover:scale-[1.04]"
        />
      </div>
      <div className="py-4">
        <h3 className="font-display text-[15px] font-medium text-ink">{brand.name}</h3>
        <p className="mt-0.5 text-[12px] text-mute">
          {brand.categoryKeys.map(categoryLabel).join(' · ')} &middot; MOQ {brand.moqUnits}
        </p>
      </div>
    </Link>
  );
}
