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
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2">
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
