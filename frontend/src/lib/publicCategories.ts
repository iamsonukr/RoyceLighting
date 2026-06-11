export type PublicCategory = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  emoji?: string;
  sortOrder?: number;
};

type CategoryFetchOptions = RequestInit & {
  next?: { revalidate?: number };
};

export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PUBLIC_ASSET_URL = PUBLIC_API_URL.replace(/\/api\/?$/, '');

export const FALLBACK_CATEGORIES: PublicCategory[] = [
  {
    name: 'Chandeliers',
    slug: 'chandeliers',
    description: 'Statement lighting for foyers, dining rooms, and luxury living spaces.',
    image: 'https://images.unsplash.com/photo-1572955034096-233ea61a78d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hanging Lights',
    slug: 'hanging-lights',
    description: 'Decorative hanging fixtures for refined rooms and intimate corners.',
    image: 'https://images.unsplash.com/photo-1776313756952-32a2ec58d729?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Wall Lights',
    slug: 'wall-lights',
    description: 'Sculptural wall lighting for corridors, bedrooms, alcoves, and galleries.',
    image: 'https://images.unsplash.com/photo-1715948882565-ddc1ba98c3b9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Table Lamps',
    slug: 'table-lamps',
    description: 'Collected accents with warm diffusion and refined silhouettes.',
    image: 'https://images.unsplash.com/photo-1767277680127-dc94441d576c?auto=format&fit=crop&w=1200&q=80',
  },
];

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeImage(image: unknown, name: string) {
  if (typeof image === 'string' && image.trim()) {
    const trimmed = image.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/')) return `${PUBLIC_ASSET_URL}${trimmed}`;
    return trimmed;
  }

  return `https://source.unsplash.com/featured/900x1200/?${encodeURIComponent(
    `${name} decorative lighting luxury`,
  )}`;
}

function normalizeCategory(category: any): PublicCategory | null {
  if (!category?.name) return null;
  const name = String(category.name).trim();
  if (!name) return null;

  const slug = String(category.slug || toSlug(name)).trim();

  return {
    _id: category._id ? String(category._id) : undefined,
    name,
    slug,
    description:
      typeof category.description === 'string' && category.description.trim()
        ? category.description.trim()
        : `Explore ${name.toLowerCase()} selected for refined decorative lighting projects.`,
    image: normalizeImage(category.image, name),
    emoji: typeof category.emoji === 'string' ? category.emoji : undefined,
    sortOrder: Number.isFinite(Number(category.sortOrder))
      ? Number(category.sortOrder)
      : undefined,
  };
}

export function normalizePublicCategories(payload: any): PublicCategory[] {
  const raw: unknown[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.categories)
        ? payload.categories
        : [];

  const categories: PublicCategory[] = raw
    .map(normalizeCategory)
    .filter((category): category is PublicCategory => Boolean(category));

  return categories.sort((a: PublicCategory, b: PublicCategory) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchPublicCategories(options?: CategoryFetchOptions) {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/categories`, options);
    if (!res.ok) throw new Error('Unable to fetch categories');
    const json = await res.json();
    const categories = normalizePublicCategories(json);
    return categories.length ? categories : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export function categoryHref(category: Pick<PublicCategory, '_id' | 'slug'>) {
  const value = category.slug || category._id || '';
  return value ? `/shop?category=${encodeURIComponent(value)}` : '/shop';
}
