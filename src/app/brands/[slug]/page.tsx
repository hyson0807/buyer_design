import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBrandBySlug, getBrands } from '@/lib/mock-brands';
import { brandIntro } from '@/lib/brand-tags';
import { BrandDetail } from '@/components/brand/BrandDetail';

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug as string }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const brand = getBrandBySlug(params.slug);
  if (!brand) return {};
  return { title: brand.name, description: brandIntro(brand) };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  // @PORT(api): getBrandBySlug → GET /v1/brands/by-slug/{slug}
  const brand = getBrandBySlug(params.slug);
  if (!brand) notFound();
  return <BrandDetail brand={brand} />;
}
