'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import {
  EMPTY_ADDRESS,
  ShippingAddressFields,
  fromShippingAddress,
  toShippingAddress,
  type AddressForm,
} from '@/components/address/ShippingAddressFields';
import { COUNTRIES } from '@/lib/countries';
import { initials, normalizeWebsite } from '@/lib/format';
import { useAppActions, useAppState } from '@/lib/store';
import type { AnnualVolume, Buyer, BusinessType, ContactChannel } from '@/lib/types';
import type { CategoryKey } from '@/lib/categories';

const BUSINESS_TYPES: BusinessType[] = [
  'Retailer', 'E-commerce', 'Distributor', 'Importer',
  'Wholesaler', 'Salon & Spa', 'Sourcing agency', 'Other',
];
const VOLUMES: AnnualVolume[] = [
  'Under $10K', '$10K – $50K', '$50K – $200K', '$200K – $1M', '$1M+',
];
const CHANNELS: ContactChannel[] = ['Email', 'WhatsApp', 'KakaoTalk'];

/** 폼 상태 = 프로필에서 편집 가능한 값만. 서버가 주는 id·createdAt 은 다루지 않는다. */
type ProfileForm = {
  fullName: string;
  companyName: string;
  country: string;
  businessType: BusinessType;
  annualVolume: AnnualVolume;
  website: string;
  categories: CategoryKey[];
  contactChannel: ContactChannel;
  contactHandle: string;
  recipientName: string;
  recipientEmail: string;
  address: AddressForm;
};

function toForm(b: Buyer): ProfileForm {
  const saved = b.defaultShipTo;
  return {
    fullName: b.fullName,
    companyName: b.companyName,
    country: b.country,
    businessType: b.businessType,
    annualVolume: b.annualVolume,
    website: b.website ?? '',
    categories: b.categories,
    contactChannel: b.contactChannel ?? 'Email',
    contactHandle: b.contactHandle ?? '',
    recipientName: saved?.recipientName ?? b.fullName,
    recipientEmail: saved?.email ?? b.email,
    address: saved ? fromShippingAddress(saved) : { ...EMPTY_ADDRESS, country: b.country },
  };
}

