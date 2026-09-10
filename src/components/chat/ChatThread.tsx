'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { autoReply } from '@/lib/auto-reply';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAppActions, useBuyer, useThread } from '@/lib/store';
import type { BuyerBrand, ChatMessage, SampleRequest } from '@/lib/types';

/** @PORT(api): 실서버에서는 메시지 전송이 POST 이고 브랜드 답변은 폴링/소켓으로 들어온다. */
export function ChatThread({
  request,
  brand,
}: {
  request: SampleRequest;
  brand: BuyerBrand;
}) {
  const thread = useThread(request.id);
  const buyer = useBuyer();
  const { addMessage, advanceStatus, markRead } = useAppActions();

  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // ⚠️ 언마운트 시 예약된 자동응답 타이머를 반드시 정리한다 — 아니면 스레드를 떠난 뒤에
  //    dispatch 가 돌아 다른 화면에서 경고가 뜬다.
  useEffect(() => {
    const handles = timers.current;
    return () => handles.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    markRead(request.id);
  }, [request.id, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread?.messages.length, typing]);

  if (!thread || !buyer) return null;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const at = Date.now();

    addMessage({
      id: `m_${at}`,
      requestId: request.id,
      from: 'buyer',
      text,
      createdAt: new Date(at).toISOString(),
    });
    setDraft('');

    // 브랜드가 이미 보낸 메시지 수 = 다음 응답의 턴 번호.
    const brandTurn = thread.messages.filter((m) => m.from === 'brand').length;
    const reply = autoReply(brand, buyer, text, brandTurn);

    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        // ⚠️ 응답은 로컬 state 가 아니라 store 로 보낸다 — 아니면 스레드를 나갔다 오면
        //    브랜드 답변이 통째로 사라진다.
        addMessage({
          id: `m_${at}_r`,
          requestId: request.id,
          from: 'brand',
          text: reply.text,
          createdAt: new Date(at + 1200).toISOString(),
        });
        if (reply.advanceTo) advanceStatus(request.id, reply.advanceTo, reply.trackingNo);
      }, 1200),
    );
  };

  return (
    /*
      ⚠️ 모바일에서는 카드 높이를 **화면에 맞춰 고정**한다. `min-h` 만 주면 카드가
         내용만큼 늘어나 입력칸이 페이지 아래로 내려가고, 메시지 목록과 페이지가
         동시에 스크롤되는 이중 스크롤이 된다. 높이를 못 박아야 입력칸이 늘 카드
         바닥에 붙어 보인다. `dvh` 는 iOS 주소창이 접혔다 펴질 때를 따라간다.
      ⚠️ 12rem 은 위쪽 고정 요소(헤더 64 + 페이지 상단 여백 + "All requests" 줄)의
         합이다. 페이지 상단 여백을 바꾸면 여기도 같이 본다.
    */
    <div className="flex h-[calc(100dvh-12rem)] min-h-[420px] flex-col rounded-xl2 border border-line bg-surface lg:h-[calc(100dvh-16rem)] lg:min-h-[520px]">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {thread.messages.map((m) => (
          <Bubble key={m.id} message={m} brand={brand} />
        ))}
        {typing && (
          <div className="flex items-center gap-2 text-[13px] text-mute">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mute" />
            {brand.name} is typing…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-line p-3 sm:p-4">
        <textarea
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter 전송, Shift+Enter 줄바꿈.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          /* ⚠️ 플레이스홀더를 더 늘리지 말 것 — 입력칸은 한 줄(44px) 높이인데 전역
             규칙상 폰트가 16px 로 고정(iOS 확대 방지)이라, 좁은 화면에서는 두 번째
             줄이 그대로 잘린다. 종전 문구("… , certifications…")가 실제로 잘려 있었다. */
          placeholder="Ask about MOQ, pricing…"
          className="form-textarea min-h-[44px] resize-none py-3"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-accent-strong text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:bg-field disabled:text-mute disabled:active:scale-100"
        >
          <Send className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function Bubble({ message, brand }: { message: ChatMessage; brand: BuyerBrand }) {
  if (message.from === 'system') {
    return (
      <p className="mx-auto w-fit rounded-full bg-field px-3 py-1.5 text-[12px] text-sub">
        {message.text}
      </p>
    );
  }

  const mine = message.from === 'buyer';
  return (
    <div className={cn('flex gap-2.5', mine && 'flex-row-reverse')}>
      {!mine && (
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-field">
          <SafeImage
            src={brand.logosCircle[0]}
            alt={brand.name}
            name={brand.name}
            accent={brand.accentColor}
            sizes="32px"
          />
        </span>
      )}
      {/*
        ⚠️ 시각을 말풍선 **아래 줄**에 두지 않는다. 말풍선마다 한 줄이 더 붙어 대화가
           세로로 성기게 벌어지고, 같은 시각("2d ago")이 연달아 세 번 반복돼 읽을 것이
           없는 글자가 화면을 채운다. 말풍선 옆 바닥에 붙이면 같은 정보가 빈 여백을
           쓰면서 대화 줄 간격은 그대로 유지된다.
      */}
      <div className={cn('flex min-w-0 max-w-[86%] items-end gap-2 sm:max-w-[80%]', mine && 'flex-row-reverse')}>
        <div
          className={cn(
            'min-w-0 whitespace-pre-line break-words rounded-xl2 px-3.5 py-2.5 text-[14px] leading-relaxed sm:px-4 sm:py-3',
            mine ? 'bg-ink text-white' : 'bg-field text-ink',
          )}
        >
          {message.text}
        </div>
        <span className="shrink-0 pb-0.5 text-[11px] text-mute">{timeAgo(message.createdAt)}</span>
      </div>
    </div>
  );
}
