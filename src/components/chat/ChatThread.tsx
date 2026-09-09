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
    <div className="flex min-h-[560px] flex-col rounded-xl2 border border-line bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
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

      <div className="flex items-end gap-2 border-t border-line p-4">
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
          placeholder="Ask about MOQ, pricing, certifications…"
          className="form-textarea min-h-[44px] resize-none py-3"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-accent-strong text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
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
      <div className={cn('max-w-[78%]', mine && 'text-right')}>
        <div
          className={cn(
            'whitespace-pre-line rounded-xl2 px-4 py-3 text-[14px] leading-relaxed',
            mine ? 'bg-ink text-white' : 'bg-field text-ink',
          )}
        >
          {message.text}
        </div>
        <p className="mt-1 text-[11.5px] text-mute">{timeAgo(message.createdAt)}</p>
      </div>
    </div>
  );
}
