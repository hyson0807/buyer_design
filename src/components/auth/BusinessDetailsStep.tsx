'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import { COUNTRIES } from '@/lib/countries';
import { normalizeWebsite } from '@/lib/format';
import type { CategoryKey } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { AnnualVolume, BusinessType, ContactChannel } from '@/lib/types';

const BUSINESS_TYPES: BusinessType[] = [
  'Retailer', 'E-commerce', 'Distributor', 'Importer',
  'Wholesaler', 'Salon & Spa', 'Sourcing agency', 'Other',
];

const VOLUMES: AnnualVolume[] = [
  'Under $10K', '$10K – $50K', '$50K – $200K', '$200K – $1M', '$1M+',
];

const CHANNELS: ContactChannel[] = ['Email', 'WhatsApp', 'KakaoTalk'];

export type BusinessDetails = {
  companyName: string;
  country: string;
  businessType: BusinessType;
  annualVolume: AnnualVolume;
  website: string;
  categories: CategoryKey[];
  contactChannel: ContactChannel;
  contactHandle: string;
};

/**
 * 가입 마지막 단계 — 사업자 정보.
 *
 * ⚠️⚠️ **한 번에 다 보여주지 않는다.** 8개 입력을 펼쳐 두니 "막막하다"는 피드백이
 *      나왔다. 앞 묶음을 채우면 다음 묶음이 나타나고, 화면에는 늘 물어보는 것이
 *      두 칸 안팎만 남는다. 되돌리지 말 것 — 이 폼의 이탈률이 곧 바이어 수다.
 *
 * ⚠️ 셀렉트의 기본값을 없앤 것이 이 구조의 전제다. 'Retailer' 가 미리 박혀 있으면
 *    (a) 채운 적이 없는데 다음 묶음이 즉시 열려 단계 구분이 무의미해지고
 *    (b) 아무도 안 건드린 값이 그대로 저장돼 브랜드가 보는 데이터가 망가진다.
 */
