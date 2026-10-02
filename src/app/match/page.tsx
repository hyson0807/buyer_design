'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { BrandCard } from '@/components/brand/BrandCard';
import { QUESTIONS, optionLabel, type MatchAnswers, type Question } from '@/lib/concierge';
import { matchBrands } from '@/lib/matching';
import { getBrands } from '@/lib/mock-brands';
import { FREE_SHIPPING_SKUS } from '@/lib/sampling';
import { useAppActions } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * 매칭 — 화면 **가운데 한 줄 대화**로 다섯 가지를 묻고, 끝나면 맞는 브랜드가 아래로
 * 차례차례 펼쳐진다.
 *
 * 숨고처럼 질문이 한 번에 하나씩 도착하고 내 답이 오른쪽에 쌓인다. 선택지는 마지막
 * 질문 바로 아래에 카드로 놓인다(바닥 고정 입력창이 아니다 — 시선이 한 세로줄을 벗어나지 않게).
 *
 * ⚠️ 서랍·모달이 아니라 **페이지**다. 결과가 대화 아래에 그리드로 이어져야 해서,
 *    좁은 패널 안에 가두면 "브랜드가 촤라락 나오는" 순간을 보여 줄 폭이 없다.
 * ⚠️ 단일 선택은 누르면 바로 다음으로 간다. 다중 선택만 Continue 를 둔다.
 */

type Draft = Partial<Record<Question['id'], string[]>>;

const TYPING_MS = 650;

