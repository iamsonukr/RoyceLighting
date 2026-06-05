'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from './home-data';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';

export function Testimonials() {
  return (
    <SectionReveal className="luxury-section testimonials-section section-coffee">
      <div className="section-heading">
        <span className="luxury-kicker">Patron Notes</span>
        <h2>Discreet praise from considered homes.</h2>
      </div>

      <motion.div
        className="testimonial-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {testimonials.map((item) => (
          <motion.figure className="testimonial-card" key={item.author} variants={cardReveal}>
            <div className="testimonial-stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={13} fill="currentColor" />
              ))}
            </div>
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption>
              <strong>{item.author}</strong>
              <span>{item.role}</span>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
