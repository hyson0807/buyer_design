/**
 * 컨시어지(바이어 매칭) 질문 단일 소스.
 *
 * 설문이 아니라 **소싱 상담**이다. 무엇을 좋아하느냐가 아니라, 브랜드를 고르는 순간 실제로
 * 갈리는 조건만 묻는다 — B2B 뷰티 바이어 커뮤니티(r/AmazonSeller · r/shopify · r/kbeauty
 * 의 도매 스레드, 디스트리뷰터 포럼)에서 반복되는 걱정이 그대로 질문이 됐다:
 *
 *   - 누구에게 파는가      → 채널마다 맞는 브랜드가 다르다(살롱 ≠ 마켓플레이스)
 *   - 어디서 파는가        → 서류가 갈린다(EU=CPNP · US=FDA/MoCRA · 중동·동남아=Halal)
 *   - 왜 지금 찾는가        → 검증된 베스트셀러 vs 아직 안 알려진 브랜드 vs 독점
 *   - 고객이 찾는 효능      → 카테고리(스킨케어)가 아니라 니즈(수분·안티에이징)로 묻는다
 *   - 무엇이 제일 중요한가  → 소량 시작 · 마진 · 독점 · 공급 속도 · 서류
 *
 * 다섯 문항, 전부 카드 선택. 타이핑은 없다.
 */

export type BuyerKind = 'distributor' | 'online' | 'store' | 'salon' | 'marketplace';
export type Region = 'na' | 'eu' | 'me' | 'sea' | 'ea' | 'latam' | 'oce';
export type Goal = 'test' | 'proven' | 'gems' | 'expand' | 'distribute';
export type NeedKey =
  | 'hydration'
  | 'antiaging'
  | 'sensitive'
  | 'acne'
  | 'sun'
  | 'brightening'
  | 'clean'
  | 'makeup'
  | 'hair'
  | 'body';
export type Priority = 'lowqty' | 'margin' | 'exclusive' | 'supply' | 'docs';

export type MatchAnswers = {
  kind: BuyerKind;
  region: Region;
  goal: Goal;
  needs: NeedKey[];
  priorities: Priority[];
};

type Option<K extends string> = { key: K; label: string; hint?: string };

export type Question =
  | { id: 'kind'; prompt: string; note?: string; max: 1; options: Option<BuyerKind>[] }
  | { id: 'region'; prompt: string; note?: string; max: 1; options: Option<Region>[] }
  | { id: 'goal'; prompt: string; note?: string; max: 1; options: Option<Goal>[] }
  | { id: 'needs'; prompt: string; note?: string; max: 3; options: Option<NeedKey>[] }
  | { id: 'priorities'; prompt: string; note?: string; max: 2; options: Option<Priority>[] };

export const QUESTIONS: Question[] = [
  {
    id: 'kind',
    prompt: 'First, how do you sell?',
    max: 1,
    options: [
      { key: 'distributor', label: 'Distributor / Importer', hint: 'Supplying shops in your market' },
      { key: 'online', label: 'Online store', hint: 'Your own e-commerce site' },
      { key: 'store', label: 'Beauty store', hint: 'Physical retail, one or more doors' },
      { key: 'salon', label: 'Salon, spa or clinic', hint: 'Treatments and retail shelf' },
      { key: 'marketplace', label: 'Marketplace seller', hint: 'Amazon, TikTok Shop, Shopee…' },
    ],
  },
  {
    id: 'region',
    prompt: 'Where are your customers?',
    note: 'This decides which documents a brand must already have.',
    max: 1,
    options: [
      { key: 'na', label: 'North America' },
      { key: 'eu', label: 'Europe & UK' },
      { key: 'me', label: 'Middle East' },
      { key: 'sea', label: 'Southeast Asia' },
      { key: 'ea', label: 'Japan, China & Taiwan' },
      { key: 'latam', label: 'Latin America' },
      { key: 'oce', label: 'Australia & NZ' },
    ],
  },
  {
    id: 'goal',
    prompt: 'What are you sourcing for right now?',
    max: 1,
    options: [
      { key: 'proven', label: 'Proven K-beauty sellers', hint: 'Names your customers already ask for' },
      { key: 'gems', label: 'Hidden gems', hint: 'Before they reach your market' },
      { key: 'test', label: 'Test a few new products', hint: 'Small, low-risk first order' },
      { key: 'expand', label: 'Fill a gap in my range', hint: 'A category I don’t carry yet' },
      { key: 'distribute', label: 'A brand to represent', hint: 'Long-term or exclusive' },
    ],
  },
  {
    id: 'needs',
    prompt: 'What are your customers asking for?',
    note: 'Choose up to three.',
    max: 3,
    options: [
      { key: 'hydration', label: 'Hydration' },
      { key: 'antiaging', label: 'Anti-aging' },
      { key: 'sensitive', label: 'Sensitive & barrier' },
      { key: 'acne', label: 'Acne & pores' },
      { key: 'sun', label: 'Sun care' },
      { key: 'brightening', label: 'Brightening' },
      { key: 'clean', label: 'Clean & vegan' },
      { key: 'makeup', label: 'Colour makeup' },
      { key: 'hair', label: 'Hair & scalp' },
      { key: 'body', label: 'Body care' },
    ],
  },
  {
    id: 'priorities',
    prompt: 'Last one. What matters most in a brand?',
    note: 'Choose up to two.',
    max: 2,
    options: [
      { key: 'lowqty', label: 'Low starting quantity' },
      { key: 'margin', label: 'Strong retail margin' },
      { key: 'exclusive', label: 'Exclusive distribution' },
      { key: 'supply', label: 'Fast, reliable supply' },
      { key: 'docs', label: 'Market-ready documents' },
    ],
  },
];

/** 답 키 → 화면 라벨. 채팅의 내 말풍선과 결과 요약이 같은 문구를 쓰게 한다. */
export function optionLabel(qid: Question['id'], key: string): string {
  const q = QUESTIONS.find((x) => x.id === qid);
  const o = (q?.options as Option<string>[] | undefined)?.find((x) => x.key === key);
  return o?.label ?? key;
}

/** 지역 → 그 지역의 수출국 코드. 브랜드의 exportMarkets 와 대조한다. */
export const REGION_MARKETS: Record<Region, string[]> = {
  na: ['US', 'CA'],
  eu: ['UK', 'DE', 'FR', 'NL', 'SE', 'IT', 'ES'],
  me: ['AE', 'SA', 'KZ', 'QA'],
  sea: ['SG', 'MY', 'ID', 'TH', 'PH', 'VN'],
  ea: ['JP', 'CN', 'TW', 'HK'],
  latam: ['BR', 'MX', 'CL'],
  oce: ['AU', 'NZ'],
};

/** 지역 → 그 시장에서 판매하려면 있어야 하는 인증. */
export const REGION_CERT: Partial<Record<Region, string>> = {
  na: 'FDA',
  eu: 'CPNP',
  me: 'Halal',
  sea: 'Halal',
};
