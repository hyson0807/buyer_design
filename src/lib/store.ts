'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
} from 'react';
import type {
  Buyer,
  ChatMessage,
  ChatThread,
  PendingIntent,
  SampleRequest,
  SampleRequestStatus,
} from '@/lib/types';

/**
 * @PORT(drop) — 이 파일 전체가 프로토타입 배관이다.
 * klow_buyer 이식 시: 상태는 서버가 갖고, 아래 액션 9개의 본문이 useMutation 으로,
 * 셀렉터는 useQuery 로 바뀐다. **화면 컴포넌트는 dispatch 를 직접 부르지 않는다** —
 * 전부 useAppActions() 를 거치므로 교체 지점이 이 파일 하나로 국소화된다.
 *
 * zustand 를 쓰지 않은 이유: 상태가 단일 객체이고 액션이 9개뿐이라 얻는 게 없다.
 */

const KEY = 'klow_buyer_design_v1';

export type AppState = {
  buyer: Buyer | null;
  requests: SampleRequest[];
  threads: ChatThread[];
  pendingIntent: PendingIntent;
  /**
   * 인증 모달 개폐. pendingIntent 와 같은 흐름이라 같은 컨테이너에 둔다 —
   * 별도 컨텍스트를 만들면 Providers 중첩만 늘고 두 값이 따로 놀 여지가 생긴다.
   */
  authOpen: 'signin' | 'signup' | null;
  /** ⚠️ localStorage 를 읽기 전에는 false. 이 값으로 렌더를 가려 hydration mismatch 를 막는다. */
  hydrated: boolean;
};

const EMPTY: AppState = {
  buyer: null,
  requests: [],
  threads: [],
  pendingIntent: null,
  authOpen: null,
  hydrated: false,
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'HYDRATED' }
  | { type: 'SIGN_IN'; buyer: Buyer }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_PENDING_INTENT'; intent: PendingIntent }
  | { type: 'CLEAR_PENDING_INTENT' }
  | { type: 'OPEN_AUTH'; mode: 'signin' | 'signup' }
  | { type: 'CLOSE_AUTH' }
  | { type: 'CREATE_REQUEST'; request: SampleRequest; opening: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'ADVANCE_STATUS'; requestId: string; status: SampleRequestStatus; trackingNo?: string }
  | { type: 'MARK_READ'; requestId: string }
  | { type: 'RESET_DEMO' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'HYDRATED':
      return { ...state, hydrated: true };
    case 'SIGN_IN':
      return { ...state, buyer: action.buyer, authOpen: null };
    case 'SIGN_OUT':
      // 요청·스레드는 남긴다 — 데모에서 다시 로그인하면 이력이 그대로 보이는 편이 낫다.
      return { ...state, buyer: null, pendingIntent: null };
    case 'SET_PENDING_INTENT':
      return { ...state, pendingIntent: action.intent };
    case 'CLEAR_PENDING_INTENT':
      return { ...state, pendingIntent: null };
    case 'OPEN_AUTH':
      return { ...state, authOpen: action.mode };
    case 'CLOSE_AUTH':
      // 모달을 그냥 닫으면 대기 중이던 의도도 버린다 — 안 그러면 나중에 아무 관계 없는
      // 로그인에서 옛 브랜드의 요청 폼이 튀어나온다.
      return { ...state, authOpen: null, pendingIntent: null };
    case 'CREATE_REQUEST':
      return {
        ...state,
        requests: [action.request, ...state.requests],
        threads: [
          {
            requestId: action.request.id,
            brandId: action.request.brandId,
            messages: action.opening,
            lastReadAt: new Date().toISOString(),
          },
          ...state.threads,
        ],
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.requestId === action.message.requestId
            ? { ...t, messages: [...t.messages, action.message] }
            : t,
        ),
      };
    case 'ADVANCE_STATUS':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.requestId
            ? { ...r, status: action.status, trackingNo: action.trackingNo ?? r.trackingNo }
            : r,
        ),
      };
    case 'MARK_READ':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.requestId === action.requestId ? { ...t, lastReadAt: new Date().toISOString() } : t,
        ),
      };
    case 'RESET_DEMO':
      return { ...EMPTY, hydrated: true };
    default:
      return state;
  }
}

