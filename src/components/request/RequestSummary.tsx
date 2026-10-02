import { SafeImage } from '@/components/ui/SafeImage';
import { getBrandById, getProductsByIds } from '@/lib/mock-brands';
import { cn } from '@/lib/utils';
import { countryByName } from '@/lib/countries';
import type { SampleRequest, SampleRequestStatus, ShippingAddress } from '@/lib/types';

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
    /* ⚠️ `lg:min-h-full` — 상세 화면에서 이 카드는 채팅과 같은 높이의 칸에 놓인다.
          안 주면 내용이 짧을 때 카드만 짧아져 두 카드의 바닥이 어긋난다. */
    <div className="rounded-none border border-line bg-surface p-5 sm:p-6 lg:min-h-full">
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
          <p className="text-[12.5px] text-sub">Ship to {request.shipTo.country}</p>
        </div>
      </div>

      {/*
        상태 스테퍼.
        ⚠️ 지난 단계와 현재 단계를 같은 색으로 칠하면 "어디까지 왔는가"를 못 읽는다 —
           세 칸이 전부 채워진 화면에서는 진행바가 아니라 그냥 장식 줄이 된다.
           지난 단계는 흐린 잉크, 현재만 진한 잉크, 남은 단계는 선 색으로 셋을 나눈다.
        ⚠️ 채움색은 보라가 아니라 잉크다. 이 프로젝트에서 "선택·현재"는 잉크가 맡고
           (제품 카드 선택링과 같은 규칙), 보라는 주 CTA 와 포커스링에만 남긴다.
      */}
      <ol className="mt-6 flex items-start gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-2">
            <span
              className={cn(
                'h-[3px] rounded-full',
                i < current ? 'bg-ink/25' : i === current ? 'bg-ink' : 'bg-line',
              )}
            />
            <span
              className={cn(
                'text-[11.5px]',
                i === current ? 'font-semibold text-ink' : i < current ? 'text-sub' : 'text-mute',
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
        <div>
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mute">
            Ship to
          </dt>
          <dd className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-sub">
            {formatAddress(request.shipTo)}
          </dd>
        </div>
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

/** 배송지를 한 덩어리로 읽히게 정리한다. 빈 칸은 줄 자체를 만들지 않는다. */
function formatAddress(a: ShippingAddress): string {
  const dial = countryByName(a.country)?.dial ?? '';
  // 미국은 EFS 가 "City, State" 를 요구하므로 화면에서도 같은 모양으로 붙여 둔다.
  const cityLine = [a.city, a.state].filter(Boolean).join(', ');
  return [
    a.recipientName,
    a.email,
    [a.line1, a.line2].filter(Boolean).join(', '),
    [cityLine, a.postalCode].filter(Boolean).join(' '),
    a.country,
    a.phoneLocal && `${dial} ${a.phoneLocal}`,
  ]
    .filter(Boolean)
    .join('\n');
}
