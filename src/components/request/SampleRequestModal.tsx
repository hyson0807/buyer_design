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
import { getBestsellers, getProductsByIds, wholesaleCents } from '@/lib/mock-brands';
import { formatUsd } from '@/lib/format';
import { FREE_SHIPPING_SKUS, skusToFreeShipping } from '@/lib/sampling';
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
  /**
   * 무료배송은 **SKU 수** 기준이다(수량 합이 아니다) — 같은 제품 5개는 한 SKU 다.
   * 체크박스로 "배송비는 내가 낼게요"를 묻던 자리를 정책이 대신한다: 5 SKU 미만이면
   * 바이어가 배송비를 낸다.
   */
  const remaining = skusToFreeShipping(ids.length);
  const coversShipping = remaining > 0;

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
        text: openingMessage(buyer, products),
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
        className="mb-1 pr-8 font-display text-[22px] font-semibold tracking-[-0.01em]"
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
          {/* ⚠️ 제목 뒤에 숫자만 붙이면("Selected products 0") 제목의 일부처럼 읽힌다.
                 개수는 골랐을 때만, 그것도 오른쪽에 떼어 둔다. */}
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">Selected products</span>
            {products.length > 0 && (
              <span className="text-[12px] tabular-nums text-mute">
                {products.length} selected
              </span>
            )}
          </div>

          {products.length === 0 ? (
            // 2차 제품 피커를 만들지 않는다 — 브랜드 페이지에 이미 그리드가 있고,
            // 아무것도 안 고른 사람에게 필요한 건 목록이 아니라 한 번의 채움이다.
            // ⚠️ 점선 테두리를 쓰지 않는다 — 점선은 "여기에 끌어다 놓으라"는 뜻인데
            //    여기서 할 일은 드래그가 아니라 뒤 화면에서 고르거나 버튼을 누르는 것이다.
            <div className="rounded-none bg-field px-4 py-5 text-center">
              <p className="text-[13px] text-sub">
                Nothing picked yet — close this and tick products, or start from the shortlist.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIds(getBestsellers(brand.id, 3).map((p) => p.id))}
              >
                Add the 3 best sellers
              </Button>
            </div>
          ) : (
            /*
              ⚠️ 각 행을 테두리 상자로 두지 않는다. 바로 아래가 입력칸(테두리 있는 상자)
                 들이라, 같은 모양이면 "고른 제품"과 "채워야 할 칸"이 형태로 구분되지
                 않는다. 목록은 실선으로만 나눈다(요청 목록·브랜드 팩트와 같은 관례).
              ⚠️ 아래쪽 실선은 두지 않는다 — 다음 구획(CONTACT)이 `border-t` 로 시작하므로
                 두면 14px 간격으로 실선이 두 줄 그어진다(실측).
              ⚠️ 썸네일 라운딩은 10px 로 맞춘다 — 7px 은 이 프로젝트에 없는 네 번째 값이었다.
            */
            <ul className="divide-y divide-line border-t border-line">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-none bg-field">
                    <SafeImage
                      src={p.image}
                      alt={p.name}
                      name={p.name}
                      accent={brand.accentColor}
                      sizes="44px"
                    />
                  </span>

                  {/*
                    ⚠️ 좁은 화면에서는 이름과 수량 스테퍼를 **두 줄로 쌓는다.** 한 줄에
                       두면 360px 에서 이름 칸이 58px 만 남아 제품명이 서너 글자로 잘렸다
                       (실측). 행이 조금 길어지는 대신 무엇을 요청하는지가 읽힌다.
                  */}
                  {/* ⚠️ `items-start` 가 없으면 세로로 쌓인 수량 스테퍼가 stretch 되어
                      행 폭만큼 늘어난 빈 상자로 보인다(실측 스크린샷에서 잡았다). */}
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[14px] leading-snug text-ink">{p.name}</span>
                      <span className="mt-0.5 block text-[12px] tabular-nums text-sub">
                        {formatUsd(wholesaleCents(p))} wholesale
                      </span>
                    </span>

                    {/* 수량은 제품마다 다르다 — 관심 있는 SKU 를 2~3개씩,
                        나머지는 1개씩 받는 게 실제 샘플 요청의 모습이다. */}
                    <QtyStepper
                      value={qtyOf(p.id)}
                      onChange={(n) => setQty(p.id, n)}
                      label={p.name}
                    />
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => setIds((prev) => prev.filter((id) => id !== p.id))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute transition hover:bg-ink/5 hover:text-ink sm:h-7 sm:w-7"
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
          <h3 className="text-[13px] font-semibold text-ink">
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
          <h3 className="text-[13px] font-semibold text-ink">
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
        </section>


        {/*
          ⚠️ 제출 버튼은 모달 하단에 **고정**한다. 이 폼은 제품·연락처·주소를 합쳐
             한 화면을 훌쩍 넘기므로, 흐름에 두면 CTA 가 스크롤 밖으로 밀려
             "다 채웠는데 보낼 방법이 없다"가 된다.
          ⚠️ `-mx-N -mb-N + px-N pb-N` 은 Modal 의 안쪽 패딩을 상쇄해 바닥까지 붙이는 것이다
               (BusinessDetailsStep 과 같은 규칙).
          ⚠️ `-bottom-N` 도 같은 값이다. sticky 는 스크롤 컨테이너의 **content box**
             바닥에 붙으므로 bottom-0 이면 패딩만큼 떠서, 그 틈으로 뒤 내용이
             비치고 흰 띠가 남는다(실측: 푸터 하단 905px vs 스크롤 하단 933px).
          ⚠️ 상쇄 값이 브레이크포인트마다 다르다 — Modal 의 안쪽 패딩이 모바일 20px /
             데스크탑 28px 라, `-mx/-mb/px/pb/-bottom` **다섯 개를 한 벌로** 함께 바꾼다.
             바텀시트는 화면 바닥에 붙으므로 홈 인디케이터만큼 아래 여백을 더한다.
        */}
        <div className="sticky -bottom-5 -mx-5 -mb-5 border-t border-line bg-surface px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 sm:-bottom-7 sm:-mx-7 sm:-mb-7 sm:px-7 sm:pb-7">
          {/* 샘플 합계 + 배송 — 제출 직전에 "얼마를, 배송비는 누가"를 한 번에 확인한다. */}
          {products.length > 0 && (
            <dl className="mb-4 space-y-1 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-sub">Samples at wholesale</dt>
                <dd className="tabular-nums text-ink">
                  {formatUsd(products.reduce((sum, p) => sum + wholesaleCents(p) * qtyOf(p.id), 0))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-sub">
                  Shipping
                  {remaining > 0 && (
                    <span className="text-mute">
                      {' '}
                      · add {remaining} more {remaining === 1 ? 'SKU' : 'SKUs'} to ship free
                    </span>
                  )}
                </dt>
                <dd className="shrink-0 text-ink">
                  {remaining === 0 ? `Free · ${FREE_SHIPPING_SKUS}+ SKUs` : 'Quoted by brand'}
                </dd>
              </div>
            </dl>
          )}
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
    <div className="flex shrink-0 items-center rounded-none border border-line">
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
