'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import { COUNTRIES } from '@/lib/countries';
import type { CategoryKey } from '@/lib/categories';
import { useAppActions, useAppState } from '@/lib/store';
import type { AnnualVolume, BusinessType, ContactChannel } from '@/lib/types';

const BUSINESS_TYPES: BusinessType[] = [
  'Retailer', 'E-commerce', 'Distributor', 'Importer',
  'Wholesaler', 'Salon & Spa', 'Sourcing agency', 'Other',
];

const VOLUMES: AnnualVolume[] = [
  'Under $10K', '$10K – $50K', '$50K – $200K', '$200K – $1M', '$1M+',
];

const CHANNELS: ContactChannel[] = ['Email', 'WhatsApp', 'KakaoTalk'];

/**
 * 로그인·가입을 한 모달에서 처리한다. 별도 라우트로 빼면 브랜드 상세에서
 * 골라 둔 제품 선택이 이탈과 함께 사라진다.
 *
 * ⚠️ 전화 OTP 를 만들지 않는다 — klow_brand 의 OTP 는 한국 브랜드가 010 번호로
 *    가입하기 때문이고, 해외 바이어는 KR SMS 를 받지 못한다. Email + Google 만 둔다.
 * @PORT(auth): 검증은 전부 형식 수준이다. 실서버에서는 /v1/buyer/auth/* 로 교체.
 */
export function AuthModalMount() {
  const { authOpen } = useAppState();
  const { closeAuth, signIn, openAuth } = useAppActions();
  const toast = useToast();

  const [step, setStep] = useState<'account' | 'business'>('account');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState<string>('United States');
  const [businessType, setBusinessType] = useState<BusinessType>('Retailer');
  const [annualVolume, setAnnualVolume] = useState<AnnualVolume>('$10K – $50K');
  const [website, setWebsite] = useState('');
  const [categories, setCategories] = useState<CategoryKey[]>([]);
  const [contactChannel, setContactChannel] = useState<ContactChannel>('Email');
  const [contactHandle, setContactHandle] = useState('');
  const [agreed, setAgreed] = useState(false);

  const mode = authOpen;

  // 모달이 닫힐 때가 아니라 열릴 때 초기화한다 — 닫히면 언마운트되지 않고 null 만 반환하므로
  // 닫기 시점에 리셋하면 사라지는 화면이 잠깐 빈 폼으로 깜빡인다.
  useEffect(() => {
    if (!mode) return;
    setStep('account');
    setAgreed(false);
  }, [mode]);

  if (!mode) return null;

  const finish = (name: string, mail: string) => finishWith({ name, mail });

  const finishWith = ({ name, mail, company }: { name: string; mail: string; company?: string }) => {
    signIn({
      id: `buyer_${Date.now()}`,
      fullName: name.trim() || 'Buyer',
      email: mail.trim(),
      companyName: (company ?? companyName).trim() || 'Independent buyer',
      country,
      businessType,
      annualVolume,
      website: website.trim() || undefined,
      categories,
      contactChannel,
      contactHandle: contactHandle.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success(`Welcome, ${name.trim() || 'Buyer'}`);
  };

  /**
   * @PORT(auth): 실제 Google OAuth 왕복으로 교체. 데모에서는 1클릭으로 통과시킨다.
   * ⚠️ 2단계를 건너뛰므로 회사 정보가 비어 있다 — 채우지 않으면 브랜드 인사말이
   *    "Independent buyer" 로 나가 데모가 어색해진다(실제로 그렇게 보였다).
   */
  const googleDemo = () => {
    setCompanyName('Sensa Retail');
    finishWith({ name: 'Alex Moreau', mail: 'alex@sensa-retail.com', company: 'Sensa Retail' });
  };

  return (
    <Modal
      open
      onClose={closeAuth}
      labelledBy="auth-modal-title"
      size={mode === 'signup' && step === 'business' ? 'lg' : 'sm'}
    >
      <h2
        id="auth-modal-title"
        className="mb-1 font-display text-[20px] font-bold tracking-[-0.02em] text-ink"
      >
        {mode === 'signin'
          ? 'Sign in'
          : step === 'account'
            ? 'Create your buyer account'
            : 'Tell brands about your business'}
      </h2>
      <p className="mb-6 text-[13px] text-sub">
        {mode === 'signin'
          ? 'Continue to request samples and message brands.'
          : step === 'account'
            ? 'Brands reply faster to verified buyer accounts.'
            : 'Brands use this to decide which samples to send.'}
      </p>

      {mode === 'signin' && (
        <>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              finish(email.split('@')[0] || 'Buyer', email);
            }}
          >
            <Field label="Work email" required>
              <input
                type="email"
                required
                autoFocus
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" fullWidth className="mt-1">
              Sign in
            </Button>
          </form>
          <Divider />
          <SocialRow onGoogle={googleDemo} />
          <p className="mt-5 text-center text-[13px] text-sub">
            New to KLOW?{' '}
            <button
              type="button"
              onClick={() => {
                setStep('account');
                openAuth('signup');
              }}
              className="font-semibold text-accent-strong underline underline-offset-2"
            >
              Create a buyer account
            </button>
          </p>
        </>
      )}

      {mode === 'signup' && step === 'account' && (
        <>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setStep('business');
            }}
          >
            <Field label="Full name" required>
              <input
                required
                autoFocus
                className="form-input"
                placeholder="Alex Moreau"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <Field label="Work email" required>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" fullWidth className="mt-1">
              Continue
            </Button>
          </form>
          <Divider />
          <SocialRow onGoogle={googleDemo} />
        </>
      )}

      {mode === 'signup' && step === 'business' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            finish(fullName, email);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                className="form-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Business type" required>
              <select
                className="form-select"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Annual purchase volume" required>
              <select
                className="form-select"
                value={annualVolume}
                onChange={(e) => setAnnualVolume(e.target.value as AnnualVolume)}
              >
                {VOLUMES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Company website" hint="Optional — helps brands verify you faster.">
            <input
              type="url"
              className="form-input"
              placeholder="https://"
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
              onSelect={(key) =>
                key &&
                setCategories((prev) =>
                  prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
                )
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
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
            <Field label="Handle or number" hint="Optional">
              <input
                className="form-input"
                placeholder="+1 555 0100"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-sub">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#7C3AED]"
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep('account')}>
              Back
            </Button>
            <Button type="submit" fullWidth disabled={!agreed}>
              Create account
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** klow_brand 관례대로 소셜은 텍스트 버튼이 아니라 아이콘 원형 버튼이다. */
function SocialRow({ onGoogle }: { onGoogle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onGoogle}
        aria-label="Continue with Google"
        title="Continue with Google"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface transition hover:border-ink/40"
      >
        <GoogleIcon />
      </button>
      <button
        type="button"
        onClick={onGoogle}
        aria-label="Continue with email link"
        title="Continue with email link"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface transition hover:border-ink/40"
      >
        <Mail className="h-[18px] w-[18px] text-ink" strokeWidth={2.25} />
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.2-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 6.9l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.4z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.6 2.2-8.7 2.2-6.3 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
