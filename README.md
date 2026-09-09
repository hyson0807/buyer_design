# buyer_design

해외 바이어가 한국 인디 뷰티 브랜드를 둘러보고 → 샘플을 요청하고 → 브랜드와 대화하는
플랫폼의 **디자인 프로토타입**. 백엔드 연동 없이 목데이터 + 클라이언트 상태만으로
전체 플로우를 실제로 클릭해볼 수 있다.

기획이 확정되면 이 컴포넌트들을 `klow_buyer` 로 옮겨 실제 API 에 물린다.

```bash
npm install
npm run dev          # http://localhost:3003
npm run type-check
npm run check:images # 목데이터의 원격 이미지 URL 전수 검증
```

포트 3003 은 admin(3000) · web(3001) · brand(3002) · server(4000) 과 겹치지 않게 고른 값이다.

## 화면

| 라우트 | 내용 |
|---|---|
| `/` | 브랜드 이미지 그리드 + 카테고리 필터 |
| `/brands/[slug]` | 브랜드 소개 · Brand facts · 제품 그리드(다중 선택) · Request samples |
| `/requests` | 내 요청 목록 = 채팅 진입 허브 |
| `/requests/[id]` | 요청 요약 + 상태 스테퍼 + 브랜드 채팅 |

로그인 · 회원가입 · 샘플 요청은 **라우트가 아니라 모달**이다. 브랜드 페이지를 떠나면
골라 둔 제품 선택이 사라지기 때문이고, 그래서 미로그인 사용자가 Request samples 를 눌러도
가입을 마치면 고르던 제품이 그대로 요청 폼에 들어온다(`pendingIntent`).

푸터의 **Reset demo** 로 세션·요청·대화를 초기화한다.

## klow_buyer 로 옮길 때

`grep -rn "@PORT(" src/` 로 교체 지점을 전부 찾을 수 있다.

| 토큰 | 의미 |
|---|---|
| `@PORT(api)` | 목데이터 조회 → 실제 엔드포인트 |
| `@PORT(auth)` | 가짜 세션 → klow_server 세션/쿠키 |
| `@PORT(schema)` | 서버 DTO 에 아직 없는 필드 |
| `@PORT(drop)` | 프로토타입 전용, 이식 시 삭제 |

주석보다 중요한 구조 규약 두 가지 — 이게 이식 비용을 결정한다:

1. **화면 컴포넌트는 `dispatch` 를 직접 호출하지 않는다.** 전부 `useAppActions()` 를 거치므로,
   이식은 `src/lib/store.ts` 의 액션 함수 본문을 `useMutation` 으로 바꾸는 작업으로 끝난다.
2. **화면 컴포넌트는 `MOCK_BRANDS` 를 직접 import 하지 않는다.** 전부 `getBrandBySlug()` /
   `getProducts()` 같은 조회 함수를 거치므로, 그 함수들만 `useQuery` 로 바뀐다.

타입은 `src/lib/types.ts` 에서 **서버 DTO 미러**(`Brand`, `ProductListItem`)와
**우리가 지어낸 필드**(`BuyerBrandExtras`)를 일부러 분리해 두었다. 합치면 어떤 필드가
서버에 없는 것인지 코드에서 사라진다.

### 서버 DTO 를 미러링할 때 밟은 함정 두 개

- **`Brand.tagline` 은 소개문이 아니다.** `__klow_brand_tags_v1__:a,b,c` 형태의 태그 마커
  문자열이고, 사람이 읽는 소개문은 `description` 이다. `src/lib/brand-tags.ts` 를
  klow_web 에서 그대로 복사해 왔으니 그 함수를 거칠 것.
- **`logoUrl` / `coverImageUrl` 같은 필드는 서버에 없다.** 로고는 `logosCircle` /
  `logosWide` / `logosTall` 세 배열뿐이고, 실제 DB 에는 셋 다 빈 브랜드가 흔하다 —
  그래서 `ui/SafeImage.tsx` 의 폴백은 프로토타입용 임시방편이 아니라 klow_buyer 도
  그대로 필요로 하는 요구사항이다.

## 목데이터

브랜드 19개 + 제품 약 100개. 전부 가상이다.

⚠️ **브랜드가 19개인 것은 디자인 결정이 아니라 사진 제약이다.** 실제 입점사는 30여 곳이지만,
스톡 뷰티 사진 대부분에 실제 경쟁 브랜드 로고가 박혀 있어서(Curology · Chanel · NARS ·
Clinique · Gucci · Estée Lauder · Bobbi Brown 을 실제로 골라 넣었다가 걷어냈다) 쓸 수 있는
사진이 19장뿐이었다. 같은 사진을 두 브랜드가 나눠 쓰면 그리드에서 바로 눈에 띄므로
브랜드 수를 사진 수에 맞췄다. **실제 브랜드 사진이 들어오면 `SEEDS` 에 줄만 추가하면 된다.**

이미지 URL 을 손대면 반드시 `npm run check:images` 를 돌릴 것 — 처음 후보 20개 중 3개가
404 였고, 화면에서는 회색 타일로만 보여 조용히 넘어간다.

## 안 만든 것

백엔드 · 라우트 가드(`middleware.ts`) · react-query · zustand · 스켈레톤 · 제품 상세(PDP) ·
검색 · 정렬 · 장바구니/결제(klow_web 영역) · 다크모드 · 전화 OTP(해외 바이어는 KR SMS 를
받지 못한다) · 실제 Google OAuth · 약관 본문 페이지.
