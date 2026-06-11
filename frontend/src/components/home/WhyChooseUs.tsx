'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { reasons } from './home-data';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';

export function WhyChooseUs() {
  return (
    <SectionReveal className="luxury-section why-choose">
      <div className="section-heading">
        <span className="luxury-kicker">Why Royace</span>
        <h2>A quieter, more exacting way to buy luxury lighting.</h2>
      </div>

      <motion.div
        className="reason-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {reasons.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={cardReveal}>
            <Card className="reason-card">
              <CardContent>
                <span><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
