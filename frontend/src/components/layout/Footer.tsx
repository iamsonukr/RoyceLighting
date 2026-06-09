"use client";

import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const COLLECTIONS = [
  { label: 'Grand Chandeliers', href: '/shop?collection=chandeliers' },
  { label: 'Pendant Lights', href: '/shop?collection=pendants' },
  { label: 'Wall Sconces', href: '/shop?collection=sconces' },
  { label: 'Table Lamps', href: '/shop?collection=table-lamps' },
  { label: 'Bespoke Commissions', href: '/bespoke' },
];

const INFO_LINKS = [
  { label: 'About Royce', href: '/about' },
  { label: 'Our Atelier', href: '/atelier' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Refund & Cancellation', href: '/refund-and-cancellation-policy' },
  { label: 'Shipping & Delivery', href: '/shipping-and-delivery-policy' },
];

export function Footer() {
  return (
    <footer style={{ background: 'var(--obsidian)', borderTop: '1px solid rgba(250,247,240,0.06)' }}>
      {/* Top CTA band */}
      <div
        style={{
          borderBottom: '1px solid rgba(250,247,240,0.06)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at center, rgba(0,96,57,0.06) 0%, transparent 70%)',
        }}
      >
        <p className="overline-text" style={{ marginBottom: '1rem' }}>Commission a Piece</p>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ivory)',
            marginBottom: '1.75rem',
          }}
        >
          Illuminate Your{' '}
          <em style={{ color: 'var(--gold-light)' }}>Finest Spaces</em>
        </h3>
        <Link href="/bespoke" className="btn-primary" style={{ fontSize: '0.58rem' }}>
          Begin a Commission
        </Link>
      </div>

      {/* Main footer grid */}
      <div
        className="max-w-7xl mx-auto footer-grid"
        style={{ padding: '4rem 1.5rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}
      >
        {/* Brand col */}
        <div className="footer-brand-col" style={{ gridColumn: 'span 4' }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              fontWeight: 400,
              letterSpacing: '0.18em',
              color: 'var(--ivory)',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>✦</span>
            Royce
            <span style={{ color: 'rgba(250,247,240,0.25)' }}>·</span>
            Lighting
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'rgba(250,247,240,0.9)',
              lineHeight: 1.9,
              fontWeight: 300,
              letterSpacing: '0.04em',
              marginBottom: '2rem',
              maxWidth: '260px',
            }}
          >
            Purveyors of handcrafted luxury lighting since 2012. Each piece an heirloom, crafted in our New Delhi atelier.
          </p>

          {/* Socials */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { Icon: Instagram, href: '#' },
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="btn-icon"
                style={{ width: 36, height: 36 }}
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="footer-links-col" style={{ gridColumn: 'span 3', paddingLeft: '1rem' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Collections
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {COLLECTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(250,247,240,0.9)',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    fontWeight: 300,
                    transition: 'color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.9)')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="footer-links-col" style={{ gridColumn: 'span 2' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Information
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {INFO_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(250, 247, 240, 0.91)',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    fontWeight: 300,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.9)')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-links-col" style={{ gridColumn: 'span 3' }}>
          <h4
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}
          >
            Atelier
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Mail size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300 }}>
                atelier@roycelighting.com
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Phone size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300 }}>
                +91 98765 43210
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={13} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} strokeWidth={1.5} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.9)', letterSpacing: '0.04em', fontWeight: 300, lineHeight: 1.7 }}>
                Mehrauli Road, Qutub Area<br />New Delhi, 110030
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(250,247,240,0.06)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.2)', letterSpacing: '0.1em' }}>
          © 2024 Royce Lighting. All rights reserved.
        </p>
        <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.2)', letterSpacing: '0.1em' }}>
          Handcrafted with devotion in New Delhi, India
        </p>
      </div>
    </footer>
  );
}
