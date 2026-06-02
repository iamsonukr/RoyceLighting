'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { storyPillars } from './home-data';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';

export function BrandStory() {
  return (
    <SectionReveal className="luxury-section brand-story">
      <div className="section-heading section-heading-left">
        <span className="luxury-kicker">The House</span>
        <h2>Built like jewellery. Installed like architecture.</h2>
      </div>

      <div className="brand-story-grid">
        <div className="brand-story-copy">
          <p>
            Royce creates lighting for rooms where every surface has been considered. Deep green
            lacquer tones, coffee-brown shadows, and restrained gold details create a shopping
            experience that feels collected, private, and precise.
          </p>
          <motion.div
            className="brand-pillar-list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            {storyPillars.map(({ icon: Icon, title, desc }) => (
              <motion.div className="brand-pillar" key={title} variants={cardReveal}>
                <span><Icon size={18} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <Link href="/about" className="rl-button rl-button-outline">
            Visit the atelier <ArrowRight size={14} />
          </Link>
        </div>

        <motion.div
          className="brand-story-image"
          whileHover={{ scale: 0.985 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="https://images.unsplash.com/photo-1561780648-dc38ba20699b"
            alt="Royce atelier chandelier craft"
            fill
            sizes="(max-width: 768px) 100vw, 44vw"
          />
        </motion.div>
      </div>
    </SectionReveal>
  );
}
