'use client';

import { Field } from '@/components/ui/Field';
import { COUNTRIES, countryByName, DEFAULT_COUNTRY } from '@/lib/countries';
import type { ShippingAddress } from '@/lib/types';

/**
 * 배송지 입력 묶음. **샘플 요청 모달과 프로필 페이지가 같은 컴포넌트를 쓴다** —
 * 두 화면이 같은 값을 각자 그리면 필드 순서·국가번호 파생·미국 State 규칙이
 * 반드시 갈린다(요청 폼에서 저장한 주소를 프로필이 다르게 편집하게 된다).
 *
 * ⚠️ 필드 순서는 klow_web 결제 폼과 같다. 도시·우편번호가 주소칸 **위**에 있는 것은
 *    의도이니 바꾸지 말 것 — 실서버에서 주소칸이 Google Places 자동완성이 되면,
 *    도시를 먼저 받아 둬야 다른 도시의 주소가 돌아왔을 때 그 자리에서 경고할 수 있다.
 */
export type AddressForm = {
  /** 국가 **이름**. iso2 는 저장 시점에 파생한다. */
  country: string;
  phoneLocal: string;
  city: string;
  postalCode: string;
  line1: string;
  line2: string;
  state: string;
};

export const EMPTY_ADDRESS: AddressForm = {
  country: DEFAULT_COUNTRY.name,
  phoneLocal: '',
  city: '',
  postalCode: '',
  line1: '',
  line2: '',
  state: '',
};

/** 미국인가 — State 칸 노출과 저장 시 비우기가 같은 판정을 써야 한다. */
export function needsState(countryName: string): boolean {
  return countryByName(countryName)?.code === 'US';
}

export function toShippingAddress(
  form: AddressForm,
  contact: { recipientName: string; email: string },
): ShippingAddress {
  const country = countryByName(form.country) ?? DEFAULT_COUNTRY;
  return {
    recipientName: contact.recipientName.trim(),
    email: contact.email.trim(),
    country: country.name,
    countryCode: country.code,
    phoneLocal: form.phoneLocal.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
    line1: form.line1.trim(),
    line2: form.line2.trim(),
    // ⚠️ 미국이 아니면 비운다 — 미국으로 골랐다 바꾼 사람의 주가 남으면 송장에 그대로 나간다.
    state: needsState(form.country) ? form.state.trim() : '',
  };
}

export function fromShippingAddress(a: ShippingAddress): AddressForm {
  return {
    country: a.country,
    phoneLocal: a.phoneLocal,
    city: a.city,
    postalCode: a.postalCode,
    line1: a.line1,
    line2: a.line2,
    state: a.state,
  };
}

export function ShippingAddressFields({
  value,
  onChange,
}: {
  value: AddressForm;
  onChange: (patch: Partial<AddressForm>) => void;
}) {
  const country = countryByName(value.country) ?? DEFAULT_COUNTRY;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" required>
          <select
            className="form-select"
            value={value.country}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code}>{c.name}</option>
            ))}
          </select>
        </Field>
        {/* ⚠️ 힌트는 실제로 보여 줄 번호가 있을 때만 그린다. 빈 칸에 `Sent as +1 …` 을
               띄우면 아직 아무것도 안 친 손님에게 말줄임표만 남아 고장난 줄로 읽힌다. */}
        <Field
          label="Phone"
          required
          hint={value.phoneLocal ? `Sent as ${country.dial} ${value.phoneLocal}` : undefined}
        >
          {/* 국가번호는 국가 선택에서 파생된다 — 손님이 따로 고르지 않는다. */}
          <div className="flex items-stretch">
            <span className="flex min-w-[62px] shrink-0 items-center justify-center rounded-l-[10px] border border-r-0 border-line bg-field px-3 text-[14px] font-semibold text-ink">
              {country.dial}
            </span>
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={16}
              className="form-input rounded-l-none"
              placeholder="10 1234 5678"
              value={value.phoneLocal}
              onChange={(e) =>
                onChange({ phoneLocal: e.target.value.replace(/[^+\-()0-9 ]/g, '') })
              }
            />
          </div>
        </Field>
      </div>

      {/* ⚠️ 도시·우편번호에 예시 플레이스홀더를 넣지 않는다 — 국가마다 형식이 다른데
          값은 고정이라, 일본을 고른 손님에게 "New York / 10014" 를 보여주게 된다. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" required>
          <input
            required
            autoComplete="address-level2"
            className="form-input"
            value={value.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </Field>
        <Field label="Postal code" required>
          <input
            required
            autoComplete="postal-code"
            className="form-input"
            value={value.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
          />
        </Field>
      </div>

      {/* @PORT(api): klow_web 의 <AddressAutocomplete/>(Google Places)로 교체한다.
          여기서는 API 를 붙이지 않으므로 같은 자리·같은 모양의 일반 입력칸으로 둔다 —
          가짜 제안 목록을 띄우면 리뷰에서 동작하는 기능으로 오해된다. */}
      <Field label="Address" required>
        <input
          required
          autoComplete="address-line1"
          className="form-input"
          placeholder="Street address"
          value={value.line1}
          onChange={(e) => onChange({ line1: e.target.value })}
        />
      </Field>

      <Field label="Apartment, suite, etc." hint="Optional">
        <input
          autoComplete="address-line2"
          className="form-input"
          placeholder="Apt 4B"
          value={value.line2}
          onChange={(e) => onChange({ line2: e.target.value })}
        />
      </Field>

      {/* 미국 배송 전용 — EFS 송장이 "City, State" 를 요구한다(klow_web 과 동일). */}
      {needsState(value.country) && (
        <Field label="State" required hint="Two-letter code, e.g. NY">
          <input
            required
            autoComplete="address-level1"
            maxLength={2}
            className="form-input uppercase"
            placeholder="NY"
            value={value.state}
            onChange={(e) => onChange({ state: e.target.value.toUpperCase() })}
          />
        </Field>
      )}
    </>
  );
}
