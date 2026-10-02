import { encodeBrandTags } from '@/lib/brand-tags';
import type { CategoryKey } from '@/lib/categories';
import type { NeedKey } from '@/lib/concierge';
import type { BuyerBrand, ProductListItem } from '@/lib/types';

/**
 * 프로토타입 목데이터.
 *
 * ⚠️ 브랜드가 19개인 것은 디자인 결정이 아니라 **플레이스홀더 사진 제약**이다.
 *    실제 입점사는 30여 곳이지만, 브랜딩이 안 박힌 스톡 뷰티 사진을 19장밖에 확보하지
 *    못했다(아래 HERO_IDS 주석 참고). 같은 사진을 두 브랜드가 나눠 쓰면 그리드에서
 *    바로 눈에 띄므로 브랜드 수를 사진 수에 맞췄다. 실제 브랜드 사진이 들어오는 순간
 *    이 제약은 사라지고 SEEDS 에 줄만 추가하면 된다. @PORT(api): klow_buyer 에서는 이 파일 전체가 사라지고
 * 아래 조회 함수들이 `useQuery(qk.brands...)` 로 바뀐다.
 *
 * ⚠️ 브랜드명은 실재 입점사가 아니라 가상 이름이다 — 프로토타입에 실명을 박으면
 *    기획이 바뀔 때마다 전량 교체해야 한다.
 * ⚠️ 이미지 URL 은 전부 실제로 200 을 확인한 고정 photo id 다.
 *    `source.unsplash.com/random` 류는 쓰지 말 것 — 503 으로 죽었고, 요청마다 사진이
 *    바뀌어 next/image 캐시가 깨진다. URL 을 고칠 땐 `npm run check:images` 로 재검증.
 */

const IMG = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
/**
 * 브랜드 대표 이미지 풀 — 19장.
 *
 * ⚠️⚠️ **이 목록에 아무 사진이나 추가하지 말 것.** 스톡 뷰티 사진에는 실제 경쟁 브랜드
 *      로고가 박혀 있는 경우가 아주 흔하다 — 처음 고른 30장에 Curology · Chanel · NARS ·
 *      Clinique · Gucci · Act+Acre · Bobbi Brown 이 그대로 찍혀 있었고, 운동화·샐러드 같은
 *      무관한 사진도 섞여 있었다. 한국 인디 브랜드 카드에 남의 브랜드명이 나가는 것은
 *      사진이 없느니만 못하다. 후보는 반드시 **눈으로 보고** 넣는다(전부 한 페이지에
 *      깔아 놓고 한 번에 확인하는 컨택트시트 방식을 썼다).
 *
 * 19장을 30개 브랜드에 돌려 쓰되, BrandCard 가 브랜드 accentColor 로 틴트를 얹어
 * 같은 사진이 브랜드마다 다른 인상으로 읽히게 한다.
 */
const HERO_IDS = [
  '1596462502278-27bfdc403348', '1631730359585-38a4935cbec4', '1570172619644-dfd03ed5d881',
  '1617897903246-719242758050', '1600428877878-1a0fd85beda8', '1601049541289-9b1b7bbbfe19',
  '1576426863848-c21f53c60b19', '1567721913486-6585f069b332', '1608571423902-eed4a5ad8108',
  '1552046122-03184de85e08', '1573575155376-b5010099301b', '1627384113743-6bd5a479fffd',
  '1610992015732-2449b76344bc', '1590439471364-192aa70c0b53', '1602928321679-560bb453f190',
  '1611930022073-b7a4ba5fcccd', '1631729371254-42c2892f0e6e', '1596755389378-c31d21fd1273',
  '1552693673-1bf958298935',
];

/** 제품 이미지도 같은 풀을 순환시킨다 — 카드가 작아 사진의 개성이 드러나지 않는다. */
const PRODUCT_IDS = HERO_IDS;

type Seed = {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  categories: CategoryKey[];
  accent: string;
  founded: number;
  moq: number;
  lead: number;
  certs: string[];
  markets: string[];
  /** 제품명 4~8개. 브랜드의 성격이 목록에서 드러나야 카드가 살아난다. */
  products: string[];
};

