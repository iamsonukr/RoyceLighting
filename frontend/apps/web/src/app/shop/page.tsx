import { Metadata } from 'next';
import { ShopClient } from '../../components/shop/ShopClient';

export const metadata: Metadata = {
  title: 'Shop - Royce Lighting',
  description: 'Browse all handcrafted jewellery and accessories',
};

interface ShopPageProps {
  searchParams: { category?: string; search?: string; minPrice?: string; maxPrice?: string; page?: string; sortBy?: string };
}

async function getProducts(params: ShopPageProps['searchParams']) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.minPrice) query.set('minPrice', params.minPrice);
  if (params.maxPrice) query.set('maxPrice', params.maxPrice);
  if (params.page) query.set('page', params.page);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  query.set('limit', '20');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${query}`,
      { next: { revalidate: 60 } },
    );
    const data = await res.json();
    return data.data || { products: [], total: 0, pages: 1 };
  } catch {
    return { products: [], total: 0, pages: 1 };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const data = await getProducts(searchParams);
  return <ShopClient initialData={data} searchParams={searchParams} />;
}
