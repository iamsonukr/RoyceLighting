import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Star, Zap, Shield, Truck } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';

export const metadata: Metadata = {
  title: 'Royce Lighting — Luxury Chandeliers & Handcrafted Lighting',
  description:
    'Bespoke chandeliers and luxury lighting for extraordinary interiors. Crafted by master artisans for discerning homes.',
};

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/featured?limit=8`,
      { next: { revalidate: 300 } },
    );
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

const COLLECTIONS = [
  {
    name: 'Grand Chandeliers',
    desc: 'Statement pieces for ballrooms & grand halls',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    slug: 'chandeliers',
    count: '42 pieces',
  },
  {
    name: 'Pendant Lights',
    desc: 'Refined pendants for intimate dining spaces',
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&q=80',
    slug: 'pendants',
    count: '38 pieces',
  },
  {
    name: 'Wall Sconces',
    desc: 'Sculpted light for hallways & bedrooms',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80',
    slug: 'sconces',
    count: '29 pieces',
  },
  {
    name: 'Table Lamps',
    desc: 'Artisan table lamps of enduring elegance',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    slug: 'table-lamps',
    count: '24 pieces',
  },
];

const BRAND_PILLARS = [
  {
    num: '01',
    title: 'Master Craftsmanship',
    desc: 'Each fixture is hand-assembled by artisans with decades of expertise in luxury metalwork and crystal finishing.',
    icon: Shield,
  },
  {
    num: '02',
    title: 'Bespoke Commissions',
    desc: 'Our ateliers create fully custom pieces tailored to your architectural vision, from scale to material palette.',
    icon: Star,
  },
  {
    num: '03',
    title: 'White-Glove Delivery',
    desc: 'Professional installation teams ensure perfect placement, with complimentary in-home consultation included.',
    icon: Truck,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The chandelier Royce created for our foyer has become the defining feature of our home. Guests are speechless every time they enter.',
    author: 'Priya Mehta',
    role: 'Art Collector, Mumbai',
    rating: 5,
  },
  {
    quote:
      'Unparalleled attention to detail. Every crystal placed with intention. Truly a work of heirloom art that will outlast generations.',
    author: 'Rahul Singhania',
    role: 'Interior Designer, Delhi',
    rating: 5,
  },
  {
    quote:
      'Three years on, the Royce piece still draws more compliments than anything else in our penthouse. Timeless.',
    author: 'Ananya Tata',
    role: 'Architect, Bangalore',
    rating: 5,
  },
];

const STATS = [
  { value: '12+', label: 'Years of Excellence' },
  { value: '840+', label: 'Bespoke Pieces' },
  { value: '340+', label: 'Happy Patrons' },
  { value: '18', label: 'Indian States Served' },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'var(--obsidian)',
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1595514535116-8b4d5a69ee78?w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.22,
          }}
        />
        {/* Cinematic gradient overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center top, rgba(0,96,57,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(8,6,4,0.9) 100%)',
          }}
        />
        {/* Bottom fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to bottom, transparent, var(--obsidian))',
          }}
        />

        {/* Ambient light orbs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(0,96,57,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '0 1.5rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2.5rem',
              padding: '0.4rem 1.25rem',
              border: '1px solid rgba(0,96,57,0.25)',
              background: 'rgba(0,96,57,0.06)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'block' }} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.58rem',
                fontWeight: 400,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              Est. 2012 · New Delhi Atelier
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              color: 'var(--ivory)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
              animation: 'fadeUp 1s ease 0.2s both',
            }}
          >
            Light as
          </h1>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              color: 'var(--gold-light)',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: '2rem',
              animation: 'fadeUp 1s ease 0.35s both',
            }}
          >
            Living Art
          </h1>

          <div
            style={{
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              margin: '0 auto 2rem',
              animation: 'fadeIn 1s ease 0.5s both',
            }}
          />

          <p
            style={{
              color: 'rgba(250,247,240,0.55)',
              maxWidth: '480px',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              fontWeight: 300,
              lineHeight: 1.9,
              margin: '0 auto 3rem',
              animation: 'fadeUp 1s ease 0.55s both',
            }}
          >
            Royce crafts bespoke chandeliers and luxury fixtures for interiors of extraordinary distinction.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeUp 1s ease 0.7s both',
            }}
          >
            <Link href="/shop" className="btn-primary">
              Explore Collections <ArrowRight size={14} />
            </Link>
            <Link href="/bespoke" className="btn-outline">
              Commission a Piece
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(0,96,57,0.5)',
            animation: 'fadeIn 1.5s ease 1.2s both',
          }}
        >
          <span style={{ fontSize: '0.52rem', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={14} style={{ animation: 'fadeUp 1.5s ease infinite alternate' }} />
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div
        style={{
          padding: '0.9rem 0',
          overflow: 'hidden',
          background: 'var(--gold)',
          color: 'var(--obsidian)',
        }}
      >
        <div className="animate-marquee" style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap' }}>
          {Array(3).fill([
            'Handcrafted Luxury',
            'Bespoke Commissions',
            'White-Glove Installation',
            'Since 2012',
            'New Delhi Atelier',
            'Heirloom Quality',
            'Master Craftsmen',
            'Custom Lighting Solutions',
          ]).flat().map((text, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              ✦ {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAND ── */}
      <div style={{ background: 'var(--charcoal-2)', borderBottom: '1px solid rgba(250,247,240,0.06)' }}>
        <div
          className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4"
          style={{
            padding: '3.5rem 1.5rem',
            gap: '1px',
            background: 'rgba(250,247,240,0.05)',
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--charcoal-2)',
                padding: '2rem 1rem',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 300,
                  color: 'var(--gold)',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.6rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,240,0.35)',
                  fontWeight: 400,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS GRID ── */}
      <section style={{ padding: '8rem 1.5rem', background: 'var(--charcoal)' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p className="overline-text" style={{ marginBottom: '1.25rem' }}>Curated for You</p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--ivory)',
                marginBottom: '1.5rem',
              }}
            >
              Our Collections
            </h2>
            <span className="gold-line" />
          </div>

          <div
            style={{
              gap: '1px',
              background: 'rgba(250,247,240,0.05)',
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {COLLECTIONS.map((col, i) => (
              <Link
                key={col.slug}
                href={`/shop?collection=${col.slug}`}
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  overflow: 'hidden',
                  display: 'block',
                  textDecoration: 'none',
                  background: 'var(--charcoal-3)',
                }}
                className="group img-zoom spotlight"
              >
                <img
                  src={col.image}
                  alt={col.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
                    filter: 'brightness(0.65)',
                  }}
                />
                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.3) 50%, transparent 100%)',
                  }}
                />

                {/* Number accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '0.65rem',
                    color: 'rgba(0,96,57,0.5)',
                    fontWeight: 300,
                    letterSpacing: '0.1em',
                  }}
                >
                  0{i + 1}
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.75rem' }}>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.55rem',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {col.count}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.3rem',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: 'var(--ivory)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {col.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.68rem',
                      color: 'rgba(250,247,240,0.5)',
                      letterSpacing: '0.05em',
                      marginBottom: '1.25rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {col.desc}
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.58rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-light)',
                      fontWeight: 400,
                      transition: 'gap 0.3s ease',
                    }}
                  >
                    Discover <ArrowRight size={12} />
                  </span>
                </div>

                {/* Hover gold border */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: '1px solid rgba(0,96,57,0)',
                    transition: 'border-color 0.4s ease',
                    pointerEvents: 'none',
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND PHILOSOPHY ── */}
      <section style={{ padding: '8rem 1.5rem', background: 'var(--charcoal-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              gap: '6rem',
              alignItems: 'center',
            }}
            className="home-philosophy-grid grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Image */}
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=900&q=80"
                alt="Royce atelier"
                style={{
                  width: '100%',
                  aspectRatio: '4/5',
                  objectFit: 'cover',
                  filter: 'brightness(0.85) contrast(1.05)',
                  display: 'block',
                }}
              />
              {/* Gold frame offset */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  right: '-16px',
                  width: '100%',
                  height: '100%',
                  border: '1px solid rgba(0,96,57,0.25)',
                  pointerEvents: 'none',
                }}
              />
              {/* Floating badge */}
              <div
                className="atelier-badge"
                style={{
                  position: 'absolute',
                  top: '2rem',
                  right: '-2rem',
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2rem',
                    fontWeight: 300,
                    color: 'var(--obsidian)',
                    lineHeight: 1,
                  }}
                >
                  12+
                </span>
                <span
                  style={{
                    fontSize: '0.52rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--obsidian)',
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Years
                </span>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="overline-text" style={{ marginBottom: '1.25rem' }}>Our Philosophy</p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--ivory)',
                  lineHeight: 1.1,
                  marginBottom: '2rem',
                }}
              >
                Where Light
                <br />
                <span style={{ color: 'var(--gold-light)' }}>Becomes Legend</span>
              </h2>
              <span className="gold-line-left" style={{ marginBottom: '2rem', display: 'block' }} />
              <p
                style={{
                  color: 'rgba(250,247,240,0.5)',
                  lineHeight: 2,
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                  marginBottom: '3rem',
                  fontWeight: 300,
                }}
              >
                For over a decade, Royce Lighting has been the atelier of choice for India's most distinguished homes, hotels, and palaces. We believe a chandelier is not merely a light source — it is the centrepiece of memory, the anchor of atmosphere.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '3rem' }}>
                {BRAND_PILLARS.map((pillar) => (
                  <div key={pillar.num} style={{ display: 'flex', gap: '1.5rem' }}>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.9rem',
                        color: 'var(--gold)',
                        fontWeight: 300,
                        flexShrink: 0,
                        paddingTop: '0.1rem',
                      }}
                    >
                      {pillar.num}
                    </span>
                    <div>
                      <h4
                        style={{
                          color: 'var(--ivory)',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          marginBottom: '0.5rem',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {pillar.title}
                      </h4>
                      <p
                        style={{
                          color: 'rgba(250,247,240,0.45)',
                          fontSize: '0.78rem',
                          lineHeight: 1.85,
                          fontWeight: 300,
                        }}
                      >
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="btn-outline" style={{ fontSize: '0.58rem' }}>
                Our Story <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section style={{ padding: '8rem 1.5rem', background: 'var(--charcoal)' }}>
          <div className="max-w-7xl mx-auto">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '4rem',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <p className="overline-text" style={{ marginBottom: '1rem' }}>Highly Sought</p>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: 'var(--ivory)',
                  }}
                >
                  Signature Pieces
                </h2>
              </div>
              <Link
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.6rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'gap 0.2s ease',
                }}
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div
              style={{
                gap: '1px',
                background: 'rgba(250,247,240,0.04)',
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {featured.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FULL-BLEED BESPOKE BANNER ── */}
      <section style={{ position: 'relative', height: '70vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1572127520396-85b2571e00db?w=1800&q=80"
          alt="Luxury interior with Royce chandelier"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(0,96,57,0.08) 0%, rgba(8,6,4,0.5) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1.5rem',
          }}
        >
          <p className="overline-text" style={{ color: 'var(--gold-light)', marginBottom: '1.5rem' }}>
            Bespoke Commissions
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--ivory)',
              lineHeight: 1.05,
              maxWidth: '700px',
              marginBottom: '2.5rem',
            }}
          >
            Crafted for Your
            <br />
            <span style={{ color: 'var(--gold-light)' }}>Vision Alone</span>
          </h2>
          <Link href="/contact" className="btn-primary" style={{ fontSize: '0.6rem' }}>
            Begin a Commission <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '8rem 1.5rem', background: 'var(--charcoal-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p className="overline-text" style={{ marginBottom: '1.25rem' }}>From Our Patrons</p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--ivory)',
                marginBottom: '1.5rem',
              }}
            >
              Words of Distinction
            </h2>
            <span className="gold-line" />
          </div>

          <div
            style={{
              gap: '1px',
              background: 'rgba(250,247,240,0.05)',
            }}
            className="grid grid-cols-1 md:grid-cols-3"
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '3rem 2.5rem',
                  background: 'var(--charcoal-2)',
                  position: 'relative',
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={12} style={{ fill: 'var(--gold)', color: 'var(--gold)' }} />
                  ))}
                </div>

                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.05rem',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.85,
                    color: 'rgba(250,247,240,0.75)',
                    marginBottom: '2.5rem',
                  }}
                >
                  "{t.quote}"
                </p>

                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: 'var(--gold)',
                    marginBottom: '1.25rem',
                  }}
                />

                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--ivory)',
                    marginBottom: '0.3rem',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t.author}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.08em' }}>
                  {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section
        style={{
          padding: '7rem 1.5rem',
          background: 'var(--obsidian)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(0,96,57,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="max-w-lg mx-auto" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="overline-text" style={{ marginBottom: '1.25rem' }}>Private Previews</p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--ivory)',
              marginBottom: '1.25rem',
            }}
          >
            Join the Inner Circle
          </h2>
          <p
            style={{
              color: 'rgba(250,247,240,0.4)',
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
              lineHeight: 1.9,
              marginBottom: '2.5rem',
              fontWeight: 300,
            }}
          >
            Be the first to view new collections, exclusive limited editions, and invitations to our Delhi showroom events.
          </p>
          <div className="newsletter-form" style={{ display: 'flex', gap: '0' }}>
            <input
              type="email"
              placeholder="Your email address"
              className="input-luxury"
              style={{ flex: 1, borderRight: 'none' }}
            />
            <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.875rem 1.75rem', fontSize: '0.58rem' }}>
              Subscribe
            </button>
          </div>
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.58rem',
              color: 'rgba(250,247,240,0.2)',
              letterSpacing: '0.1em',
            }}
          >
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
