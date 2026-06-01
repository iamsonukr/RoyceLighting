import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '../../../components/products/ProductDetailClient';

interface Props {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Product Not Found' };
  const productImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  return {
    title: `${product.name} - Royce Lighting`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: productImages,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
