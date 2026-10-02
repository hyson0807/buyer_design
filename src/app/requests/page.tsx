'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { getBrandById } from '@/lib/mock-brands';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAppActions, useAppState } from '@/lib/store';

/**
 * ⚠️ 상태를 **색 알약**으로 두지 않는다. 세 상태가 회색·보라·초록 알약으로 갈리면
 *    목록 오른쪽 끝에 서로 다른 색 덩어리가 줄지어 서서, 정작 읽어야 할 브랜드 이름과
 *    마지막 메시지보다 먼저 보인다. 색은 4px 점 하나로 줄이고 라벨은 본문색으로 둔다 —
 *    상태를 훑는 데 필요한 색 차이는 남고 면적만 사라진다.
 */
const STATUS_DOT = {
  submitted: 'bg-mute',
  accepted: 'bg-accent',
  shipped: 'bg-ok',
} as const;

const STATUS_LABEL = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  shipped: 'Shipped',
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
      <ul className="mt-6 divide-y divide-line border-y border-line sm:mt-8">
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
              <Link
                href={`/requests/${r.id}`}
                className="flex items-center gap-3 py-4 transition-colors hover:bg-ink/[0.02] sm:gap-4 sm:py-5"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-field sm:h-12 sm:w-12">
                  <SafeImage
                    src={brand?.logosCircle[0]}
                    alt={brand?.name ?? ''}
                    name={brand?.name ?? '?'}
                    accent={brand?.accentColor}
                    sizes="48px"
                  />
                </span>
                {/*
                  ⚠️ 상태를 오른쪽 끝에 세우지 않는다. 라벨 길이가 제각각(Submitted /
                     Accepted / Shipped)이라 우측 정렬하면 앞의 점이 행마다 다른 x 에 찍혀
                     세로로 어긋난다 — 목록에서 가장 먼저 눈에 걸리는 흐트러짐이다.
                     상태·품목 수는 왼쪽 기둥에 붙여 점을 한 줄로 세우고, 오른쪽에는
                     길이가 짧고 성격이 다른 시각 하나만 남긴다.
                */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-[16px] font-semibold text-ink">
                      {brand?.name}
                    </p>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-sub">
                    {last ? last.text.split('\n')[0] : 'Waiting for the brand to reply'}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-mute">
                    <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[r.status])} />
                    <span className="font-medium text-sub">{STATUS_LABEL[r.status]}</span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">
                      {r.items.length} {r.items.length === 1 ? 'product' : 'products'}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 self-start pt-0.5 text-[11.5px] text-mute">
                  {timeAgo(last?.createdAt ?? r.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/*
        목록 다음의 마무리 줄. 장식이 아니라 실제 다음 행동이다 — 요청 목록까지 온
        사람이 여기서 하고 싶은 일은 대개 "또 하나 요청하기"인데, 그 길이 헤더의
        워드마크뿐이면 페이지가 목적지 없이 끝난다.
        ⚠️ 덤으로 짧은 목록이 큰 화면에서 남기던 빈 사각형도 이 줄이 닫는다.
      */}
      <p className="mt-8 text-[13px] text-sub">
        Want samples from another brand?{' '}
        <Link href="/" className="font-medium text-ink underline underline-offset-2">
          Browse brands
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    /* ⚠️ 900px 로 두면 메시지 끝과 오른쪽 시각 사이에 300px 넘는 빈 구간이 생겨
          행이 양끝으로 벌어져 보인다. 아바타 + 세 줄이 편히 들어가는 폭은 720px 이다. */
    <div className="mx-auto max-w-[720px] px-6 pt-8 md:px-10 md:pt-14">
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.01em] sm:text-[36px]">
        My requests
      </h1>
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
    /* ⚠️ 점선 테두리 상자를 두지 않는다 — 빈 상태는 "아직 아무것도 없다"이지 "여기에
          무언가를 떨어뜨려라"가 아닌데, 점선은 후자(드롭존)의 관용 표현이다. */
    <div className="mt-10 border-t border-line pt-14 sm:pt-16">
      <p className="font-display text-[18px] font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-sub">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
