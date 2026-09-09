/**
 * 가격은 klow_server DTO 와 같이 **USD 센트 정수**로 다룬다(2630 → "$26.30").
 * 화면에서 나누기를 하지 않는 이유는, 이식 시 서버 값을 그대로 넘겨받기 위함이다.
 */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** 채팅·요청 목록의 상대 시각. 영문 UI 라 축약 표기. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** 로고가 없을 때 쓰는 이니셜. 실제 klow DB 에 로고가 빈 브랜드가 흔하다. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
