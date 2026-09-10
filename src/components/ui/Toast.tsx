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
      {/* ⚠️ 좌우 폭을 제한한다 — 브랜드 상세의 sticky 선택 바 위에 뜨는데, 긴 메시지가
          가운데 정렬 + translate 라 폭 제한이 없으면 화면 밖으로 넘친다. */}
      <div className="pointer-events-none fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white shadow-pop ' +
              (t.kind === 'success' ? 'bg-ok' : t.kind === 'error' ? 'bg-danger' : 'bg-ink')
            }
          >
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
