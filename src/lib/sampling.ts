/**
 * 샘플 정책 — 이 플랫폼의 첫 번째 약속. 문구와 숫자를 한곳에 둔다.
 *
 * 1. 샘플은 **소매가가 아니라 도매가**다.
 * 2. **단 1개**부터 받을 수 있다(SKU 당 최소 수량 없음).
 * 3. **SKU 5개**를 고르면 배송비가 무료다.
 *
 * ⚠️ 숫자를 화면에 하드코딩하지 말 것 — 정책이 바뀌면 띠·히어로·선택 바·요청 모달이
 *    전부 이 상수를 따라와야 한다.
 */
export const FREE_SHIPPING_SKUS = 5;

/** 무료배송까지 남은 SKU 수. 0 이면 달성. */
export function skusToFreeShipping(selectedSkus: number): number {
  return Math.max(0, FREE_SHIPPING_SKUS - selectedSkus);
}
