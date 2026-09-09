/**
 * 배송지 국가 목록. 바이어가 실제로 나오는 시장 위주로 추렸다.
 *
 * ⚠️ `dial` 은 klow_web 결제 폼의 PhoneInput 처럼 전화 입력칸 앞에 붙는 국가번호다.
 *    @PORT(api): 실서버에서는 `GET /v1/shipping-countries` 가 배송 가능 국가를 내려주고
 *    klow_web 은 CountryPicker(검색형)를 쓴다 — 여기서는 셀렉트로만 흉내 낸다.
 */
export type Country = { name: string; code: string; dial: string };

export const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Mexico', code: 'MX', dial: '+52' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Chile', code: 'CL', dial: '+56' },
  { name: 'Colombia', code: 'CO', dial: '+57' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Netherlands', code: 'NL', dial: '+31' },
  { name: 'Spain', code: 'ES', dial: '+34' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Poland', code: 'PL', dial: '+48' },
  { name: 'Sweden', code: 'SE', dial: '+46' },
  { name: 'Norway', code: 'NO', dial: '+47' },
  { name: 'Denmark', code: 'DK', dial: '+45' },
  { name: 'Switzerland', code: 'CH', dial: '+41' },
  { name: 'Portugal', code: 'PT', dial: '+351' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'Kazakhstan', code: 'KZ', dial: '+7' },
  { name: 'Ukraine', code: 'UA', dial: '+380' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Qatar', code: 'QA', dial: '+974' },
  { name: 'Kuwait', code: 'KW', dial: '+965' },
  { name: 'Israel', code: 'IL', dial: '+972' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: 'Taiwan', code: 'TW', dial: '+886' },
  { name: 'Hong Kong', code: 'HK', dial: '+852' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'Malaysia', code: 'MY', dial: '+60' },
  { name: 'Indonesia', code: 'ID', dial: '+62' },
  { name: 'Thailand', code: 'TH', dial: '+66' },
  { name: 'Vietnam', code: 'VN', dial: '+84' },
  { name: 'Philippines', code: 'PH', dial: '+63' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'New Zealand', code: 'NZ', dial: '+64' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'Nigeria', code: 'NG', dial: '+234' },
  { name: 'Egypt', code: 'EG', dial: '+20' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function countryByName(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.name === name);
}
