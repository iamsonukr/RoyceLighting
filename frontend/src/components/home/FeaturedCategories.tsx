'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';

export function FeaturedCategories() {
  const { data: fetchedCategories } = usePublicCategories();
  const categories = useMemo(
    () => (fetchedCategories?.length ? fetchedCategories : FALLBACK_CATEGORIES),
    [fetchedCategories],
  );
  const featuredCategories = useMemo(() => categories.slice(0, 4), [categories]);

  return (
    <SectionReveal className="luxury-section section-coffee">
      <div className="section-heading">
        <span className="luxury-kicker">Curated Categories</span>
        <h2>Choose by room, scale, and atmosphere.</h2>
        <p>Each collection is edited for proportion, finish, and the way light settles into a luxury interior.</p>
      </div>

      <motion.div
        className="category-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {featuredCategories.map((category, index) => (
          <motion.div key={category.slug} variants={cardReveal}>
            <Link href={categoryHref(category)} className="category-card">
              <Image
                src={category.image || FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].image || ''}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="category-card-overlay" />
              <span className="category-index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <span>{category.emoji || 'Collection'}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <strong>Discover <ArrowRight size={13} /></strong>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
