import type { Buyer, BuyerBrand, ChatMessage, ProductListItem } from '@/lib/types';

/**
 * @PORT(drop) — 브랜드 담당자 응답 시뮬레이터. 실서버에서는 진짜 사람이 답한다.
 *
 * ⚠️ **랜덤을 쓰지 않는다.** 데모를 두 번 돌렸을 때 다른 답이 나오면 신뢰가 깨진다.
 *    응답은 (키워드, 턴 수)로 완전히 결정된다.
 *
 * ⚠️ **답변 끝에 서명을 붙이지 않는다.** 한때 모든 메시지가 `— {브랜드명} Global Team`
 *    으로 끝났는데, 채팅에서 매 메시지에 서명하는 사람은 없고(이메일 관습이다) 말풍선
 *    마다 두 줄이 더 붙어 대화가 길어졌다. 누가 말하는지는 말풍선 옆 **브랜드 아바타**가
 *    이미 말한다. ("Global Team" 은 인디 브랜드가 스스로를 부르는 말도 아니다.)
 */

export type ReplyResult = {
  text: string;
  /** 이 답변과 함께 요청 상태를 전진시킬지. */
  advanceTo?: 'accepted' | 'shipped';
  trackingNo?: string;
};

const KEYWORD_HOOKS: { test: RegExp; reply: (b: BuyerBrand) => string }[] = [
  {
    test: /\b(moq|minimum|minimums)\b/i,
    reply: (b) =>
      `Our minimum order is ${b.moqUnits} units per SKU, and we can mix SKUs to reach it. Production lead time is ${b.leadTimeDays} days after PO confirmation.`,
  },
  {
    test: /\b(price|pricing|cost|fob|exw|wholesale|margin)\b/i,
    reply: () =>
      'We quote FOB Incheon by default, and EXW is available if you have a forwarder in Korea. Wholesale sits at 45–50% off retail depending on volume — happy to send the full price list once we know your order size.',
  },
  {
    test: /\b(certif|cpnp|fda|halal|vegan|iso|registration)\b/i,
    reply: (b) =>
      `We currently hold ${b.certifications.join(', ')}. Full dossiers and CPSRs can be shared under NDA, and we cover the notification cost for first orders above 300 units.`,
  },
  {
    test: /\b(exclusiv|distribut|territory|sole agent)\b/i,
    reply: (b) =>
      `We are open to territory exclusivity after a first order. We already ship to ${b.exportMarkets.join(', ')}, so let us know which market you would want protected.`,
  },
];

const FOLLOW_UPS = [
  'Noted — let me check with our production team and come back to you tomorrow.',
  'That works on our side. Would you like me to include the retail-ready display box in the sample box?',
  'Understood. I will attach the full catalogue and price list to our next message.',
];

export function autoReply(
  brand: BuyerBrand,
  buyer: Buyer,
  incoming: string,
  /** 이 스레드에서 브랜드가 이미 보낸 메시지 수. */
  brandTurn: number,
): ReplyResult {
  return { ...replyText(brand, buyer, incoming, brandTurn), ...progress(brand, brandTurn) };
}

/**
 * ⚠️ 진행 상태는 **답변 내용과 분리해서** 턴 수만으로 정한다.
 *    한때 turn 분기 안에서만 advanceTo 를 돌려줬는데, 그러면 바이어가 첫 두 메시지에서
 *    MOQ·가격을 물어보는 순간(가장 흔한 대화다) 키워드 훅이 먼저 잡아채 상태가 영원히
 *    Submitted 에 머문다 — 스테퍼가 이 화면의 핵심인데 데모에서 한 번도 안 움직였다.
 */
function progress(brand: BuyerBrand, brandTurn: number): Partial<ReplyResult> {
  if (brandTurn === 1) return { advanceTo: 'accepted' };
  if (brandTurn === 2) return { advanceTo: 'shipped', trackingNo: trackingFor(brand.id) };
  return {};
}

function replyText(
  brand: BuyerBrand,
  buyer: Buyer,
  incoming: string,
  brandTurn: number,
): ReplyResult {
  const hook = KEYWORD_HOOKS.find((h) => h.test.test(incoming));
  if (hook) return { text: hook.reply(brand) };

  if (brandTurn === 1) {
    return {
      text: `Thanks for the details. We can ship samples to ${buyer.country} — courier is DHL and it usually takes 5 business days after we hand over the box. Could you share the retail price band you are targeting?`,
    };
  }

  if (brandTurn === 2) {
    return {
      text: 'Your sample box went out this morning. Tracking is below — please let us know once it arrives and we can set up a call about first order terms.',
    };
  }

  return { text: FOLLOW_UPS[(brandTurn - 3) % FOLLOW_UPS.length] };
}

/** 요청 직후 자동으로 붙는 브랜드 인사말(turn 0). */
export function openingMessage(buyer: Buyer, products: ProductListItem[]): string {
  const names = products.slice(0, 3).map((p) => p.name).join(', ');
  const more = products.length > 3 ? ` and ${products.length - 3} more` : '';
  return `Hi ${buyer.fullName.split(' ')[0]}, thanks for reaching out from ${buyer.companyName} in ${buyer.country}. We have your request for ${names}${more}. Let me confirm stock and come back to you today. Ask me anything about MOQ, pricing or certifications in the meantime.`;
}

/** 트래킹 번호도 결정론적으로 만든다. */
function trackingFor(brandId: string): string {
  let hash = 0;
  for (const ch of brandId) hash = (hash * 31 + ch.charCodeAt(0)) % 100000000;
  return `EE${String(hash).padStart(8, '0')}KR`;
}
