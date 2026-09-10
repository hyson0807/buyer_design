'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChatThread } from '@/components/chat/ChatThread';
import { RequestSummary } from '@/components/request/RequestSummary';
import { getBrandById } from '@/lib/mock-brands';
import { useAppState } from '@/lib/store';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { requests, hydrated } = useAppState();
  const request = requests.find((r) => r.id === params.id);
  const brand = request ? getBrandById(request.brandId) : undefined;

  return (
    /* ⚠️ 아래 여백을 작게 둔다 — 두 칸이 화면 높이를 채우는 레이아웃이라, 여기에
          큰 pb 를 두면 푸터 위로 200px 짜리 빈 띠가 남는다(푸터도 mt 를 갖는다). */
    <div className="mx-auto max-w-[1200px] px-6 pb-6 pt-6 md:px-10 md:pb-8 md:pt-10">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sub transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        All requests
      </Link>

      {/* hydrate 전에는 "없음"을 단정할 수 없다 — localStorage 를 아직 안 읽었다. */}
      {!hydrated ? (
        <div className="mt-8 h-[420px] animate-pulse rounded-xl2 bg-field md:mt-10 md:h-[560px]" />
      ) : !request || !brand ? (
        <p className="mt-16 text-center text-[14px] text-sub">
          This request no longer exists.{' '}
          <Link href="/" className="text-accent-strong underline underline-offset-2">
            Browse brands
          </Link>
        </p>
      ) : (
        /*
          ⚠️⚠️ **좁은 화면에서는 채팅이 먼저다.** 요약 패널이 449px 짜리라(실측)
                위에 두면 메시지 입력칸이 y=821px — 780px 짜리 화면의 **접힌 곳 아래**로
                밀린다. 브랜드와 대화하러 들어온 화면에서 첫 화면에 입력칸이 없는 것은
                이 페이지가 하려던 일을 못 하는 것이다. 요약은 참고 자료라 아래로 내린다.
                (lg 이상에서는 원래대로 좌측 패널 · 우측 채팅.)
        */
        <div className="mt-6 grid grid-cols-1 items-stretch gap-4 lg:mt-8 lg:grid-cols-[360px_1fr] lg:gap-6">
          {/*
            ⚠️ lg 에서 두 칸에 **같은 고정 높이**를 준다. 요약 패널을 내용 높이대로 두면
               품목이 1개인 요청에서는 250px, 5개인 요청에서는 700px 이 되어 두 카드
               바닥이 매번 다른 곳에서 끝난다. 높이를 맞추고 넘치는 쪽만 안에서 굴린다.
            ⚠️ 스크롤은 **패널 바깥 래퍼**가 갖는다 — 카드 자체에 걸면 안쪽 패딩까지
               같이 굴러 머리글이 테두리에 붙는다.
          */}
          <div className="order-2 lg:order-none lg:h-[calc(100dvh-16rem)] lg:min-h-[520px] lg:overflow-y-auto lg:rounded-xl2">
            <RequestSummary request={request} />
          </div>
          <div className="order-1 lg:order-none">
            <ChatThread request={request} brand={brand} />
          </div>
        </div>
      )}
    </div>
  );
}
