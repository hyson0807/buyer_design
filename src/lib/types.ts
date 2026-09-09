import type { CategoryKey } from '@/lib/categories';

/* ────────────────────────────────────────────────────────────────────────────
   klow_server DTO 1:1 미러. 출처: klow_web/src/lib/types.ts.
   ⚠️ 이 블록은 손대지 않는다 — klow_buyer 이식 시 `const b: Brand = await api...`
      가 그대로 컴파일되어야 한다.
   ──────────────────────────────────────────────────────────────────────────── */

export type BrandLogoLayout = 'circle' | 'rounded' | 'wide' | 'tall';

export type BrandStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'withdrawal_pending'
  | 'withdrawn';

export type Brand = {
  id: string;
  name: string;
  /** klow.kr/{slug} 공개 storefront 식별자. ⚠️ 실데이터엔 null 인 행이 있다. */
  slug: string | null;
  /**
   * ⚠️ 소개문이 아니다 — `__klow_brand_tags_v1__:a,b,c` 태그 마커 문자열이다.
   *    화면에는 parseBrandTags() 를 거쳐 칩으로만 렌더한다.
   */
  tagline: string;
  /** 사람이 읽는 소개문은 여기. */
  description: string;
  /** ⚠️ logoUrl / coverImageUrl 같은 필드는 서버에 존재하지 않는다. 로고는 이 3개 배열뿐. */
  logosCircle: string[];
  logosWide: string[];
  logosTall: string[];
  logoLayout: BrandLogoLayout;
  accentColor: string | null;
  gradientStrength: number | null;
  order: number;
  status: BrandStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductListItem = {
  id: string;
  brand: string;
  name: string;
  category: string;
  categoryKey: string | null;
  image: string;
  /** ⚠️ USD 센트 정수. 2630 === $26.30 */
  customerPriceUsd: number;
  listPriceUsd: number;
  customerDiscountPercent: number;
  rating: number;
  reviewCount: number;
};

/* ────────────────────────────────────────────────────────────────────────────
   @PORT(schema) — 서버 DTO 에 아직 없는 필드. klow_buyer 이식 시 스키마 추가 대상이거나,
   기존 컬럼으로 대체 매핑해야 한다(heroImage 는 Brand.shareImageUrl 로 대체 가능).
   Brand 와 합치지 않고 나누는 이유: 어떤 필드가 우리가 지어낸 것인지 코드에 남기기 위함.
   ──────────────────────────────────────────────────────────────────────────── */

export type BuyerBrandExtras = {
  heroImage: string;
  categoryKeys: CategoryKey[];
  moqUnits: number;
  leadTimeDays: number;
  certifications: string[];
  exportMarkets: string[];
  yearFounded: number;
};

export type BuyerBrand = Brand & BuyerBrandExtras;

/* ────────────────────────────────────────────────────────────────────────────
   프로토타입 전용 도메인. @PORT(schema): 서버에 대응 테이블이 없다.
   ──────────────────────────────────────────────────────────────────────────── */

export type BusinessType =
  | 'Retailer'
  | 'E-commerce'
  | 'Distributor'
  | 'Importer'
  | 'Wholesaler'
  | 'Salon & Spa'
  | 'Sourcing agency'
  | 'Other';

export type AnnualVolume =
  | 'Under $10K'
  | '$10K – $50K'
  | '$50K – $200K'
  | '$200K – $1M'
  | '$1M+';

export type ContactChannel = 'Email' | 'WhatsApp' | 'KakaoTalk';

export type Buyer = {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  country: string;
  businessType: BusinessType;
  annualVolume: AnnualVolume;
  website?: string;
  categories: CategoryKey[];
  contactChannel?: ContactChannel;
  contactHandle?: string;
  createdAt: string;
};

export type SampleRequestStatus = 'submitted' | 'accepted' | 'shipped';

export type SampleRequestItem = { productId: string; qty: number };

export type SampleRequest = {
  id: string;
  brandId: string;
  items: SampleRequestItem[];
  shipToCountry: string;
  address: string;
  message: string;
  coversShipping: boolean;
  status: SampleRequestStatus;
  trackingNo?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  requestId: string;
  from: 'buyer' | 'brand' | 'system';
  text: string;
  createdAt: string;
};

export type ChatThread = {
  requestId: string;
  brandId: string;
  messages: ChatMessage[];
  lastReadAt: string;
};

/** 미로그인 상태에서 "Request Samples" 를 누른 순간의 의도. 로그인 후 소비된다. */
export type PendingIntent = { brandId: string; productIds: string[] } | null;
