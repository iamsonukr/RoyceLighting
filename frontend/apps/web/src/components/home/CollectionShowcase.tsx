'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { showcaseItems } from './home-data';
import { SectionReveal } from './SectionReveal';

export function CollectionShowcase() {
  return (
    <SectionReveal className="collection-showcase">
      <div className="showcase-copy">
        <span className="luxury-kicker">Rolex-Inspired Restraint</span>
        <h2>Dark lacquer, warm metal, and disciplined proportion.</h2>
        <p>
          The redesigned palette uses deep coffee browns and forest greens as the stage, with
          gold used only as a precise accent. The result is premium without becoming loud.
        </p>
        <Link href="/bespoke" className="rl-button rl-button-primary">
          Commission a piece <ArrowRight size={14} />
        </Link>
      </div>

      <div className="showcase-grid">
        {showcaseItems.map((item) => (
          <motion.article
            key={item.label}
            className="showcase-card"
            whileHover={{ y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={item.image} alt={item.label} fill sizes="(max-width: 768px) 100vw, 30vw" />
            <div>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionReveal>
  );
}
