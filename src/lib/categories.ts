/**
 * 카테고리 단일 소스. 홈 필터 · brand.categoryKeys · 가입 폼 "Categories of interest"
 * 세 곳이 전부 여기를 읽는다. 목록을 늘리면 세 화면이 동시에 따라온다.
 */
export const CATEGORIES = [
  { key: 'skincare', label: 'Skincare' },
  { key: 'cleansing', label: 'Cleansing' },
  { key: 'suncare', label: 'Suncare' },
  { key: 'mask', label: 'Mask' },
  { key: 'makeup', label: 'Makeup' },
  { key: 'haircare', label: 'Haircare' },
  { key: 'body', label: 'Body' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

const LABELS = new Map<string, string>(CATEGORIES.map((c) => [c.key, c.label]));

export function categoryLabel(key: CategoryKey | string): string {
  return LABELS.get(key) ?? key;
}
