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
    <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 md:px-10">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sub transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        All requests
      </Link>

      {/* hydrate 전에는 "없음"을 단정할 수 없다 — localStorage 를 아직 안 읽었다. */}
      {!hydrated ? (
        <div className="mt-10 h-[560px] animate-pulse rounded-xl2 bg-field" />
      ) : !request || !brand ? (
        <p className="mt-16 text-center text-[14px] text-sub">
          This request no longer exists.{' '}
          <Link href="/" className="text-accent-strong underline underline-offset-2">
            Browse brands
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <RequestSummary request={request} />
          <ChatThread request={request} brand={brand} />
        </div>
      )}
    </div>
  );
}