/**
 * ⚠️ 상태와 액션을 **두 컨텍스트로 나눈다.** 합치면 메시지 하나 추가할 때마다
 *    액션만 쓰는 컴포넌트(Header 의 Sign in 버튼 등)까지 전부 리렌더된다.
 */
const StateCtx = createContext<AppState>(EMPTY);
const ActionsCtx = createContext<Actions | null>(null);

export type Actions = {
  signIn: (buyer: Buyer) => void;
  signOut: () => void;
  setPendingIntent: (intent: PendingIntent) => void;
  clearPendingIntent: () => void;
  openAuth: (mode: 'signin' | 'signup') => void;
  closeAuth: () => void;
  createRequest: (request: SampleRequest, opening: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  advanceStatus: (requestId: string, status: SampleRequestStatus, trackingNo?: string) => void;
  markRead: (requestId: string) => void;
  resetDemo: () => void;
};

export function buildActions(dispatch: Dispatch<Action>): Actions {
  return {
    signIn: (buyer) => dispatch({ type: 'SIGN_IN', buyer }),
    signOut: () => dispatch({ type: 'SIGN_OUT' }),
    setPendingIntent: (intent) => dispatch({ type: 'SET_PENDING_INTENT', intent }),
    clearPendingIntent: () => dispatch({ type: 'CLEAR_PENDING_INTENT' }),
    openAuth: (mode) => dispatch({ type: 'OPEN_AUTH', mode }),
    closeAuth: () => dispatch({ type: 'CLOSE_AUTH' }),
    createRequest: (request, opening) => dispatch({ type: 'CREATE_REQUEST', request, opening }),
    addMessage: (message) => dispatch({ type: 'ADD_MESSAGE', message }),
    advanceStatus: (requestId, status, trackingNo) =>
      dispatch({ type: 'ADVANCE_STATUS', requestId, status, trackingNo }),
    markRead: (requestId) => dispatch({ type: 'MARK_READ', requestId }),
    resetDemo: () => dispatch({ type: 'RESET_DEMO' }),
  };
}

export function useAppReducer() {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const actions = useMemo(() => buildActions(dispatch), []);

  // ⚠️ useState 초기화 함수에서 localStorage 를 읽으면 안 된다 — 서버는 빈 상태로,
  //    클라는 채워진 상태로 렌더해 React 가 트리를 통째로 버린다(hydration mismatch).
  //    반드시 mount effect 에서 읽고 hydrated 플래그를 세운다.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as Partial<AppState> });
      else dispatch({ type: 'HYDRATED' });
    } catch {
      dispatch({ type: 'HYDRATED' });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      // ⚠️ hydrated 와 authOpen 은 저장하지 않는다 — 저장하면 새로고침 때 모달이 되살아난다.
      const { hydrated: _h, authOpen: _a, ...persist } = state;
      window.localStorage.setItem(KEY, JSON.stringify(persist));
    } catch {
      // 프라이빗 모드 등 — 영속은 데모 편의일 뿐이라 조용히 넘긴다.
    }
  }, [state]);

  return { state, actions };
}

export const AppStateProvider = StateCtx.Provider;
export const AppActionsProvider = ActionsCtx.Provider;

export function useAppState(): AppState {
  return useContext(StateCtx);
}

export function useAppActions(): Actions {
  const ctx = useContext(ActionsCtx);
  if (!ctx) throw new Error('useAppActions must be used inside <Providers>');
  return ctx;
}

/** @PORT(auth): 이식 시 useSession() 으로 교체. */
export function useBuyer(): Buyer | null {
  return useAppState().buyer;
}

/** @PORT(api): 이식 시 useQuery(qk.requests) 로 교체. */
export function useRequests(): SampleRequest[] {
  return useAppState().requests;
}

/** @PORT(api): 이식 시 useQuery(qk.thread(id)) 로 교체. */
export function useThread(requestId: string): ChatThread | undefined {
  return useAppState().threads.find((t) => t.requestId === requestId);
}
