/**
 * klow_web(소비자 스토어) 링크. 바이어용 화면에서 "실제 판매 페이지"로 나갈 때 쓴다.
 *
 * ⚠️ 여기서 브랜드관·제품 상세를 다시 만들지 않는다 — klow_web 에 이미 있고,
 *    바이어가 소매 가격·상세 설명·리뷰를 확인하려는 목적이라면 그 화면이 정본이다.
 *
 * @PORT(api): 목데이터의 slug/제품 id 는 가상이라 지금은 실제로 열리지 않는다.
 *             실서버 데이터가 들어오면 그대로 동작한다 — URL 형태는 klow_web 실물과 같다.
 */
const KLOW_WEB_ORIGIN = 'https://klow.kr';

/** 브랜드관. klow_web 의 정식 URL 은 루트 레벨 슬러그다(`klow.kr/{slug}`). */
export function storefrontUrl(slug: string | null): string | null {
  if (!slug) return null;
  return `${KLOW_WEB_ORIGIN}/${slug}`;
}

/**
 * 제품 상세.
 * ⚠️ `?brand=` 를 반드시 붙인다 — klow_web 이 이 파라미터로 "브랜드관을 거쳐 온 방문"을
 *    판정해 하단 탭바를 숨기고 브랜드 문맥을 유지한다. 빼면 마켓플레이스 문맥으로 열린다.
 */
export function productUrl(productId: string, slug: string | null): string {
  const base = `${KLOW_WEB_ORIGIN}/product/${encodeURIComponent(productId)}`;
  return slug ? `${base}?brand=${encodeURIComponent(slug)}` : base;
}