export default function ProfilePage() {
  const { buyer, hydrated } = useAppState();
  const { updateBuyer, signOut, openAuth } = useAppActions();
  const toast = useToast();

  const [form, setForm] = useState<ProfileForm | null>(null);

  // ⚠️ localStorage 를 읽기 전에는 buyer 가 null 이라 폼을 만들 수 없다. hydrate 후 한 번 채운다.
  useEffect(() => {
    if (buyer && !form) setForm(toForm(buyer));
  }, [buyer, form]);

  /** 저장 버튼은 실제로 바뀐 게 있을 때만 켠다 — 안 그러면 "저장했다"는 신호가 의미를 잃는다. */
  const dirty = useMemo(
    () => (buyer && form ? JSON.stringify(toForm(buyer)) !== JSON.stringify(form) : false),
    [buyer, form],
  );

  if (!hydrated) return <Shell />;

  if (!buyer) {
    return (
      <Shell>
        <div className="mt-10 border-t border-line pt-14 sm:pt-16">
          <p className="font-display text-[18px] font-semibold text-ink">
            Sign in to see your profile
          </p>
          <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-sub">
            Your company details and default shipping address live here.
          </p>
          <div className="mt-6">
            <Button onClick={openAuth}>Sign in</Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (!form) return <Shell />;

  const set = (patch: Partial<ProfileForm>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  const save = () => {
    // @PORT(api): PATCH /v1/buyer/me
    updateBuyer({
      fullName: form.fullName.trim(),
      companyName: form.companyName.trim(),
      country: form.country,
      businessType: form.businessType,
      annualVolume: form.annualVolume,
      website: normalizeWebsite(form.website) || undefined,
      categories: form.categories,
      contactChannel: form.contactChannel,
      contactHandle: form.contactHandle.trim() || undefined,
      defaultShipTo: toShippingAddress(form.address, {
        recipientName: form.recipientName,
        email: form.recipientEmail,
      }),
    });
    toast.success('Profile updated');
  };

  return (
    <Shell>
      <header className="mt-6 flex items-center gap-3 sm:mt-8 sm:gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[16px] font-bold text-white sm:h-14 sm:w-14 sm:text-[17px]">
          {initials(buyer.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[18px] font-semibold text-ink">
            {buyer.companyName}
          </p>
          {/* 이메일은 계정 식별자라 여기서 바꾸지 않는다(실서버에서는 재인증이 필요하다). */}
          <p className="truncate text-[13px] text-sub">{buyer.email}</p>
        </div>
      </header>

      <form
        className="mt-6 overflow-hidden rounded-none border border-line bg-surface sm:mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Card title="Your company">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" required>
              <input
                required
                className="form-input"
                value={form.fullName}
                onChange={(e) => set({ fullName: e.target.value })}
              />
            </Field>
            <Field label="Company name" required>
              <input
                required
                className="form-input"
                value={form.companyName}
                onChange={(e) => set({ companyName: e.target.value })}
              />
            </Field>
            <Field label="Country / region" required>
              <select
                className="form-select"
                value={form.country}
                onChange={(e) => set({ country: e.target.value })}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Company website"
              hint={buyer.website ? undefined : 'Brands check this before sending samples.'}
            >
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                className="form-input"
                placeholder="sensa-retail.com"
                value={form.website}
                onChange={(e) => set({ website: e.target.value })}
              />
              {buyer.website && (
                <a
                  href={buyer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[12px] text-sub underline underline-offset-2 hover:text-ink"
                >
                  {buyer.website}
                </a>
              )}
            </Field>
          </div>
        </Card>

        <Card title="How you buy" hint="Brands read this before sending samples.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business type" required>
              <select
                className="form-select"
                value={form.businessType}
                onChange={(e) => set({ businessType: e.target.value as BusinessType })}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Annual purchase volume" required>
              <select
                className="form-select"
                value={form.annualVolume}
                onChange={(e) => set({ annualVolume: e.target.value as AnnualVolume })}
              >
                {VOLUMES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <span className="mb-1 block text-[13px] font-semibold text-ink">
              Categories of interest
            </span>
            <CategoryFilter
              selected={form.categories}
              includeAll={false}
              wrap
              onSelect={(key) =>
                key &&
                set({
                  categories: form.categories.includes(key)
                    ? form.categories.filter((k) => k !== key)
                    : [...form.categories, key],
                })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
            <Field label="Preferred contact">
              <select
                className="form-select"
                value={form.contactChannel}
                onChange={(e) => set({ contactChannel: e.target.value as ContactChannel })}
              >
                {CHANNELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Handle or number">
              <input
                className="form-input"
                placeholder="+1 555 0100"
                value={form.contactHandle}
                onChange={(e) => set({ contactHandle: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Default shipping address"
          hint="Sample requests start with this — you can still change it per request."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name" required>
              <input
                required
                className="form-input"
                value={form.recipientName}
                onChange={(e) => set({ recipientName: e.target.value })}
              />
            </Field>
            <Field label="Email" required hint="Where the brand sends tracking.">
              <input
                required
                type="email"
                className="form-input"
                value={form.recipientEmail}
                onChange={(e) => set({ recipientEmail: e.target.value })}
              />
            </Field>
          </div>
          {/* 요청 모달과 같은 컴포넌트. */}
          <ShippingAddressFields
            value={form.address}
            onChange={(patch) => set({ address: { ...form.address, ...patch } })}
          />
        </Card>

        {/* ⚠️ `flex-wrap` 이 있어야 320px 에서 "Sign out" 이 화면 밖으로 밀리지 않는다. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line bg-bg px-5 py-4 sm:px-7 sm:py-5">
          <Button type="submit" disabled={!dirty}>
            Save changes
          </Button>
          {dirty && (
            <button
              type="button"
              onClick={() => setForm(toForm(buyer))}
              className="text-[13px] text-sub underline underline-offset-2 hover:text-ink"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              signOut();
              toast.info('Signed out');
            }}
            className="ml-auto text-[13px] font-semibold text-danger underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[760px] px-6 pb-4 pt-8 md:px-10 md:pt-14">
      {/* ⚠️ 여기에 "My requests" 링크를 두지 않는다 — 같은 링크가 고정 헤더에 늘 떠
             있어서, 제목 옆에 또 두면 화면에 같은 목적지가 두 개 보인다. */}
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.01em] sm:text-[36px]">
        Profile
      </h1>
      {children}
    </div>
  );
}

/**
 * ⚠️ 구획마다 카드를 따로 두지 않는다. 같은 폭·같은 라운딩·같은 테두리의 흰 상자가
 *    셋 쌓이면 어느 상자가 무엇인지 형태로는 구분되지 않고, 프로필이 "설정 대시보드"
 *    처럼 보인다. 한 장 안에서 머리글 + 실선으로 나누면 구획은 그대로 읽히면서
 *    화면에 남는 상자는 하나뿐이다.
 */
function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-line px-5 py-6 first:border-t-0 sm:px-7 sm:py-7">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">{title}</h2>
        {hint && <p className="mt-1 text-[12.5px] text-sub">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
