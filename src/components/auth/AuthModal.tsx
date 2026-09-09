'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CategoryFilter } from '@/components/brand/CategoryFilter';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { DEMO_ACCOUNT_EMAIL, findRegisteredBuyer } from '@/lib/mock-buyers';
import type { CategoryKey } from '@/lib/categories';
import { useAppActions, useAppState } from '@/lib/store';
import type { AnnualVolume, Buyer, BusinessType, ContactChannel } from '@/lib/types';

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
 * ⚠️⚠️ **이메일을 먼저 받고 갈래는 시스템이 정한다.** 예전에는 "Request samples" 가
 *      곧장 가입 폼을 열었는데, 그건 누르는 사람이 신규라고 단정한 것이다 —
 *      기존 바이어는 로그인으로 갈 길이 없어 모달을 닫아야 했고, 닫으면
 *      pendingIntent 가 비워져 **골라 둔 제품까지 날아갔다.** 어느 화면을 열지
 *      호출부가 정하게 두지 말 것(그래서 store 의 authOpen 이 boolean 이다).
 *
 * ⚠️ 전화 OTP 를 만들지 않는다 — klow_brand 의 OTP 는 한국 브랜드가 010 번호로
 *    가입하기 때문이고, 해외 바이어는 KR SMS 를 받지 못한다. Email + Google 만 둔다.
 * @PORT(auth): 검증은 전부 형식 수준이다. 실서버에서는 /v1/buyer/auth/* 로 교체.
 */
type Step = 'email' | 'password' | 'signup' | 'business';

export function AuthModalMount() {
  const { authOpen, pendingIntent } = useAppState();
  const { closeAuth, signIn } = useAppActions();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  /** 이메일 조회로 찾은 기존 계정. 로그인 갈래에서 이름·회사를 보여 주는 데 쓴다. */
  const [known, setKnown] = useState<Buyer | null>(null);

  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY.name);
  const [businessType, setBusinessType] = useState<BusinessType>('Retailer');
  const [annualVolume, setAnnualVolume] = useState<AnnualVolume>('$10K – $50K');
  const [website, setWebsite] = useState('');
  const [categories, setCategories] = useState<CategoryKey[]>([]);
  const [contactChannel, setContactChannel] = useState<ContactChannel>('Email');
  const [contactHandle, setContactHandle] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 모달이 닫힐 때가 아니라 열릴 때 초기화한다 — 닫히면 언마운트되지 않고 null 만
  // 반환하므로, 닫기 시점에 리셋하면 사라지는 화면이 잠깐 빈 폼으로 깜빡인다.
  useEffect(() => {
    if (!authOpen) return;
    setStep('email');
    setKnown(null);
    setPassword('');
    setAgreed(false);
  }, [authOpen]);

  if (!authOpen) return null;

  const finish = (buyer: Buyer) => {
    signIn(buyer);
    toast.success(`Welcome, ${buyer.fullName.split(' ')[0]}`);
  };

  /** @PORT(api): POST /v1/buyer/auth/check-email — 가입 여부로 갈래를 정한다. */
  const submitEmail = () => {
    const found = findRegisteredBuyer(email);
    setKnown(found ?? null);
    if (found) {
      setStep('password');
    } else {
      setFullName('');
      setStep('signup');
    }
  };

  /** @PORT(auth): 실제 Google OAuth 왕복으로 교체. 데모에서는 1클릭으로 통과시킨다. */
  const googleDemo = () => {
    const demo = findRegisteredBuyer(DEMO_ACCOUNT_EMAIL);
    if (demo) finish(demo);
  };

  const createAccount = () => {
    finish({
      id: `buyer_${Date.now()}`,
      fullName: fullName.trim() || 'Buyer',
      email: email.trim(),
      companyName: companyName.trim(),
      country,
      businessType,
      annualVolume,
      website: website.trim() || undefined,
      categories,
      contactChannel,
      contactHandle: contactHandle.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
  };

  const backToEmail = () => {
    setStep('email');
    setKnown(null);
    setPassword('');
  };

  const title =
    step === 'email'
      ? 'Sign in or create an account'
      : step === 'password'
        ? 'Welcome back'
        : step === 'signup'
          ? 'Create your buyer account'
          : 'Tell brands about your business';

  const subtitle =
    step === 'email'
      ? pendingIntent
        ? 'Brands reply to verified buyers — one step and your request is on its way.'
        : 'Enter your work email and we’ll take it from there.'
      : step === 'password'
        ? `${known?.companyName ?? ''} · ${email}`
        : step === 'signup'
          ? `No KLOW account for ${email} yet — let’s make one.`
          : 'Brands use this to decide which samples to send.';

  return (
    <Modal open onClose={closeAuth} labelledBy="auth-modal-title" size={step === 'business' ? 'lg' : 'sm'}>
      <h2
        id="auth-modal-title"
        className="mb-1 pr-8 font-display text-[20px] font-bold tracking-[-0.02em] text-ink"
      >
        {title}
      </h2>
      <p className="mb-6 break-words text-[13px] text-sub">{subtitle}</p>

      {/* ── 1단계: 이메일. 여기서 기존/신규가 갈린다. ───────────────────────── */}
      {step === 'email' && (
        <>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitEmail();
            }}
          >
            <Field label="Work email" required>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" fullWidth className="mt-1">
              Continue
            </Button>
          </form>
          <Divider />
          <SocialRow onGoogle={googleDemo} />
          {/* @PORT(drop) — 데모 안내. 실서버에는 없다. */}
          <p className="mt-5 text-center text-[12px] text-mute">
            Demo: use{' '}
            <button
              type="button"
              onClick={() => setEmail(DEMO_ACCOUNT_EMAIL)}
              className="font-semibold text-sub underline underline-offset-2"
            >
              {DEMO_ACCOUNT_EMAIL}
            </button>{' '}
            for an existing account, or any other address to sign up.
          </p>
        </>
      )}

      {/* ── 2A단계: 기존 계정 → 비밀번호 ──────────────────────────────────── */}
      {step === 'password' && known && (
        <>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              finish(known);
            }}
          >
            <Field label="Password" required>
              <input
                type="password"
                required
                autoFocus
                autoComplete="current-password"
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
          <div className="mt-4 flex items-center justify-between">
            <BackToEmail onClick={backToEmail} />
            <button
              type="button"
              onClick={() => toast.info('Password reset is out of scope for this prototype')}
              className="text-[12.5px] text-sub underline underline-offset-2 hover:text-ink"
            >
              Forgot password?
            </button>
          </div>
        </>
      )}

      {/* ── 2B단계: 신규 → 계정 만들기 ────────────────────────────────────── */}
      {step === 'signup' && (
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
                autoComplete="name"
                className="form-input"
                placeholder="Alex Moreau"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <Field label="Password" required hint="At least 6 characters.">
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" fullWidth className="mt-1">
              Continue
            </Button>
          </form>
          <div className="mt-4">
            <BackToEmail onClick={backToEmail} />
          </div>
        </>
      )}

      {/* ── 3단계: 사업자 정보 ────────────────────────────────────────────── */}
      {step === 'business' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createAccount();
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
                  <option key={c.code}>{c.name}</option>
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
            <Button type="button" variant="outline" onClick={() => setStep('signup')}>
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

/** 이메일을 잘못 쳤을 때의 탈출구. 모달을 닫으면 pendingIntent 가 비므로 반드시 있어야 한다. */
function BackToEmail({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12.5px] text-sub underline underline-offset-2 hover:text-ink"
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
      Use a different email
    </button>
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
        aria-label="Continue with an email link"
        title="Continue with an email link"
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