const SEEDS: Seed[] = [
  { name: 'Neulhae', slug: 'neulhae', description: 'Fermented rice ferment skincare made in small batches in Jeonju. Every formula starts with a 90-day ferment.', tags: ['Fermented', 'Barrier repair', 'Clean beauty'], categories: ['skincare', 'cleansing'], accent: '#B08968', founded: 2019, moq: 50, lead: 21, certs: ['CPNP', 'Vegan'], markets: ['US', 'JP', 'SG'], products: ['Rice Ferment Toner 200ml', 'Barrier Repair Ampoule 30ml', 'Glow Ferment Essence 150ml', 'Overnight Rice Mask 80ml', 'Gentle Ferment Cleanser 150ml'] },
  { name: 'Sodam', slug: 'sodam', description: 'Minimal five-ingredient skincare for sensitive skin. No fragrance, no essential oils, no exceptions.', tags: ['Sensitive skin', 'Fragrance free', 'Minimal'], categories: ['skincare'], accent: '#8FA6B2', founded: 2020, moq: 30, lead: 18, certs: ['CPNP', 'FDA'], markets: ['US', 'DE', 'FR'], products: ['5-Ingredient Cream 50ml', 'Calming Serum 30ml', 'Bare Toner 250ml', 'Cica Balm 20g'] },
  { name: 'Hanbang Lab', slug: 'hanbang-lab', description: 'Korean herbal medicine tradition translated into modern actives. Ginseng, mugwort, and licorice root.', tags: ['Herbal', 'Ginseng', 'Anti-aging'], categories: ['skincare', 'mask'], accent: '#6B7F5E', founded: 2017, moq: 100, lead: 25, certs: ['CPNP', 'Halal', 'ISO 22716'], markets: ['US', 'MY', 'AE', 'ID'], products: ['Red Ginseng Serum 30ml', 'Mugwort Calming Mask 5ea', 'Licorice Brightening Cream 50ml', 'Herbal Infusion Toner 200ml', 'Ginseng Eye Cream 20ml', 'Root Recovery Ampoule 15ml'] },
  { name: 'Jeju Blue', slug: 'jeju-blue', description: 'Volcanic mineral water and sea kelp harvested off Jeju Island. Sourced within 30km of the factory.', tags: ['Jeju', 'Hydration', 'Marine'], categories: ['skincare', 'suncare'], accent: '#4F8FA8', founded: 2018, moq: 60, lead: 20, certs: ['CPNP', 'Vegan'], markets: ['US', 'JP', 'TW', 'HK'], products: ['Volcanic Water Gel 80ml', 'Sea Kelp Essence 120ml', 'Mineral Sun Fluid SPF50+ 50ml', 'Deep Ocean Mist 100ml', 'Kelp Recovery Mask 4ea'] },
  { name: 'Onnuri', slug: 'onnuri', description: 'Refill-first packaging with a returnable glass system. Cut plastic use by 71% since launch.', tags: ['Refillable', 'Sustainable', 'Zero waste'], categories: ['skincare', 'body'], accent: '#7A8B6F', founded: 2021, moq: 40, lead: 22, certs: ['Vegan', 'CPNP'], markets: ['DE', 'NL', 'SE', 'UK'], products: ['Refill Daily Cream 60ml', 'Glass Bottle Toner 200ml', 'Body Butter Refill 200g', 'Solid Cleansing Bar 100g'] },
  { name: 'Studio Cheom', slug: 'studio-cheom', description: 'Colour cosmetics designed by a Seoul editorial makeup team. Runway pigments in wearable formats.', tags: ['Colour', 'Editorial', 'Long wear'], categories: ['makeup'], accent: '#C25B5B', founded: 2020, moq: 80, lead: 24, certs: ['CPNP'], markets: ['US', 'JP', 'TH'], products: ['Velvet Blur Lip 3.5g', 'Sheer Cheek Tint 8ml', 'Editorial Eye Palette 9g', 'Second Skin Cushion 15g', 'Brow Sculpt Pencil 0.2g', 'Glass Lip Oil 6ml'] },
  { name: 'Damso', slug: 'damso', description: 'Single-origin camellia oil from Geoje island, cold-pressed and bottled without additives.', tags: ['Camellia', 'Single origin', 'Oil'], categories: ['skincare', 'haircare'], accent: '#C99A4E', founded: 2016, moq: 50, lead: 19, certs: ['CPNP', 'Vegan', 'ISO 22716'], markets: ['JP', 'US', 'FR'], products: ['Cold Press Camellia Oil 30ml', 'Camellia Hair Serum 100ml', 'Nourishing Face Balm 40g', 'Scalp Treatment Oil 60ml'] },
  { name: 'Pureun', slug: 'pureun', description: 'Suncare only. Six SPF50+ formulas tuned for different skin tones and finishes, no white cast.', tags: ['SPF50+', 'No white cast', 'Reef safe'], categories: ['suncare'], accent: '#E0A458', founded: 2019, moq: 100, lead: 20, certs: ['FDA', 'CPNP'], markets: ['US', 'AU', 'SG', 'PH'], products: ['Clear Sun Serum SPF50+ 50ml', 'Tone Up Sun Base SPF50+ 40ml', 'Sport Sun Stick SPF50+ 20g', 'Watery Sun Gel SPF50+ 60ml', 'Tinted Sun Fluid SPF50+ 35ml'] },
  { name: 'Moru', slug: 'moru', description: 'Sheet masks woven from Korean-grown cotton with a 24-hour serum soak. Made in Cheongju.', tags: ['Sheet mask', 'Cotton', 'Hydration'], categories: ['mask'], accent: '#D08C9E', founded: 2018, moq: 200, lead: 15, certs: ['CPNP', 'Vegan'], markets: ['US', 'JP', 'VN', 'TH'], products: ['Hydra Cotton Mask 10ea', 'Soothing Cica Mask 10ea', 'Brightening Vitamin Mask 10ea', 'Overnight Sleeping Mask 100ml', 'Barrier Lock Mask 10ea'] },
  { name: 'Hyeon', slug: 'hyeon', description: 'Peptide-forward anti-aging developed with a Yonsei dermatology lab. Clinical results in 8 weeks.', tags: ['Peptide', 'Clinical', 'Anti-aging'], categories: ['skincare'], accent: '#5E5B7A', founded: 2015, moq: 60, lead: 26, certs: ['CPNP', 'FDA', 'ISO 22716'], markets: ['US', 'UK', 'DE', 'JP'], products: ['Peptide 12 Ampoule 30ml', 'Firming Night Cream 50ml', 'Lifting Eye Serum 15ml', 'Retinal 0.1% Capsule 20ml', 'Collagen Boost Toner 200ml', 'Neck & Décolleté Cream 60ml'] },
  { name: 'Baram', slug: 'baram', description: 'Scalp care built like skincare. pH-balanced, silicone-free, formulated for hard-water markets.', tags: ['Scalp care', 'Silicone free', 'pH balanced'], categories: ['haircare'], accent: '#4C7C7C', founded: 2020, moq: 80, lead: 21, certs: ['CPNP', 'Vegan'], markets: ['US', 'DE', 'AE'], products: ['Scalp Balancing Shampoo 300ml', 'Root Tonic Ampoule 60ml', 'Silicone Free Conditioner 300ml', 'Weekly Scalp Scrub 150g', 'Leave-in Repair Milk 120ml'] },
  { name: 'Gyeol', slug: 'gyeol', description: 'Texture-first cleansing. Balms, oils and gels that dissolve heavy makeup without stripping.', tags: ['Cleansing balm', 'Double cleanse', 'Gentle'], categories: ['cleansing'], accent: '#B5876B', founded: 2019, moq: 60, lead: 18, certs: ['CPNP'], markets: ['US', 'JP', 'TW'], products: ['Melting Cleansing Balm 100ml', 'Deep Cleansing Oil 200ml', 'Low pH Gel Cleanser 150ml', 'Enzyme Powder Wash 50g', 'Micellar Water 300ml'] },
  { name: 'Seolhwa', slug: 'seolhwa', description: 'Snow lotus and edelweiss extracts from high-altitude farms. Luxury texture at indie pricing.', tags: ['Botanical', 'Luxury', 'Brightening'], categories: ['skincare', 'mask'], accent: '#9E8FB2', founded: 2017, moq: 70, lead: 24, certs: ['CPNP', 'ISO 22716'], markets: ['CN', 'JP', 'US', 'RU'], products: ['Snow Lotus Cream 50ml', 'Edelweiss Serum 30ml', 'Radiance Sleeping Mask 80ml', 'Petal Toner 200ml', 'Rich Repair Balm 30g'] },
  { name: 'Tteul', slug: 'tteul', description: 'Body care for dry climates. Ceramide-heavy lotions that hold up in desert and alpine markets.', tags: ['Ceramide', 'Body', 'Dry climate'], categories: ['body'], accent: '#A6785A', founded: 2021, moq: 50, lead: 20, certs: ['CPNP', 'Halal'], markets: ['AE', 'SA', 'KZ', 'US'], products: ['Ceramide Body Lotion 400ml', 'Rich Hand Cream 75ml', 'Dry Skin Body Wash 500ml', 'Overnight Foot Balm 60g'] },
  { name: 'Norigae', slug: 'norigae', description: 'Playful colour makeup in collectible packaging designed with Korean illustrators.', tags: ['Colour', 'Gift', 'Collab'], categories: ['makeup'], accent: '#E08AA8', founded: 2021, moq: 120, lead: 28, certs: ['CPNP'], markets: ['JP', 'TW', 'TH', 'US'], products: ['Illustrated Lip Tint 4g', 'Jelly Blush Pot 6g', 'Pearl Eye Glitter 5ml', 'Mini Palette 6g', 'Charm Lip Balm 3.5g'] },
  { name: 'Cheongmyeong', slug: 'cheongmyeong', description: 'Acne-focused actives. Salicylic, azelaic and niacinamide at dermatologist-grade concentrations.', tags: ['Acne', 'Actives', 'Oily skin'], categories: ['skincare', 'cleansing'], accent: '#5B8C7A', founded: 2018, moq: 60, lead: 22, certs: ['CPNP', 'FDA'], markets: ['US', 'BR', 'ID', 'PH'], products: ['BHA 2% Liquid 100ml', 'Azelaic 10% Cream 30ml', 'Niacinamide 10% Serum 30ml', 'Clarifying Foam 150ml', 'Spot Patch 24ea', 'Pore Clay Mask 80g'] },
  { name: 'Marn', slug: 'marn', description: 'Lip specialists. Twenty-two shades developed for warm-toned skin across Southeast Asia.', tags: ['Lip', 'Shade range', 'Long wear'], categories: ['makeup'], accent: '#B84A5E', founded: 2020, moq: 100, lead: 25, certs: ['CPNP', 'Halal'], markets: ['ID', 'MY', 'TH', 'PH', 'VN'], products: ['Matte Lip Mousse 4g', 'Water Lip Tint 4.5g', 'Lip Glow Balm 3.8g', 'Velvet Lip Pencil 0.3g', 'Overnight Lip Mask 15g', 'Lip Primer 4ml'] },
  { name: 'Sillok', slug: 'sillok', description: 'Green tea from Boseong terraces, harvested at first flush and processed for cosmetic actives.', tags: ['Green tea', 'Antioxidant', 'Soothing'], categories: ['skincare', 'cleansing', 'mask'], accent: '#5F8A5A', founded: 2015, moq: 80, lead: 21, certs: ['CPNP', 'Vegan', 'ISO 22716'], markets: ['US', 'JP', 'FR', 'TW'], products: ['First Flush Tea Serum 30ml', 'Green Tea Foam 150ml', 'Tea Tree Balancing Toner 200ml', 'Matcha Clay Mask 80g', 'Tea Seed Cream 50ml', 'Leaf Water Essence 150ml'] },
  { name: 'Nabi', slug: 'nabi', description: 'Cruelty-free colour cosmetics with a 100% vegan certified line and biodegradable glitter.', tags: ['Vegan', 'Cruelty free', 'Colour'], categories: ['makeup', 'skincare'], accent: '#9B6FC4', founded: 2020, moq: 90, lead: 26, certs: ['Vegan', 'CPNP'], markets: ['UK', 'DE', 'US', 'AU'], products: ['Vegan Cushion 15g', 'Bio Glitter Liner 5ml', 'Plant Pigment Palette 8g', 'Vegan Mascara 8ml', 'Tinted Moisturiser 40ml'] },
];

