'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AppActionsProvider, AppStateProvider, useAppReducer } from '@/lib/store';

export default function Providers({ children }: { children: ReactNode }) {
  const { state, actions } = useAppReducer();
  return (
    <AppStateProvider value={state}>
      <AppActionsProvider value={actions}>
        <ToastProvider>{children}</ToastProvider>
      </AppActionsProvider>
    </AppStateProvider>
  );
}
