import { formatUsd } from '@/lib/format';
import { wholesaleCents } from '@/lib/mock-brands';
import type { ProductListItem } from '@/lib/types';

/**
 * 제품 가격 두 줄 — **도매가(= 샘플가)가 주인공, 소매가는 참고값.**
 *
 * 소비자 쇼핑몰처럼 할인율 배지·취소선을 쓰지 않는다. 이건 할인이 아니라 다른 가격표다.
 * 도매가를 잉크로, 소매가를 회색 "RRP" 로 나란히 두면 바이어는 마진을 바로 계산한다.
 */
export function SamplePrice({ product }: { product: ProductListItem }) {
  return (
    <p className="mt-1.5 flex items-baseline gap-2 text-[13px] tabular-nums">
      <span className="font-medium text-ink">{formatUsd(wholesaleCents(product))}</span>
      <span className="text-[11.5px] text-mute">RRP {formatUsd(product.customerPriceUsd)}</span>
    </p>
  );
}
