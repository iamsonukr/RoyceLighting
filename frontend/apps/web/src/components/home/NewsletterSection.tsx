'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SectionReveal } from './SectionReveal';

export function NewsletterSection() {
  return (
    <SectionReveal className="newsletter-luxury">
      <div>
        <span className="luxury-kicker">Private Previews</span>
        <h2>Receive the first look at new collections.</h2>
        <p>
          Invitations to limited releases, installation stories, and atelier previews. No noise,
          only the pieces worth studying.
        </p>
      </div>
      <form className="newsletter-luxury-form">
        <Input type="email" placeholder="Email address" aria-label="Email address" />
        <Button type="submit">
          Subscribe <ArrowRight size={14} />
        </Button>
      </form>
    </SectionReveal>
  );
}
