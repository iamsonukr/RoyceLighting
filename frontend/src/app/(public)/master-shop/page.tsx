import { Metadata } from 'next';
import { ShopClient } from '@/components/shop/ShopClient';
import { fetchPublicCategories, PUBLIC_API_URL } from '@/lib/publicCategories';

export const metadata: Metadata = {
  title: 'Collections — Royace Lighting',
  description: 'Browse our full collection of handcrafted luxury chandeliers, pendants, sconces, and table lamps.',
};

async function getProducts(params: Record<string, string | undefined>) {
  try {
    const query = new URLSearchParams();
    const category = params.category || params.collection;
    if (category) query.set('category', category);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy.replace('_asc', '').replace('_desc', ''));
    if (params.sortBy?.includes('_asc')) query.set('order', 'asc');
    if (params.sortBy?.includes('_desc')) query.set('order', 'desc');
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    query.set('page', params.page || '1');
    query.set('limit', '16');

    const res = await fetch(
      `${PUBLIC_API_URL}/products?${query.toString()}`,
      { next: { revalidate: 60 } },
    );
    const data = await res.json();
    return {
      products: data.data?.products || data.products || [],
      total: data.data?.total || data.total || 0,
      pages: data.data?.pages || data.pages || 1,
    };
  } catch {
    return { products: [], total: 0, pages: 1 };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [initialData, categories] = await Promise.all([
    getProducts(params),
    fetchPublicCategories({ next: { revalidate: 60 } }),
  ]);

  return <ShopClient initialData={initialData} searchParams={params} categories={categories} />;
}
