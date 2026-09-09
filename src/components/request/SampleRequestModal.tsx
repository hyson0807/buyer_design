'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/ui/Toast';
import { COUNTRIES } from '@/lib/countries';
import { getBestsellers, getProductsByIds } from '@/lib/mock-brands';
import { openingMessage } from '@/lib/auto-reply';
import { useAppActions, useBuyer } from '@/lib/store';
import type { BuyerBrand, ChatMessage, SampleRequest } from '@/lib/types';

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
  const { createRequest } = useAppActions();
  const toast = useToast();
  const router = useRouter();

  const [ids, setIds] = useState<string[]>(productIds);
  const [qty, setQty] = useState(1);
  const [country, setCountry] = useState(buyer?.country ?? 'United States');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [coversShipping, setCoversShipping] = useState(false);

  // 열릴 때마다 바깥에서 넘어온 선택과 배송국을 다시 맞춘다.
  useEffect(() => {
    if (!open) return;
    setIds(productIds);
    if (buyer?.country) setCountry(buyer.country);
  }, [open, productIds, buyer?.country]);

  const products = useMemo(() => getProductsByIds(brand.id, ids), [brand.id, ids]);

  if (!open || !buyer) return null;

  const submit = () => {
    const request: SampleRequest = {
      id: `req_${Date.now()}`,
      brandId: brand.id,
      items: ids.map((productId) => ({ productId, qty })),
      shipToCountry: country,
      address: address.trim(),
      message: message.trim(),
      coversShipping,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    const at = Date.now();
    const opening: ChatMessage[] = [
      {
        id: `m_${at}_0`,
        requestId: request.id,
        from: 'system',
        text: `Sample request sent · ${products.length} ${products.length === 1 ? 'item' : 'items'} · ship to ${country}`,
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
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <Field label="Qty per item">
            <select
              className="form-select"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            >
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ship to" required>
            <select
              className="form-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Shipping address" required>
          <textarea
            required
            className="form-textarea"
            placeholder={'Company name\nStreet, city, postal code\nRecipient name and phone'}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>

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

        <Button type="submit" fullWidth disabled={products.length === 0}>
          Send request
        </Button>
      </form>
    </Modal>
  );
}
