'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { normalizeWebsite, timeAgo } from '@/lib/format';
import { useAppActions, useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * 카탈로그에 없는 브랜드를 찾아 달라는 요청. 헤더 `Request a brand` 와, 홈 검색에서
 * 결과가 없을 때의 `Request` 버튼이 여기로 온다(검색어는 ?q= 로 들고 온다).
 *
 * ⚠️ 폼은 로그인 없이도 채울 수 있다 — 보낼 때만 로그인을 묻는다. 인증은 모달이라
 *    입력한 내용이 그대로 남는다. 들어오자마자 막으면 검색에서 넘어온 의도가 끊긴다.
 */
export default function RequestBrandPage() {
  return (
    <Suspense fallback={<Shell />}>
      <RequestBrand />
    </Suspense>
  );
}

function RequestBrand() {
  const params = useSearchParams();
  const { buyer, wishes, hydrated } = useAppState();
  const { addWish, openAuth } = useAppActions();
  const toast = useToast();

  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!buyer) {
      openAuth();
      return;
    }
    // @PORT(api): POST /v1/buyer/sourcing-requests
    addWish({
      id: `wish_${Date.now().toString(36)}`,
      query: query.trim(),
      link: normalizeWebsite(link) || undefined,
      note: note.trim() || undefined,
      status: 'searching',
      createdAt: new Date().toISOString(),
    });
    setQuery('');
    setLink('');
    setNote('');
    toast.success('Request sent — we’ll get back to you within 5 business days');
  };

  return (
    <Shell>
      <form onSubmit={submit} className="mt-8 space-y-5 sm:mt-10">
        <Field label="Brand or product" required>
          <input
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Round Lab, birch juice sunscreen"
            autoFocus={!query}
            required
          />
        </Field>
        <Field label="Reference link" hint="Product page, Instagram, Olive Young — anything helps.">
          <input
            className="form-input"
            inputMode="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="What you need">
          <textarea
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Which SKUs, rough order volume, target market…"
          />
        </Field>
        <div className="pt-2">
          <Button type="submit" disabled={!query.trim()} className="max-sm:w-full">
            {hydrated && !buyer ? 'Sign in to send request' : 'Send request'}
          </Button>
        </div>
      </form>

      {hydrated && buyer && wishes.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-[18px] font-semibold text-ink">Your brand requests</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {wishes.map((w) => (
              <li key={w.id} className="flex items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ink">{w.query}</p>
                  {w.note && <p className="mt-0.5 truncate text-[13px] text-sub">{w.note}</p>}
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px]">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        w.status === 'found' ? 'bg-ok' : 'bg-mute',
                      )}
                    />
                    <span className="font-medium text-sub">
                      {w.status === 'found' ? 'Found' : 'Searching in Korea'}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-[11.5px] text-mute">{timeAgo(w.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 pb-10 pt-8 md:px-10 md:pt-14">
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.01em] sm:text-[36px]">
        Can&rsquo;t find a brand?
      </h1>
      <p className="mt-3 max-w-[480px] text-[15px] font-light leading-relaxed text-sub">
        Tell us what you&rsquo;re looking for. Our team in Seoul contacts the brand directly and
        brings it to KLOW — samples at wholesale, same as everything else here.
      </p>
      {children}
    </div>
  );
}