const now = '2026-09-01T00:00:00.000Z';

/**
 * 태그·카테고리 → 고객 니즈. 컨시어지는 카테고리가 아니라 니즈로 묻기 때문에
 * ("스킨케어"가 아니라 "수분·안티에이징") 브랜드도 같은 축으로 번역해 둔다.
 * @PORT(schema): 실서버에서는 브랜드 입점 폼에서 직접 고르게 하는 편이 정확하다.
 */
const NEED_TAGS: Record<NeedKey, RegExp> = {
  hydration: /hydration|marine|jeju|sheet mask|camellia/i,
  antiaging: /anti-aging|peptide|ginseng|luxury|clinical/i,
  sensitive: /sensitive|fragrance free|barrier|soothing|gentle|minimal|ceramide|fermented/i,
  acne: /acne|oily|actives/i,
  sun: /spf|reef/i,
  brightening: /brightening|green tea|antioxidant/i,
  clean: /vegan|clean|sustainable|cruelty|zero waste|refill/i,
  makeup: /colour|lip|editorial/i,
  hair: /scalp|silicone free/i,
  body: /body|dry climate/i,
};
const NEED_CATEGORY: Partial<Record<CategoryKey, NeedKey>> = {
  suncare: 'sun',
  makeup: 'makeup',
  haircare: 'hair',
  body: 'body',
  mask: 'hydration',
};