export default function MatchPage() {
  const { setMatch } = useAppActions();
  const [draft, setDraft] = useState<Draft>({});
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[step] as Question | undefined;

  useEffect(() => {
    setTyping(true);
    const t = window.setTimeout(() => setTyping(false), TYPING_MS);
    return () => window.clearTimeout(t);
  }, [step]);

  // 새 질문이 도착하면 대화 끝으로, 결과가 나오면 결과 머리로 스크롤한다.
  useEffect(() => {
    if (typing) return;
    const target = done ? resultsRef.current : endRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: done ? 'start' : 'end' });
  }, [typing, done]);

  const answers = useMemo<MatchAnswers | null>(() => {
    if (!done) return null;
    return {
      kind: draft.kind![0],
      region: draft.region![0],
      goal: draft.goal![0],
      needs: draft.needs ?? [],
      priorities: draft.priorities ?? [],
    } as MatchAnswers;
  }, [done, draft]);

  const results = useMemo(() => (answers ? matchBrands(answers, getBrands()) : []), [answers]);

  // 마지막 답을 내는 순간 저장 — 홈의 "Selected for your business" 가 이걸 다시 그린다.
  useEffect(() => {
    if (answers) setMatch({ ...answers, answeredAt: new Date().toISOString() });
  }, [answers, setMatch]);

  const answer = useCallback(
    (keys: string[]) => {
      if (!q) return;
      setDraft((d) => ({ ...d, [q.id]: keys }));
      setStep((s) => s + 1);
    },
    [q],
  );

  const back = () => {
    if (step === 0) return;
    const prevId = QUESTIONS[step - 1].id;
    setDraft((d) => {
      const next = { ...d };
      delete next[prevId];
      return next;
    });
    setStep((s) => s - 1);
  };

  const restart = () => {
    setDraft({});
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-10">
      {/* ── 대화 ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[680px] px-6 pt-10 md:pt-16">
        <div className="text-center">
          <h1 className="font-display text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink md:text-[40px]">
            Brands that fit how you sell
          </h1>
          <p className="mt-3 text-[15px] font-light text-sub">
            Five questions, then a shortlist you can sample today.
          </p>
        </div>

        {/* 진행 — 숫자 + 1px 선. 굵은 진행바는 설문 도구처럼 보인다. */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={back}
            aria-label="Previous question"
            disabled={step === 0 || done}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-ink transition-opacity disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <div className="relative h-px flex-1 bg-line">
            <span
              className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-500"
              style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-[13px] font-light tabular-nums text-mute">
            {Math.min(step + 1, QUESTIONS.length)} / {QUESTIONS.length}
          </span>
        </div>

        <div className="mt-10 space-y-5">
          <Klow>
            Hi, I&apos;m your KLOW sourcing assistant. Five quick questions about your business, and
            I&apos;ll show you the Korean brands that fit — every one samples at wholesale price,
            from a single unit.
          </Klow>

          {QUESTIONS.slice(0, step).map((qq) => (
            <div key={qq.id} className="space-y-5">
              <Klow>
                <Prompt q={qq} />
              </Klow>
              <You>{(draft[qq.id] ?? []).map((k) => optionLabel(qq.id, k)).join(', ')}</You>
            </div>
          ))}

          {typing ? (
            <Klow>
              <Dots />
            </Klow>
          ) : done ? (
            <Klow>
              {results.length > 0 ? (
                <>
                  I found <strong className="font-semibold">{results.length} brands</strong> for a{' '}
                  {optionLabel('kind', answers!.kind).toLowerCase()} selling in{' '}
                  {optionLabel('region', answers!.region)}. Here they are.
                </>
              ) : (
                <>Nothing fits all of that yet. Try fewer needs, or start over.</>
              )}
            </Klow>
          ) : (
            q && (
              <>
                <Klow>
                  <Prompt q={q} />
                </Klow>
                <Choices key={q.id} q={q} onAnswer={answer} />
              </>
            )
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* ── 결과: 브랜드가 차례로 떠오른다 ─────────────────── */}
      {done && !typing && results.length > 0 && (
        <section
          ref={resultsRef}
          className="mx-auto mt-20 max-w-[1400px] scroll-mt-20 px-6 md:mt-28 md:px-10 lg:px-15"
        >
          <div className="mb-10 text-center md:mb-14">
            <h2 className="font-display text-[28px] font-semibold tracking-[-0.01em] text-ink md:text-[36px]">
              Your matches
            </h2>
            <p className="mt-4 text-[15px] font-light text-sub md:text-[16px]">
              Sample any product at wholesale price. Pick {FREE_SHIPPING_SKUS} SKUs from a brand and
              shipping is free.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {results.map(({ brand, reasons }, i) => (
              <div key={brand.id} className="animate-rise" style={{ animationDelay: `${i * 110}ms` }}>
                <BrandCard brand={brand} priority={i < 3} reason={reasons.slice(0, 2).join(' · ')} />
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-[52px] items-center justify-center border border-ink/20 px-10 text-[14px] tracking-[0.04em] text-ink transition-colors hover:border-ink"
            >
              Start over
            </button>
            <Link
              href="/#brands"
              className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-[14px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-ink/85"
            >
              Browse all brands
            </Link>
          </div>
        </section>
      )}

      {done && !typing && results.length === 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={restart}
            className="inline-flex h-[52px] items-center justify-center bg-ink px-10 text-[14px] font-semibold tracking-[0.04em] text-white"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 대화 조각 ─────────────────────────────────────────── */

function Klow({ children }: { children: ReactNode }) {
  return (
    <div className="flex animate-slide-up items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-display text-[13px] font-semibold text-white">
        K
      </span>
      <div className="max-w-[85%] bg-surface px-5 py-4 text-[15px] leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

function You({ children }: { children: ReactNode }) {
  return (
    <div className="flex animate-slide-up justify-end">
      <p className="max-w-[80%] bg-ink px-5 py-3.5 text-[15px] leading-snug text-white">{children}</p>
    </div>
  );
}

function Prompt({ q }: { q: Question }) {
  return (
    <>
      <span className="block font-display text-[17px] font-semibold text-ink">{q.prompt}</span>
      {q.note && <span className="mt-1 block text-[14px] font-light text-sub">{q.note}</span>}
    </>
  );
}

function Dots() {
  return (
    <span className="flex h-6 items-center gap-1.5" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function Choices({ q, onAnswer }: { q: Question; onAnswer: (keys: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const multi = q.max > 1;
  const options = q.options as { key: string; label: string; hint?: string }[];
  const withHints = options.some((o) => o.hint);

  const pick = (key: string) => {
    if (!multi) {
      // 넘어가기 전 한 박자 사이에 다른 카드를 또 누르면 답이 두 번 들어간다.
      if (picked.length) return;
      setPicked([key]);
      window.setTimeout(() => onAnswer([key]), 200);
      return;
    }
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : p.length < q.max ? [...p, key] : p));
  };

  return (
    // 아바타(32px) + 간격(12px) 만큼 들여 KLOW 의 말 아래에 정렬한다.
    <div className="animate-slide-up pl-11">
      <div className={cn(withHints ? 'space-y-2' : 'grid grid-cols-2 gap-2')}>
        {options.map((o) => {
          const on = picked.includes(o.key);
          const full = multi && !on && picked.length >= q.max;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              aria-pressed={on}
              disabled={full}
              className={cn(
                'flex w-full items-center gap-3 border px-5 text-left transition-colors',
                withHints ? 'py-4' : 'min-h-[52px] py-3',
                on ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink hover:border-ink',
                full && 'cursor-not-allowed opacity-40 hover:border-line',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium leading-snug">{o.label}</span>
                {o.hint && (
                  <span className={cn('mt-0.5 block text-[13px] font-light', on ? 'text-white/70' : 'text-sub')}>
                    {o.hint}
                  </span>
                )}
              </span>
              {multi && on && <Check className="h-4 w-4 shrink-0" strokeWidth={2} />}
            </button>
          );
        })}
      </div>

      {multi && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-[13px] font-light tabular-nums text-mute">
            {picked.length} of {q.max} selected
          </span>
          <button
            type="button"
            onClick={() => onAnswer(picked)}
            disabled={picked.length === 0}
            className="inline-flex h-12 items-center justify-center bg-ink px-8 text-[14px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-ink/85 disabled:bg-field disabled:text-mute"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
