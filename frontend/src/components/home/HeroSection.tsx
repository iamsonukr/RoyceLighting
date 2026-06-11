'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { stats } from './home-data';

export function HeroSection() {
  return (
    <section className="home-hero">
      <motion.div
        className="home-hero-media"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="home-hero-shade" />

      <motion.div
        className="home-hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <span className="luxury-kicker">Royace Lighting Atelier</span>
        <h1>
          Precision light for
          <span> extraordinary interiors.</span>
        </h1>
        <p>
          Handcrafted chandeliers, pendants, and bespoke lighting composed with the restraint,
          craft, and permanence of a fine timepiece.
        </p>
        <div className="home-hero-actions">
          <Link href="/shop" className="rl-button rl-button-primary">
            Explore collections <ArrowRight size={15} />
          </Link>
          <Link href="/contact" className="rl-button rl-button-outline">
            Book a consultation
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="home-stat-bar"
        variants={{
          hidden: { opacity: 0, y: 24 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
        }}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="home-scroll-cue"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>Scroll</span>
        <ChevronDown size={15} />
      </motion.div>
    </section>
  );
}
