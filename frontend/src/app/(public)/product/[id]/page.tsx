import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PUBLIC_API_URL } from '@/lib/publicCategories';

async function getProduct(id: string) {
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/products/${id}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

async function getRelated(category: string | undefined, excludeId: string) {
  if (!category) return [];
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/products?category=${encodeURIComponent(category)}&limit=4`,
      { cache: 'no-store' },
    );
    const data = await res.json();
    return (data.data?.products || data.products || []).filter((p: any) => p._id !== excludeId);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product — Royace Lighting' };
  return {
    title: `${product.name} — Royace Lighting`,
    description: product.description?.substring(0, 160) || `${product.name} — Handcrafted luxury lighting by Royace.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const categoryRef = typeof product.category === 'object'
    ? product.category?.slug || product.category?._id
    : product.category;
  const related = await getRelated(categoryRef, product._id || id);

  return (
    <div>
      <ProductDetailClient product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <section
          style={{
            padding: '6rem 1.5rem 8rem',
            background: 'linear-gradient(180deg, rgba(6,47,36,0.78), var(--charcoal-2))',
            borderTop: '1px solid rgba(0,96,57,0.24)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p className="overline-text" style={{ marginBottom: '0.875rem' }}>You May Also Like</p>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)' }}>
                  Related Pieces
                </h2>
              </div>
              <Link
                href={`/shop?category=${categoryRef}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-light)', textDecoration: 'none' }}
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ gap: '1px', background: 'rgba(0,96,57,0.18)' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.slice(0, 4).map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
