import { Metadata } from 'next';
import { BrandStory } from '@/components/home/BrandStory';
import { CollectionShowcase } from '@/components/home/CollectionShowcase';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HeroSection } from '@/components/home/HeroSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { Testimonials } from '@/components/home/Testimonials';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { PUBLIC_API_URL } from '@/lib/publicCategories';

export const metadata: Metadata = {
  title: 'Royace Lighting - Luxury Chandeliers & Handcrafted Lighting',
  description:
    'Bespoke chandeliers and luxury lighting for extraordinary interiors. Crafted by master artisans for discerning homes.',
};

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/products/featured?limit=8`,
      { next: { revalidate: 300 } },
    );
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="home-page">
      <HeroSection />
      <BrandStory />
      <FeaturedCategories />
      <FeaturedProducts products={featured} />
      <CollectionShowcase />
      <WhyChooseUs />
      <Testimonials />
      <NewsletterSection />
    </div>
  );
}
