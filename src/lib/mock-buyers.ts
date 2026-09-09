import type { Buyer } from '@/lib/types';

/**
 * 이미 가입돼 있는 바이어 계정(데모용).
 *
 * @PORT(drop) — 실서버에서는 `POST /v1/buyer/auth/check-email` 이 이 판정을 한다.
 * 프로토타입에 이 목록이 있어야 "기존 유저 → 로그인 / 신규 → 가입" 두 갈래를
 * 둘 다 눌러볼 수 있다. 하나라도 없으면 한쪽 화면이 도달 불가라 검토가 안 된다.
 *
 * ⚠️ 비밀번호는 확인하지 않는다 — 디자인 단계이므로 비어 있지 않으면 통과한다.
 */
const REGISTERED: Buyer[] = [
  {
    id: 'buyer_demo_sensa',
    fullName: 'Alex Moreau',
    email: 'alex@sensa-retail.com',
    companyName: 'Sensa Retail',
    country: 'United States',
    businessType: 'Retailer',
    annualVolume: '$50K – $200K',
    website: 'https://sensa-retail.com',
    categories: ['skincare', 'suncare'],
    contactChannel: 'Email',
    contactHandle: 'alex@sensa-retail.com',
    createdAt: '2026-05-14T00:00:00.000Z',
  },
  {
    id: 'buyer_demo_lumiere',
    fullName: 'Camille Faure',
    email: 'camille@lumiere-paris.fr',
    companyName: 'Lumière Paris',
    country: 'France',
    businessType: 'Distributor',
    annualVolume: '$200K – $1M',
    categories: ['skincare', 'mask'],
    contactChannel: 'WhatsApp',
    contactHandle: '+33 6 12 34 56 78',
    createdAt: '2026-03-02T00:00:00.000Z',
  },
];

/** @PORT(api): POST /v1/buyer/auth/check-email — 이메일이 이미 가입돼 있는가. */
export function findRegisteredBuyer(email: string): Buyer | undefined {
  const key = email.trim().toLowerCase();
  return REGISTERED.find((b) => b.email.toLowerCase() === key);
}

/** 데모에서 "기존 계정" 경로를 눌러 보려는 사람에게 보여줄 예시 이메일. */
export const DEMO_ACCOUNT_EMAIL = REGISTERED[0].email;
