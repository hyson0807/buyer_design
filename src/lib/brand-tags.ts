import type { Brand } from '@/lib/types';

// ⚠️ klow_web/src/lib/brand-tags.ts 의 **의도된 크로스 레포 미러**. 규칙을 바꾸지 말 것 —
//    klow_buyer 이식 시 서버가 내려주는 값의 해석이 여기서 갈리면 태그가 통째로 깨진다.
const TAG_PREFIX = '__klow_brand_tags_v1__:';

/**
 * 브랜드의 사람이 읽는 소개문.
 * ⚠️ `tagline` 필드는 태그 마커(`__klow_brand_tags_v1__:...`)를 담으므로 소개문으로 쓰면 안 되고,
 *    실제 소개는 `description` 에 있다. 실서버 데이터로 확인된 사실이다.
 */
export function brandIntro(brand: Pick<Brand, 'description'>): string {
  return brand.description?.trim() ?? '';
}

export function parseBrandTags(value?: string | null): string[] {
  if (!value?.startsWith(TAG_PREFIX)) return [];
  return value
    .slice(TAG_PREFIX.length)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
}

/** 목데이터가 위 형식을 벗어나지 않게 하는 생성기. @PORT(drop): 실서버에선 불필요. */
export function encodeBrandTags(tags: string[]): string {
  return TAG_PREFIX + tags.join(',');
}
