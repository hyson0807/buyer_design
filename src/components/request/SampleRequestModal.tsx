'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/ui/Toast';
import {
  EMPTY_ADDRESS,
  ShippingAddressFields,
  fromShippingAddress,
  toShippingAddress,
  type AddressForm,
} from '@/components/address/ShippingAddressFields';
import { getBestsellers, getProductsByIds } from '@/lib/mock-brands';
import { openingMessage } from '@/lib/auto-reply';
import { useAppActions, useBuyer } from '@/lib/store';
import type { BuyerBrand, ChatMessage, SampleRequest } from '@/lib/types';

const MAX_QTY = 5;

export function SampleRequestModal({
  open,
  onClose,
  brand,
  productIds,
}: {
  open: boolean;
  onClose: () => void;
  brand: BuyerBrand;
  productIds: string[];
}) {
  const buyer = useBuyer();
  const { createRequest, updateBuyer } = useAppActions();
  const toast = useToast();
  const router = useRouter();

  const [ids, setIds] = useState<string[]>(productIds);
  /** 제품별 수량. 목록에 없는 id 는 1로 본다 — 제품이 추가될 때마다 채워 넣지 않아도 된다. */
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const [recipientName, setRecipientName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [message, setMessage] = useState('');
  const [coversShipping, setCoversShipping] = useState(false);

  /**
   * 열릴 때마다 선택과 배송지를 다시 맞춘다.
   *
   * ⚠️ 저장된 주소가 있으면 **통째로** 싣는다. "빈 칸만 채우기"로 하면 지난번 주소를
   *    지우고 새 주소를 쓰다 모달을 닫은 사람이 다시 열었을 때 반쪽짜리 주소를 보게 된다.
   *    저장본은 마지막으로 실제 발송한 주소이므로 그게 기준이다.
   * ⚠️ 수취인 이름·이메일은 프리필만 하고 잠그지 않는다 — 구매 담당자가 가입하고
   *    물류 담당자 주소로 받는 경우가 흔하다.
   */
  useEffect(() => {
    if (!open) return;
    setIds(productIds);
    if (!buyer) return;
    const saved = buyer.defaultShipTo;
    setRecipientName(saved?.recipientName || buyer.fullName);
    setEmail(saved?.email || buyer.email);
    setAddress(saved ? fromShippingAddress(saved) : { ...EMPTY_ADDRESS, country: buyer.country });
  }, [open, productIds, buyer]);

  const products = useMemo(() => getProductsByIds(brand.id, ids), [brand.id, ids]);
  const qtyOf = (id: string) => qtyById[id] ?? 1;

  if (!open || !buyer) return null;

  const setQty = (id: string, next: number) =>
    setQtyById((prev) => ({ ...prev, [id]: Math.min(MAX_QTY, Math.max(1, next)) }));

  const submit = () => {
    const shipTo = toShippingAddress(address, { recipientName, email });

    const request: SampleRequest = {
      id: `req_${Date.now()}`,
      brandId: brand.id,
      items: ids.map((productId) => ({ productId, qty: qtyOf(productId) })),
      shipTo,
      message: message.trim(),
      coversShipping,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    const at = Date.now();
    const units = request.items.reduce((sum, i) => sum + i.qty, 0);
    const opening: ChatMessage[] = [
      {
        id: `m_${at}_0`,
        requestId: request.id,
        from: 'system',
        text: `Sample request sent · ${units} ${units === 1 ? 'unit' : 'units'} · ship to ${shipTo.country}`,
        createdAt: new Date(at).toISOString(),
      },
      {
        id: `m_${at}_1`,
        requestId: request.id,
        from: 'brand',
        text: openingMessage(brand, buyer, products),
        createdAt: new Date(at + 1000).toISOString(),
      },
    ];

    // @PORT(api): POST /v1/buyer/sample-requests
    createRequest(request, opening);
    // 다음 요청을 위해 이번 배송지를 기억한다.
    updateBuyer({ defaultShipTo: shipTo });
    toast.success(`Request sent to ${brand.name}`);
    onClose();
    router.push(`/requests/${request.id}`);
  };

  return (
    <Modal open onClose={onClose} labelledBy="request-modal-title" size="lg">
      <h2
        id="request-modal-title"
        className="mb-1 font-display text-[20px] font-bold tracking-[-0.02em]"
      >
        Request samples
      </h2>
      <p className="mb-6 text-[13px] text-sub">from {brand.name}</p>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <section>
          <span className="mb-2 block text-[13px] font-semibold text-ink">
            Selected products{' '}
            <span className="font-normal tabular-nums text-mute">{products.length}</span>
          </span>

          {products.length === 0 ? (
            // 2차 제품 피커를 만들지 않는다 — 브랜드 페이지에 이미 그리드가 있고,
            // 아무것도 안 고른 사람에게 필요한 건 목록이 아니라 한 번의 채움이다.
            <div className="rounded-[10px] border border-dashed border-line px-4 py-5 text-center">
              <p className="text-[13px] text-sub">No products selected yet.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIds(getBestsellers(brand.id, 3).map((p) => p.id))}
              >
                Request this brand&apos;s 3 bestsellers
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-[10px] border border-line bg-surface p-2"
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[7px] bg-field">
                    <SafeImage
                      src={p.image}
                      alt={p.name}
                      name={p.name}
                      accent={brand.accentColor}
                      sizes="44px"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                    {p.name}
                  </span>

                  {/* 수량은 제품마다 다르다 — 관심 있는 SKU 를 2~3개씩,
                      나머지는 1개씩 받는 게 실제 샘플 요청의 모습이다. */}
                  <QtyStepper
                    value={qtyOf(p.id)}
                    onChange={(n) => setQty(p.id, n)}
                    label={p.name}
                  />

                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => setIds((prev) => prev.filter((id) => id !== p.id))}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-mute transition hover:bg-ink/5 hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/*
          배송지 — klow_web 결제 폼(`checkout/page.tsx`)과 같은 필드 구성·같은 순서다.
          ⚠️ 도시·우편번호가 주소칸 **위**에 있는 것은 의도다. 실서버에서는 주소칸이
             Google Places 자동완성인데, 도시를 먼저 받아 둬야 자동완성이 다른 도시의
             주소를 돌려줬을 때 그 자리에서 경고할 수 있다. 순서를 바꾸지 말 것.
        */}
        <section className="space-y-4 border-t border-line pt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">
            Contact
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name" required>
              <input
                required
                className="form-input"
                placeholder="Alex Moreau"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </Field>
            <Field label="Email" required hint="Where the brand sends tracking.">
              <input
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">
            Shipping address
          </h3>
          {/* 프로필 페이지의 기본 배송지와 **같은 컴포넌트**다 — 두 화면이 각자 그리면
              필드 순서·국가번호 파생·미국 State 규칙이 갈린다. */}
          <ShippingAddressFields
            value={address}
            onChange={(patch) => setAddress((prev) => ({ ...prev, ...patch }))}
          />
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <Field
            label="Message to the brand"
            hint="Brands prioritise requests that explain the store and the timeline."
          >
            <textarea
              className="form-textarea"
              placeholder="Share your store, target market, and when you plan to order."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-sub">
            <input
              type="checkbox"
              checked={coversShipping}
              onChange={(e) => setCoversShipping(e.target.checked)}
              className="h-4 w-4 accent-[#7C3AED]"
            />
            I&apos;ll cover courier costs
          </label>
        </section>

        {/*
          ⚠️ 제출 버튼은 모달 하단에 **고정**한다. 이 폼은 제품·연락처·주소를 합쳐
             한 화면을 훌쩍 넘기므로, 흐름에 두면 CTA 가 스크롤 밖으로 밀려
             "다 채웠는데 보낼 방법이 없다"가 된다.
          ⚠️ `-mx-7 -mb-7 + px-7 pb-7` 은 Modal 의 p-7 을 상쇄해 바닥까지 붙이는 것이다
               (BusinessDetailsStep 과 같은 규칙).
          ⚠️ `-bottom-7` 도 같은 28px 다. sticky 는 스크롤 컨테이너의 **content box**
             바닥에 붙으므로 bottom-0 이면 패딩만큼(28px) 떠서, 그 틈으로 뒤 내용이
             비치고 흰 띠가 남는다(실측: 푸터 하단 905px vs 스크롤 하단 933px).
        */}
        <div className="sticky -bottom-7 -mx-7 -mb-7 border-t border-line bg-surface px-7 pb-7 pt-4">
          <Button type="submit" fullWidth disabled={products.length === 0}>
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center rounded-[10px] border border-line">
      <StepButton
        ariaLabel={`Decrease quantity of ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </StepButton>
      <span className="w-7 text-center text-[13.5px] font-semibold tabular-nums text-ink">
        {value}
      </span>
      <StepButton
        ariaLabel={`Increase quantity of ${label}`}
        disabled={value >= MAX_QTY}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </StepButton>
    </div>
  );
}

function StepButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: {
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      // ⚠️ type="button" 이 없으면 스테퍼를 누를 때마다 폼이 제출된다.
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-7 items-center justify-center text-ink transition-colors hover:bg-ink/[0.05] disabled:text-mute disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
