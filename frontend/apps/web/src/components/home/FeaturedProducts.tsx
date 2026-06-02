'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';

type FeaturedProductsProps = {
  products: any[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) {
    return (
      <SectionReveal className="luxury-section featured-products">
        <div className="section-heading">
          <span className="luxury-kicker">Signature Pieces</span>
          <h2>Private collection previews are being prepared.</h2>
          <p>Explore the full catalogue while the featured edit is refreshed.</p>
          <Link href="/shop" className="rl-button rl-button-primary">
            Shop the collection <ArrowRight size={14} />
          </Link>
        </div>
      </SectionReveal>
    );
  }

  return (
    <SectionReveal className="luxury-section featured-products">
      <div className="section-heading section-heading-row">
        <div>
          <span className="luxury-kicker">Signature Pieces</span>
          <h2>Objects of light with collector-level finish.</h2>
        </div>
        <Link href="/shop" className="rl-button rl-button-outline">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <motion.div
        className="featured-product-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
      >
        {products.slice(0, 8).map((product) => (
          <motion.div key={product._id} variants={cardReveal}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