function deriveNeeds(s: Seed): NeedKey[] {
  const text = `${s.tags.join(' ')} ${s.description}`;
  const out = new Set<NeedKey>();
  (Object.keys(NEED_TAGS) as NeedKey[]).forEach((k) => NEED_TAGS[k].test(text) && out.add(k));
  s.categories.forEach((c) => NEED_CATEGORY[c] && out.add(NEED_CATEGORY[c]!));
  return Array.from(out);
}

/** 시드를 전체 DTO 로 확장. 서버 필드는 전부 서버가 주는 모양 그대로 채운다. */
export const MOCK_BRANDS: BuyerBrand[] = SEEDS.map((s, i) => ({
  id: `brand_${s.slug}`,
  name: s.name,
  slug: s.slug,
  // ⚠️ tagline 은 소개문이 아니라 태그 마커다. 실서버가 이 형식으로 저장한다.
  tagline: encodeBrandTags(s.tags),
  description: s.description,
  logosCircle: [IMG(HERO_IDS[i % HERO_IDS.length], 200)],
  logosWide: [],
  logosTall: [],
  logoLayout: 'circle',
  accentColor: s.accent,
  gradientStrength: 0,
  order: i,
  status: 'approved',
  createdAt: now,
  updatedAt: now,
  // @PORT(schema) 아래부터
  heroImage: IMG(HERO_IDS[i % HERO_IDS.length], 900),
  categoryKeys: s.categories,
  moqUnits: s.moq,
  leadTimeDays: s.lead,
  certifications: s.certs,
  exportMarkets: s.markets,
  yearFounded: s.founded,
  skinNeeds: deriveNeeds(s),
  // 2018 년 이전 창업 + 수출국 넷 이상이면 "이미 알려진" 브랜드로 본다.
  tier: s.founded <= 2018 && s.markets.length >= 4 ? 'established' : 'emerging',
  // 수출국이 적을수록 새 시장에 독점을 내줄 여지가 크다.
  exclusiveOpen: s.markets.length <= 3,
  // 소매가의 50 / 52.5 / 55% — auto-reply 의 "45–50% off retail" 과 같은 범위다.
  wholesaleRatio: 0.5 + (i % 3) * 0.025,
}));

