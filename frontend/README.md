# Royce Lighting — Unified Frontend

All three panels are now served from a **single Next.js app** on a single domain.

| URL | Panel |
|-----|-------|
| `/` | Public website (home, shop, product, cart, checkout, my-orders) |
| `/admin` | Admin panel (dashboard, products, categories, orders, users, vendors, settings) |
| `/vendor` | Vendor portal (dashboard, products, orders, settings) |

---

## Getting started

```bash
cd apps/web
npm install
cp ../../.env.example .env.local   # fill in values
npm run dev                         # → http://localhost:3000
```

Or from the repo root:

```bash
npm install --workspace=apps/web
npm run dev
```

---

## Project structure

```
apps/web/src/
├── app/
│   ├── layout.tsx               ← Root layout (providers only, no nav/footer)
│   ├── globals.css              ← Combined CSS (web + admin + vendor styles)
│   │
│   ├── (public)/                ← Route group: Navbar + Footer injected
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← / (home)
│   │   ├── shop/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── my-orders/
│   │   └── product/[id]/
│   │
│   ├── (admin)/                 ← Route group: AdminShell injected
│   │   ├── layout.tsx           ← Admin Redux store + React Query
│   │   └── admin/
│   │       ├── page.tsx         ← /admin (dashboard)
│   │       ├── products/
│   │       ├── categories/
│   │       ├── orders/
│   │       ├── users/
│   │       ├── vendors/
│   │       ├── settings/
│   │       └── components/
│   │           ├── auth/AdminLogin.tsx
│   │           ├── layout/AdminShell.tsx
│   │           └── Pagination.tsx
│   │
│   └── (vendor)/                ← Route group: VendorShell injected
│       ├── layout.tsx           ← Vendor Redux store + React Query
│       └── vendor/
│           ├── page.tsx         ← /vendor (dashboard)
│           ├── products/
│           ├── orders/
│           ├── settings/
│           └── components/
│               ├── auth/VendorLogin.tsx
│               └── layout/VendorShell.tsx
│
├── components/
│   ├── Providers.tsx            ← Web store + React Query wrapper
│   ├── auth/
│   ├── home/
│   ├── layout/   (Navbar, Footer, CartDrawer…)
│   ├── products/
│   ├── shop/
│   └── ui/
│
├── lib/
│   ├── api.ts                   ← Public web axios client (nc_token)
│   ├── adminApi.ts              ← Admin axios client (nc_admin_token)
│   └── vendorApi.ts             ← Vendor axios client (nc_vendor_token)
│
└── store/
    ├── store.ts                 ← Web Redux store
    ├── slices/  (auth, cart, ui)
    ├── admin/store.ts           ← Admin Redux store (isolated)
    └── vendor/store.ts          ← Vendor Redux store (isolated)
```

---

## How route isolation works

Next.js **Route Groups** (`(public)`, `(admin)`, `(vendor)`) let each section
have its own layout without affecting the URL. This means:

- `/admin/products` uses the `(admin)/layout.tsx` which mounts the Admin Redux
  store and `AdminShell` — no Navbar or Footer leaks in.
- `/vendor/orders` uses the `(vendor)/layout.tsx` which mounts the Vendor Redux
  store and `VendorShell`.
- `/shop` uses the `(public)/layout.tsx` which adds Navbar, Footer, CartDrawer etc.

Each panel has its own **isolated Redux store** (admin token ≠ vendor token ≠ web token)
and its own **axios instance** with the correct `localStorage` key.

---

## Authentication & redirect behaviour

| Panel | Token key | Unauthenticated redirect |
|-------|-----------|--------------------------|
| Public | `nc_token` | shows AuthModal in-page |
| Admin | `nc_admin_token` | `/admin` (login page) |
| Vendor | `nc_vendor_token` | `/vendor` (login page) |

---

## Deployment (Vercel)

`vercel.json` at the repo root points Vercel at `apps/web`:

```json
{
  "rootDirectory": "apps/web",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

Set `NEXT_PUBLIC_API_URL` in your Vercel environment variables.

---

## Environment variables

Copy `.env.example` to `apps/web/.env.local` and fill in:

```
NEXT_PUBLIC_API_URL=https://api.yourbackend.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

The three separate `NEXT_PUBLIC_*_URL` variables from the old multi-port setup
are no longer needed.
