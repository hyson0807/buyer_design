import { SafeImage } from '@/components/ui/SafeImage';
import { getBrandById, getProductsByIds } from '@/lib/mock-brands';
import { cn } from '@/lib/utils';
import type { SampleRequest, SampleRequestStatus } from '@/lib/types';

const STEPS: SampleRequestStatus[] = ['submitted', 'accepted', 'shipped'];
const LABEL: Record<SampleRequestStatus, string> = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  shipped: 'Shipped',
};

/** 요청 요약 + 상태 스테퍼. 목록 행과 상세 좌측 패널이 같은 컴포넌트를 쓴다. */
export function RequestSummary({ request }: { request: SampleRequest }) {
  const brand = getBrandById(request.brandId);
  const products = getProductsByIds(
    request.brandId,
    request.items.map((i) => i.productId),
  );
  const current = STEPS.indexOf(request.status);

  return (
    <div className="rounded-xl2 border border-line bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-field">
          <SafeImage
            src={brand?.logosCircle[0]}
            alt={brand?.name ?? ''}
            name={brand?.name ?? '?'}
            accent={brand?.accentColor}
            sizes="40px"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[16px] font-semibold text-ink">{brand?.name}</p>
          <p className="text-[12.5px] text-sub">Ship to {request.shipToCountry}</p>
        </div>
      </div>

      {/* 상태 스테퍼 */}
      <ol className="mt-6 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-1.5">
            <span
              className={cn(
                'h-1 rounded-full',
                i <= current ? 'bg-accent-strong' : 'bg-line',
              )}
            />
            <span
              className={cn(
                'text-[11.5px] font-semibold',
                i <= current ? 'text-ink' : 'text-mute',
              )}
            >
              {LABEL[s]}
            </span>
          </li>
        ))}
      </ol>

      {request.trackingNo && (
        <p className="mt-4 text-[12.5px] text-sub">
          Tracking <span className="font-semibold tabular-nums text-ink">{request.trackingNo}</span>
        </p>
      )}

      <dl className="mt-6 space-y-3 border-t border-line pt-5">
        <div>
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mute">Items</dt>
          <dd className="mt-1.5 space-y-1">
            {products.map((p) => {
              const item = request.items.find((i) => i.productId === p.id);
              return (
                <p key={p.id} className="text-[13.5px] text-ink">
                  {p.name}
                  <span className="ml-1.5 text-mute">×{item?.qty ?? 1}</span>
                </p>
              );
            })}
          </dd>
        </div>
        {request.address && (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mute">
              Address
            </dt>
            <dd className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-sub">
              {request.address}
            </dd>
          </div>
        )}
        {request.message && (
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mute">
              Your message
            </dt>
            <dd className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-sub">
              {request.message}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