export function BusinessDetailsStep({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (v: BusinessDetails) => void;
}) {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [annualVolume, setAnnualVolume] = useState<AnnualVolume | ''>('');
  const [website, setWebsite] = useState('');
  const [categories, setCategories] = useState<CategoryKey[]>([]);
  const [contactChannel, setContactChannel] = useState<ContactChannel>('Email');
  const [contactHandle, setContactHandle] = useState('');
  const [agreed, setAgreed] = useState(false);

  const step1Done = companyName.trim().length > 0 && country !== '';
  const step2Done = step1Done && businessType !== '' && annualVolume !== '';
  /** 채워진 묶음 수 — 진행 표시와 다음 묶음 노출 판정을 같은 값으로 한다. */
  const done = (step1Done ? 1 : 0) + (step2Done ? 1 : 0);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!step2Done || !agreed) return;
        onSubmit({
          companyName: companyName.trim(),
          country,
          businessType: businessType as BusinessType,
          annualVolume: annualVolume as AnnualVolume,
          website: normalizeWebsite(website),
          categories,
          contactChannel,
          contactHandle: contactHandle.trim(),
        });
      }}
    >
      <Progress done={done} total={3} />

      <Group title="Your company">
        <Field label="Company name" required>
          <input
            required
            autoFocus
            className="form-input"
            placeholder="Sensa Retail"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </Field>
        <Field label="Country / region" required>
          <select
            required
            className="form-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="" disabled>
              Select a country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.code}>{c.name}</option>
            ))}
          </select>
        </Field>
      </Group>

      {step1Done && (
        <Group title="How you buy" reveal>
          <Field label="Business type" required>
            <select
              required
              className="form-select"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
            >
              <option value="" disabled>
                Select one
              </option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Annual purchase volume" required>
            <select
              required
              className="form-select"
              value={annualVolume}
              onChange={(e) => setAnnualVolume(e.target.value as AnnualVolume)}
            >
              <option value="" disabled>
                Select a range
              </option>
              {VOLUMES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        </Group>
      )}

      {step2Done && (
        <Group title="Optional details" hint="Brands read these before deciding." reveal>
          <Field label="Company website">
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              className="form-input"
              placeholder="sensa-retail.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>

          <div>
            <span className="mb-1 block text-[13px] font-semibold text-ink">
              Categories of interest
            </span>
            {/* 홈 필터와 같은 컴포넌트를 다중 선택 모드로 재사용한다. */}
            <CategoryFilter
              selected={categories}
              includeAll={false}
              wrap
              onSelect={(key) =>
                key &&
                setCategories((prev) =>
                  prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
                )
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
            <Field label="Preferred contact">
              <select
                className="form-select"
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value as ContactChannel)}
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
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
              />
            </Field>
          </div>
        </Group>
      )}

      {/*
        ⚠️ 액션 행은 모달 하단에 **고정**한다. 묶음이 열릴수록 폼이 길어져 모달이
           max-height 에 닿는데, 그러면 CTA 가 스크롤 밖으로 밀려 "다 채웠는데 다음이
           없다"가 된다(실제로 그렇게 보였다). 약관도 같이 고정해야 한다 — 버튼만
           고정하면 비활성 이유(미동의)가 화면 밖에 있어 막다른 길이 된다.
        ⚠️ `-mx-N -mb-N + px-N pb-N` 은 Modal 의 안쪽 패딩을 상쇄해 바닥까지 붙이는 것이다.
           `-bottom-N` 도 같은 값인데 이건 별개 이유다 — sticky 는 스크롤 컨테이너의
           **content box** 바닥에 붙으므로 bottom-0 이면 패딩만큼 떠서, 그 틈으로 뒤
           내용이 비치고 흰 띠가 남는다(실측: 푸터 하단 905px vs 스크롤 하단 933px).
          ⚠️ 상쇄 값이 브레이크포인트마다 다르다 — Modal 의 안쪽 패딩이 모바일 20px /
             데스크탑 28px 라, `-mx/-mb/px/pb/-bottom` **다섯 개를 한 벌로** 함께 바꾼다.
             바텀시트는 화면 바닥에 붙으므로 홈 인디케이터만큼 아래 여백을 더한다.
      */}
      <div className="sticky -bottom-5 -mx-5 -mb-5 space-y-3 border-t border-line bg-surface px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 sm:-bottom-7 sm:-mx-7 sm:-mb-7 sm:px-7 sm:pb-7">
        {step2Done && (
          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-sub">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              // ⚠️ 하드코딩 hex(#7C3AED)가 아니라 토큰이고, 색도 잉크다(선택 상태).
              className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
            />
            <span>
              I agree to the{' '}
              <a href="#" className="text-ink underline underline-offset-2">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-ink underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </span>
          </label>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          {/* ⚠️ 제출 버튼에 fullWidth(w-full)를 쓰지 않는다 — flex 행 안에서 100% 를
              요구해 Back 과 함께 모달 밖으로 넘친다(실제로 그렇게 깨져 있었다).
              flex 행에서는 flex-1 로 남는 공간을 받는다.
              ⚠️ 마지막 묶음이 열렸을 때만 그리지 말 것. 그러면 첫 화면의 고정 바닥에
                 `Back` 하나만 남아, 다 채우면 무엇이 되는지 모른 채 시작하게 된다
                 (막다른 길처럼 보였다). 늘 그리되 비활성으로 둔다. */}
          <Button type="submit" className="flex-1" disabled={!step2Done || !agreed}>
            Create account
          </Button>
        </div>
      </div>
    </form>
  );
}

/** 얼마나 남았는지 보여 준다 — 단계별 노출은 "지금 할 일"은 줄여도 "끝이 언제냐"는 못 답한다. */
function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              // ⚠️ 채움은 보라가 아니라 잉크다 — 이 프로젝트에서 진행·선택·현재는
              //    전부 잉크가 맡고, 보라는 주 CTA 와 포커스링에만 남긴다.
              i <= done ? 'bg-ink' : 'bg-line',
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-mute">
        {Math.min(done + 1, total)} / {total}
      </span>
    </div>
  );
}

function Group({
  title,
  hint,
  reveal,
  children,
}: {
  title: string;
  hint?: string;
  /** 방금 나타난 묶음인가 — 애니메이션 + 스크롤 대상. */
  reveal?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  // 모달이 자체 스크롤 컨테이너라, 새 묶음이 접힌 화면 아래에 생기면 아무 일도
  // 일어나지 않은 것처럼 보인다. `block: 'nearest'` 라 필요한 만큼만 움직인다.
  useEffect(() => {
    if (reveal) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [reveal]);

  return (
    <section ref={ref} className={cn('space-y-4', reveal && 'animate-slide-up')}>
      <h3 className="flex items-baseline gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">
        {title}
        {hint && <span className="text-[11.5px] font-medium normal-case tracking-normal">{hint}</span>}
      </h3>
      {children}
    </section>
  );
}
