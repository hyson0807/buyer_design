'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/** klow_brand/src/components/Toast.tsx 이식 — 그대로. */
type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

type ToastCtx = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const value: ToastCtx = {
    success: (m) => show('success', m),
    error: (m) => show('error', m),
    info: (m) => show('info', m),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {/*
        ⚠️⚠️ **자리가 화면 폭에 따라 갈린다.** 예전에는 어느 폭에서든 바닥 가운데였는데,
             거기는 이 앱에서 이미 세 번 쓰인다 — 브랜드 상세의 선택 바, 모달의 sticky
             CTA, iOS 홈 인디케이터. 그래서 토스트가 "Send request" 버튼을 그대로 덮어
             눌러야 할 것을 가렸다(실측).
             · 넓은 화면: **오른쪽 아래.** 모달 카드는 최대 640px 로 가운데 있으므로
               오른쪽 여백이 늘 비어 있다.
             · 좁은 화면: **맨 위 가운데.** 모달이 바텀시트라 아래가 통째로 막히는 대신
               위쪽 8% 는 항상 비어 있다(시트는 `max-h-[92dvh]`).
        ⚠️ 좌우 폭을 제한한다 — 좁은 화면은 가운데 정렬 + translate 라 폭 제한이 없으면
           긴 메시지가 화면 밖으로 넘친다.
        ⚠️ 배경은 종류와 무관하게 잉크 하나다. 성공을 초록 면으로 칠하면 무채색 화면에서
           그 알약이 페이지의 어떤 요소보다 강해진다 — 종류는 앞의 점 색으로만 말한다.
      */}
      <div className="pointer-events-none fixed left-1/2 top-2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2 sm:left-auto sm:right-6 sm:top-auto sm:bottom-6 sm:max-w-[360px] sm:translate-x-0 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-pop"
          >
            <span
              className={
                'h-1.5 w-1.5 shrink-0 rounded-full ' +
                (t.kind === 'success' ? 'bg-ok' : t.kind === 'error' ? 'bg-danger' : 'bg-mute')
              }
            />
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
