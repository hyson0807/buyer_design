'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { getBrandById } from '@/lib/mock-brands';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAppActions, useAppState } from '@/lib/store';

const STATUS_STYLE = {
  submitted: 'bg-field text-sub',
  accepted: 'bg-accent-pale text-accent-strong',
  shipped: 'bg-ok/10 text-ok',
} as const;

export default function RequestsPage() {
  const { buyer, requests, threads, hydrated } = useAppState();
  const { openAuth } = useAppActions();

  // ⚠️ 라우트 가드(middleware)를 만들지 않는다 — 지킬 데이터가 없고, matcher 는
  //    "라우트를 추가하면 matcher 도 갱신"이라는 유지 부채를 동반한다. 인라인 프롬프트로 충분.
  if (!hydrated) return <Shell />;

  if (!buyer) {
    return (
      <Shell>
        <Empty
          title="Sign in to see your requests"
          body="Your sample requests and brand conversations live here."
          action={<Button onClick={() => openAuth()}>Sign in</Button>}
        />
      </Shell>
    );
  }

  if (requests.length === 0) {
    return (
      <Shell>
        <Empty
          title="No requests yet"
          body="Pick a brand, choose a few products, and ask for samples."
          action={
            <Link href="/">
              <Button>Browse brands</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {requests.map((r) => {
          const brand = getBrandById(r.brandId);
          const thread = threads.find((t) => t.requestId === r.id);
          const last = thread?.messages[thread.messages.length - 1];
          const unread =
            !!thread &&
            !!last &&
            last.from === 'brand' &&
            new Date(last.createdAt) > new Date(thread.lastReadAt);

          return (
            <li key={r.id}>
              <Link href={`/requests/${r.id}`} className="flex items-center gap-4 py-5 transition-colors hover:bg-ink/[0.02]">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-field">
                  <SafeImage
                    src={brand?.logosCircle[0]}
                    alt={brand?.name ?? ''}
                    name={brand?.name ?? '?'}
                    accent={brand?.accentColor}
                    sizes="48px"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-[16px] font-semibold text-ink">
                      {brand?.name}
                    </p>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-sub">
                    {last ? last.text.split('\n')[0] : `${r.items.length} items requested`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11.5px] font-semibold capitalize',
                      STATUS_STYLE[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                  <span className="text-[11.5px] text-mute">
                    {timeAgo(last?.createdAt ?? r.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[900px] px-6 pt-14 md:px-10">
      <h1 className="font-display text-[32px] font-semibold tracking-[-0.03em]">My requests</h1>
      {children}
    </div>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mt-10 rounded-xl2 border border-dashed border-line px-6 py-20 text-center">
      <p className="font-display text-[18px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[360px] text-[14px] text-sub">{body}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}
