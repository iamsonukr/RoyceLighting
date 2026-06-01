import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    slug: 'chandeliers',
  },
  {
    name: 'Pendant Lights',
    desc: 'Refined pendants for intimate dining spaces',
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&q=80',
    slug: 'pendants',
  },
  {
    name: 'Wall Sconces',
    desc: 'Sculpted light for hallways & bedrooms',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80',
    slug: 'sconces',
  },
  {
    name: 'Table Lamps',
    desc: 'Artisan table lamps of enduring elegance',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    slug: 'table-lamps',
  },
];

const FEATURES = [
  {
    num: '01',
    title: 'Master Craftsmanship',
    desc: 'Each fixture is hand-assembled by artisans with decades of expertise in luxury metalwork and crystal finishing.',
  },
  {
    num: '02',
    title: 'Bespoke Commissions',
    desc: 'Our ateliers create fully custom pieces tailored to your architectural vision, from scale to material palette.',
  },
  {
    num: '03',
    title: 'White-Glove Delivery',
    desc: 'Professional installation teams ensure perfect placement, with complimentary in-home consultation included.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The chandelier Royce created for our foyer has become the defining feature of our home. Guests are speechless.',
    author: 'Priya Mehta',
    role: 'Collector, Mumbai',
  },
  {
    quote:
      'Unparalleled attention to detail. Every crystal placed with intention. Truly a work of heirloom art.',
    author: 'Rahul Singhania',
    role: 'Interior Designer, Delhi',
  },
  {
    quote:
      'Three years on, the Royce piece still draws more compliments than anything else in our penthouse.',
    author: 'Ananya Tata',
    role: 'Architect, Bangalore',
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div style={{ fontFamily: "'Jost', sans-serif" }}>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden"
        style={{ background: 'var(--charcoal)' }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1595514535116-8b4d5a69ee78?w=1800&q=80')",
            opacity: 0.3,
          }}
        />
        {/* Vignette gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(14,11,7,0.85) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <p className="overlinee mb-8" style={{ color: 'var(--gold)' }}>
            Est. 2012 · New Delhi, India
          </p>

          <h1
            className="display-title text-white mb-8"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
          >
            Light as
            <br />
            <em style={{ color: 'var(--gold-light)' }}>Living Art</em>
          </h1>

          <span className="gold-divider mb-8" />

          <p
            className="text-center mx-auto mt-6 mb-12 leading-relaxed"
            style={{
              color: 'rgba(250,247,240,0.7)',
              maxWidth: '520px',
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
              fontWeight: 300,
            }}
          >
            Royce Lighting crafts bespoke chandeliers and luxury fixtures for
            interiors of extraordinary distinction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collections" className="btn-primary">
              Explore Collections <ArrowRight size={14} />
            </Link>
            <Link href="/bespoke" className="btn-ghost-light">
              Commission a Piece
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: 'var(--gold)', opacity: 0.6 }}
        >
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── Ticker strip ── */}
      <div
        className="py-4 overflow-hidden"
        style={{ background: 'var(--gold)', color: 'var(--obsidian)' }}
      >
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[
            'Handcrafted Luxury',
            'Bespoke Commissions',
            'White-Glove Installation',
            'Since 2012',
            'New Delhi Atelier',
            'Heirloom Quality',
            'Handcrafted Luxury',
            'Bespoke Commissions',
            'White-Glove Installation',
            'Since 2012',
          ].map((text, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              ✦ {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Collections Grid ── */}
      <section className="py-28 px-6" style={{ background: 'var(--ivory)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="overlinee mb-4">Curated for You</p>
            <h2 className="section-title mb-4">Our Collections</h2>
            <span className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'var(--parchment)' }}>
            {COLLECTIONS.map((col) => (
              <Link
                key={col.slug}
                href={`/shop?collection=${col.slug}`}
                className="group relative overflow-hidden"
                style={{ background: 'var(--ivory)', aspectRatio: '3/4' }}
              >
                <img
                  src={col.image}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(14,11,7,0.85) 0%, rgba(14,11,7,0.2) 50%, transparent 100%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: 'var(--ivory)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {col.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'rgba(250,247,240,0.65)',
                      letterSpacing: '0.06em',
                      marginBottom: '1rem',
                    }}
                  >
                    {col.desc}
                  </p>
                  <span
                    className="flex items-center gap-2 transition-all duration-300 group-hover:gap-3"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-light)',
                      fontWeight: 500,
                    }}
                  >
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Royce ── */}
      <section className="py-28 px-6" style={{ background: 'var(--charcoal)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=900&q=80"
                alt="Royce atelier"
                className="w-full object-cover"
                style={{ aspectRatio: '4/5', filter: 'brightness(0.9) contrast(1.05)' }}
              />
              {/* Gold frame accent */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full pointer-events-none"
                style={{
                  border: '1px solid rgba(201,168,76,0.35)',
                  transform: 'translate(12px, 12px)',
                }}
              />
              {/* Stat badge */}
              <div
                className="absolute top-8 -right-8 hidden lg:flex flex-col items-center justify-center"
                style={{
                  width: 120,
                  height: 120,
                  background: 'var(--gold)',
                  borderRadius: '50%',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '2.2rem',
                    fontWeight: 300,
                    color: 'var(--obsidian)',
                    lineHeight: 1,
                  }}
                >
                  12+
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--obsidian)',
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  Years
                </span>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="overlinee mb-5">Our Philosophy</p>
              <h2
                className="display-title text-white mb-8"
                style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)' }}
              >
                Where Light
                <br />
                <em style={{ color: 'var(--gold-light)' }}>Becomes Legend</em>
              </h2>
              <div
                style={{
                  width: 48,
                  height: 1,
                  background: 'var(--gold)',
                  marginBottom: '2rem',
                }}
              />
              <p
                style={{
                  color: 'rgba(250,247,240,0.65)',
                  lineHeight: 1.9,
                  fontSize: '0.88rem',
                  letterSpacing: '0.04em',
                  marginBottom: '2.5rem',
                  fontWeight: 300,
                }}
              >
                For over a decade, Royce Lighting has been the atelier of choice for India's most
                distinguished homes, hotels, and palaces. We believe a chandelier is not merely a
                light source — it is the centrepiece of memory, the anchor of atmosphere.
              </p>

              <div className="space-y-8">
                {FEATURES.map((f) => (
                  <div key={f.num} className="flex gap-6">
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                        color: 'var(--gold)',
                        fontWeight: 400,
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    >
                      {f.num}
                    </span>
                    <div>
                      <h4
                        style={{
                          color: 'var(--ivory)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {f.title}
                      </h4>
                      <p
                        style={{
                          color: 'rgba(250,247,240,0.55)',
                          fontSize: '0.82rem',
                          lineHeight: 1.8,
                          fontWeight: 300,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/about" className="btn-outline">
                  Our Story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="py-28 px-6" style={{ background: 'var(--cream)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="overlinee mb-3">Highly Sought</p>
                <h2 className="section-title">Signature Pieces</h2>
              </div>
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-2"
                style={{
                  color: 'var(--gold-deep)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Showcase full-bleed image ── */}
      <section className="relative" style={{ height: '70vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1572127520396-85b2571e00db?w=1800&q=80"
          alt="Luxury interior with Royce chandelier"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.75)' }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{
            background: 'rgba(14,11,7,0.35)',
          }}
        >
          <p className="overlinee mb-5" style={{ color: 'var(--gold-light)' }}>
            Bespoke Commissions
          </p>
          <h2
            className="display-title text-white mb-8"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', maxWidth: 700 }}
          >
            Crafted for Your
            <em style={{ color: 'var(--gold-light)' }}> Vision Alone</em>
          </h2>
          <Link href="/contact" className="btn-primary">
            Begin a Commission <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 px-6" style={{ background: 'var(--ivory)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="overlinee mb-4">From Our Patrons</p>
            <h2 className="section-title">Words of Distinction</h2>
            <span className="gold-divider mt-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="p-10"
                style={{
                  border: '1px solid var(--parchment)',
                  background: 'var(--cream)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.2rem',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: 'var(--slate)',
                    marginBottom: '2rem',
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
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--obsidian)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t.author}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--smoke)', letterSpacing: '0.06em' }}>
                  {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-24 px-6" style={{ background: 'var(--obsidian)' }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="overlinee mb-4" style={{ color: 'var(--gold)' }}>
            Private Previews
          </p>
          <h2
            className="display-title text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Join the Inner Circle
          </h2>
          <p
            style={{
              color: 'rgba(250,247,240,0.5)',
              fontSize: '0.82rem',
              letterSpacing: '0.06em',
              lineHeight: 1.9,
              marginBottom: '2.5rem',
              fontWeight: 300,
            }}
          >
            Be the first to view new collections, exclusive limited editions, and invitations to
            our Delhi showroom events.
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="input-luxury flex-1"
              style={{ borderRight: 'none' }}
            />
            <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}