import {
  REGION_CERT,
  REGION_MARKETS,
  optionLabel,
  type MatchAnswers,
} from '@/lib/concierge';
import type { BuyerBrand } from '@/lib/types';

/**
 * 컨시어지 답 → 브랜드 순위.
 *
 * 점수보다 **이유**가 중요하다. 바이어는 "92% match" 같은 숫자를 믿지 않는다 —
 * "이미 독일로 수출 중 · CPNP 보유 · MOQ 30" 처럼 확인 가능한 사실을 보여야 쇼트리스트가
 * 상담처럼 읽힌다. 그래서 점수를 올리는 모든 조건이 화면에 나갈 문장을 함께 낸다.
 *
 * ⚠️ 랜덤 없음 — 같은 답이면 언제나 같은 결과(데모 재현성).
 * @PORT(api): 실서버에서는 POST /v1/buyer/match 로 옮긴다. 화면은 이 함수 시그니처만 본다.
 */

export type BrandMatch = { brand: BuyerBrand; score: number; reasons: string[] };

type Hit = { w: number; why: string };

export function matchBrands(a: MatchAnswers, brands: BuyerBrand[], limit = 6): BrandMatch[] {
  const markets = REGION_MARKETS[a.region];
  const cert = REGION_CERT[a.region];

  const scored = brands.map((b) => {
    const hits: Hit[] = [];
    const add = (w: number, why: string) => hits.push({ w, why });

    // 1) 고객 니즈 — 가장 무겁다. 하나도 안 겹치면 후보에서 뺀다.
    const shared = a.needs.filter((n) => b.skinNeeds.includes(n));
    if (a.needs.length && shared.length === 0) return { brand: b, score: -1, reasons: [] };
    if (shared.length) add(4 * shared.length, shared.map((n) => optionLabel('needs', n)).join(' · '));

    // 2) 시장 — 이미 그 지역에 수출 중인가, 그 지역 서류가 있는가.
    const already = b.exportMarkets.filter((m) => markets.includes(m));
    if (already.length) add(3, `Already ships to ${already.slice(0, 3).join(', ')}`);
    if (cert && b.certifications.includes(cert)) add(3, `${cert} ready`);

    // 3) 소싱 목적
    if (a.goal === 'proven' && b.tier === 'established')
      add(4, `Sold in ${b.exportMarkets.length} markets`);
    if (a.goal === 'gems' && b.tier === 'emerging')
      add(4, already.length ? 'Early in your region' : 'Not yet in your market');
    if (a.goal === 'test' && b.moqUnits <= 60) add(3, `MOQ ${b.moqUnits}`);
    if (a.goal === 'distribute' && b.exclusiveOpen) add(4, 'Open to exclusive distribution');
    if (a.goal === 'expand' && b.categoryKeys.length === 1) add(2, 'Category specialist');

    // 4) 우선순위
    for (const p of a.priorities) {
      if (p === 'lowqty' && b.moqUnits <= 60) add(3, `MOQ ${b.moqUnits}`);
      if (p === 'margin' && b.wholesaleRatio <= 0.5)
        add(3, `≈${Math.round((1 - b.wholesaleRatio) * 100)}% retail margin`);
      if (p === 'exclusive' && b.exclusiveOpen) add(3, 'Open to exclusive distribution');
      if (p === 'supply' && b.leadTimeDays <= 21) add(3, `${b.leadTimeDays}-day lead time`);
      if (p === 'docs' && b.certifications.length >= 3) add(3, b.certifications.join(', '));
    }

    // 5) 판매 형태 — 가볍게만 기운다(다른 답을 뒤집지 않게).
    if (a.kind === 'salon' && b.categoryKeys.some((c) => c === 'skincare' || c === 'haircare' || c === 'mask'))
      add(1, '');
    if (a.kind === 'marketplace' && b.moqUnits <= 80) add(1, '');
    if (a.kind === 'distributor' && b.certifications.includes('ISO 22716')) add(1, 'ISO 22716 factory');

    const score = hits.reduce((s, h) => s + h.w, 0);
    // 같은 이유가 두 번 나오지 않게(MOQ 가 목적·우선순위 양쪽에서 걸리는 경우) 무게순 dedupe.
    const reasons = Array.from(
      new Set(
        hits
          .filter((h) => h.why)
          .sort((x, y) => y.w - x.w)
          .map((h) => h.why),
      ),
    );
    return { brand: b, score, reasons };
  });

  return scored
    .filter((m) => m.score > 0)
    .sort((x, y) => y.score - x.score || x.brand.order - y.brand.order)
    .slice(0, limit);
}