/**
 * 제품 이미지 배정. ⚠️ 그 브랜드의 히어로와 같은 사진은 건너뛴다 —
 * 한 페이지 안에서 커버와 제품 카드에 똑같은 사진이 두 번 뜨는 게 눈에 띈다.
 */
function productImageId(brandIdx: number, prodIdx: number): string {
  const pool = PRODUCT_IDS.length;
  const hero = brandIdx % HERO_IDS.length;
  // ⚠️ 충돌 시 i+1 로 밀면 **다음 제품과 겹친다**(실제로 한 브랜드에서 제품 두 개가
  //    같은 사진이 됐다). 히어로를 뺀 pool-1 개 안에서 자리를 잡은 뒤 히어로 자리만
  //    건너뛰어, 제품 인덱스 → 사진이 단사(injective)가 되게 한다.
  let i = (brandIdx * 3 + prodIdx) % (pool - 1);
  if (i >= hero) i += 1;
  return PRODUCT_IDS[i];
}

/** 가격은 결정론적으로 파생한다 — 랜덤이면 새로고침마다 값이 바뀐다. */
function priceCents(brandIdx: number, prodIdx: number): number {
  return 1200 + ((brandIdx * 7 + prodIdx * 13) % 46) * 100 + 90;
}

const MOCK_PRODUCTS: Record<string, ProductListItem[]> = {};
SEEDS.forEach((s, bi) => {
  const brandId = `brand_${s.slug}`;
  MOCK_PRODUCTS[brandId] = s.products.map((name, pi) => {
    const price = priceCents(bi, pi);
    const discount = (bi + pi) % 5 === 0 ? 15 : 0;
    const catKey = s.categories[pi % s.categories.length];
    return {
      id: `${s.slug}_p${pi + 1}`,
      brand: s.name,
      name,
      category: catKey,
      categoryKey: catKey,
      image: IMG(productImageId(bi, pi), 500),
      customerPriceUsd: price,
      listPriceUsd: discount ? Math.round(price / (1 - discount / 100)) : price,
      customerDiscountPercent: discount,
      rating: 4 + ((bi + pi) % 10) / 10,
      reviewCount: 12 + ((bi * 17 + pi * 5) % 240),
    };
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   조회 함수. ⚠️ 화면 컴포넌트는 MOCK_BRANDS / MOCK_PRODUCTS 를 직접 import 하지 않고
   반드시 이 함수들을 거친다 — 이식 시 이 함수들만 useQuery 로 바뀐다.
   ──────────────────────────────────────────────────────────────────────────── */

/** @PORT(api): GET /v1/brands */
export function getBrands(): BuyerBrand[] {
  return MOCK_BRANDS;
}

/** @PORT(api): GET /v1/brands/by-slug/{slug} */
export function getBrandBySlug(slug: string): BuyerBrand | undefined {
  return MOCK_BRANDS.find((b) => b.slug === slug);
}

export function getBrandById(id: string): BuyerBrand | undefined {
  return MOCK_BRANDS.find((b) => b.id === id);
}

/** @PORT(api): GET /v1/products?brandId= */
export function getProducts(brandId: string): ProductListItem[] {
  return MOCK_PRODUCTS[brandId] ?? [];
}

export function getProductsByIds(brandId: string, ids: string[]): ProductListItem[] {
  const all = getProducts(brandId);
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is ProductListItem => !!p);
}

/**
 * 도매가(= 샘플가). 센트 정수.
 * @PORT(schema): 실서버의 ProductListItem 에는 도매가 필드가 없다 — 바이어 전용 가격표가
 *                생기면 그 값으로 바꾼다. 화면은 이 함수만 거친다.
 */
export function wholesaleCents(product: ProductListItem): number {
  const brand = MOCK_BRANDS.find((b) => b.name === product.brand);
  return Math.round((product.customerPriceUsd * (brand?.wholesaleRatio ?? 0.5)) / 10) * 10;
}

/** 이 브랜드에서 가장 싼 샘플(도매가). 브랜드 카드의 "Samples from" 에 쓴다. */
export function sampleFromCents(brandId: string): number | null {
  const prices = getProducts(brandId).map(wholesaleCents);
  return prices.length ? Math.min(...prices) : null;
}

/** 홈 진열대 — 브랜드마다 대표 제품 하나씩. */
export function getFeaturedProducts(count = 8): { product: ProductListItem; brand: BuyerBrand }[] {
  return MOCK_BRANDS.slice(0, count).map((brand) => ({ product: getProducts(brand.id)[0], brand }));
}

/** 요청 폼에서 아무것도 안 고른 사용자를 위한 원클릭 채움. */
export function getBestsellers(brandId: string, count = 3): ProductListItem[] {
  return getProducts(brandId).slice(0, count);
}
