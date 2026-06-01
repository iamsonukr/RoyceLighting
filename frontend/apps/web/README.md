# ✦ Royce Lighting — Premium Redesign

A complete luxury brand redesign of the eCommerce lighting website. Inspired by Restoration Hardware, Flos, and premium interior decor aesthetics.

---

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--gold` | `#C9A84C` | Primary accent, CTAs, highlights |
| `--gold-light` | `#E8C97A` | Hero text, hover states |
| `--gold-deep` | `#9A7535` | Gradient endpoints |
| `--obsidian` | `#080604` | Deepest backgrounds |
| `--charcoal` | `#0F0C08` | Page backgrounds |
| `--charcoal-2` | `#16120D` | Card backgrounds, sidebars |
| `--ivory` | `#FAF7F0` | Primary text |

### Typography
- **Display / Headers**: Playfair Display (serif) — italic weight 300–400
- **Body / UI**: DM Sans — weight 300–500
- **Decorative**: Cormorant (serif) — for pull quotes

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── globals.css          ← Full design system (CSS vars, utilities, components)
│   ├── layout.tsx           ← Root layout with Redux + React Query providers
│   ├── page.tsx             ← Homepage (hero, collections, stats, testimonials, newsletter)
│   ├── shop/page.tsx        ← Shop listing page (server component)
│   ├── product/[id]/page.tsx ← Product detail page (server component + related)
│   ├── cart/page.tsx        ← Cart page
│   ├── checkout/page.tsx    ← Multi-step checkout (address → review → payment)
│   └── my-orders/page.tsx   ← Orders history with expandable details
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       ← Sticky glassmorphic navbar + mega menu + search modal
│   │   ├── Footer.tsx       ← Luxury footer with newsletter CTA
│   │   └── CartDrawer.tsx   ← Slide-in cart drawer with free-install progress bar
│   ├── products/
│   │   ├── ProductCard.tsx  ← Hover zoom, secondary image reveal, quick actions
│   │   └── ProductDetailClient.tsx ← Gallery, lightbox, accordions, sticky purchase
│   ├── shop/
│   │   └── ShopClient.tsx   ← Filters sidebar, search, sort, grid, pagination
│   ├── auth/
│   │   └── AuthModal.tsx    ← Login/register modal with luxury styling
│   └── ui/
│       └── Toaster.tsx      ← Animated toast notifications
├── store/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── cartSlice.ts     ← Added clearCart action
│       └── uiSlice.ts       ← Added cartDrawerOpen state
└── lib/
    └── api.ts               ← axios instance + placeOrderAPI + fetchOrdersAPI
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Your existing backend API running on `http://localhost:3001`

### Installation

```bash
cd royce-redesign
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✨ Key Features

### Homepage
- **Full-screen cinematic hero** with radial ambient glow, animated text reveals, dual CTAs
- **Gold marquee ticker** — scrolling brand values
- **Stats band** — animated metrics grid (12+ years, 840+ pieces, etc.)
- **Collections grid** — hover zoom, spotlight effect, numbered editorial layout
- **Brand philosophy section** — split layout with offset gold frame image
- **Featured products** — dynamic server-fetched pieces
- **Bespoke full-bleed banner** — cinematic with overlay gradient
- **Testimonials** — 3-column editorial review cards with star ratings
- **Newsletter section** — radial glow ambient background

### Navigation
- Sticky transparent → frosted glass on scroll
- Mega menu with product category images (animated show/hide)
- Full-screen search modal with category quick-links
- Cart count badge with animated drawer
- User dropdown with order/profile links
- Fully responsive mobile menu

### Product Cards
- Dual image reveal on hover (primary → secondary)
- Scale transform + shadow elevation
- Floating quick-add bar slides up on hover
- Wishlist toggle with heart animation
- Colour swatch previews
- Glassmorphic discount badges

### Product Detail
- 4/5 aspect-ratio main gallery + thumbnail strip
- Lightbox full-screen viewer
- Sticky purchase sidebar on desktop
- Colour finish selector with visual swatches
- Quantity controls
- Animated "Added to Cart" state
- Expandable spec/delivery/returns accordions
- Delivery highlight icons (installation, warranty, returns)
- Related products carousel at bottom

### Cart & Checkout
- Slide-in drawer cart with free-installation progress bar
- Full cart page with quantity controls
- 3-step checkout: Address → Review → Payment
  - Live address validation with inline errors
  - Animated step indicators
  - Order summary sidebar (sticky)
  - SSL badge + payment method selector
- Success state with confetti-like reveal animation
- My Orders with expandable timeline + progress bar

### Design Tokens (CSS)
All design decisions are encoded as CSS custom properties in `globals.css`:
- `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-icon`
- `.card-glass`, `.card-glass-gold`, `.card-dark`
- `.input-luxury` — unified form input style
- `.product-card` — hover elevation + border glow
- `.badge-gold`, `.badge-dark`
- `.overline-text`, `.label-text`, `.display-xl`
- `.skeleton` — shimmer loading state
- `.animate-marquee`, `.animate-fadeUp`, etc.

---

## 🔧 Backend API Compatibility

This redesign is 100% compatible with your existing backend. The following endpoints are consumed:

| Method | Endpoint | Used by |
|---|---|---|
| `GET` | `/products` | Shop listing |
| `GET` | `/products/featured` | Homepage |
| `GET` | `/products/:id` | Product detail |
| `POST` | `/auth/login` | Auth modal |
| `POST` | `/auth/register` | Auth modal |
| `GET` | `/cart` | Cart drawer, cart page |
| `POST` | `/cart/add` | Product card, detail |
| `DELETE` | `/cart/remove` | Cart |
| `POST` | `/orders` | Checkout |
| `GET` | `/orders` | My orders |

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout Change |
|---|---|
| `max-sm` (< 640px) | Single column grids, stacked checkout |
| `max-md` (< 768px) | 2-column shop grid, hidden desktop nav |
| `max-lg` (< 1024px) | 3-column grid, collapsed sidebar |
| `lg+` | Full layout with all features |

---

*Royce Lighting — Purveyors of handcrafted luxury since 2012.*
