# Royce Lighting — Full Stack E-Commerce

A production-grade handcrafted jewellery & accessories platform built as a **Turborepo monorepo**.

## Tech Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo |
| Backend | NestJS + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (shared across all panels) |
| File Upload | Multer → local disk (`/uploads`) |
| Payment | Razorpay |
| Delivery | Delhivery API |
| Email | Resend |
| Website | Next.js 14 (App Router) + SSR/SSG |
| Admin Panel | Next.js 14 (App Router) |
| Vendor Panel | Next.js 14 (App Router) |
| State | Redux Toolkit + TanStack Query |
| Styling | Tailwind CSS + shadcn/ui |

---

## Project Structure

```
nasreen-crafts/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   ├── web/          # Customer website (port 3332)
│   ├── admin/        # Admin panel (port 3002)
│   └── vendor/       # Vendor panel (port 3003)
├── packages/         # Shared packages (extend as needed)
├── turbo.json
└── package.json
```

---

## Setup & Installation

### 1. Prerequisites

- Node.js >= 18
- MongoDB running locally or MongoDB Atlas URI
- npm >= 10

### 2. Clone & Install

```bash
git clone <your-repo-url> nasreen-crafts
cd nasreen-crafts
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` in each app:

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
cp .env.example apps/vendor/.env.local
```

Fill in all required values (MongoDB URI, Razorpay keys, Resend API key, Delhivery key).

### 4. Create First Admin User

After starting the API, run this in MongoDB shell or Compass:

```js
// Insert directly (password = "admin123" bcrypt hash)
db.users.insertOne({
  name: "Admin",
  email: "admin@Royce Lighting.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the API once started — register a user then manually set `role: "admin"` in DB.

---

## Running the Project

### All apps at once

```bash
npm run dev
```

### Individual apps

```bash
npm run dev:api      # NestJS API  → http://localhost:3001
npm run dev:web      # Website     → http://localhost:3332
npm run dev:admin    # Admin Panel → http://localhost:3002
npm run dev:vendor   # Vendor Panel→ http://localhost:3003
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/vendor/register` | Public |
| GET  | `/api/auth/profile` | Auth |
| PATCH | `/api/auth/change-password` | Auth |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/featured` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/admin/all` | Admin |
| POST | `/api/products` | Admin/Vendor |
| PUT | `/api/products/:id` | Admin/Vendor (own) |
| DELETE | `/api/products/:id` | Admin/Vendor (own) |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders/create-razorpay-order` | Auth |
| POST | `/api/orders/place` | Auth |
| GET | `/api/orders/my-orders` | Auth |
| GET | `/api/orders/:id` | Auth |
| GET | `/api/orders/:id/track` | Auth |
| GET | `/api/orders/admin/all` | Admin |
| GET | `/api/orders/admin/stats` | Admin |
| PATCH | `/api/orders/admin/:id/status` | Admin |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cart` | Auth |
| POST | `/api/cart/add` | Auth |
| PUT | `/api/cart/update` | Auth |
| DELETE | `/api/cart/remove` | Auth |
| DELETE | `/api/cart/clear` | Auth |

### Vendor
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/vendor/dashboard` | Vendor |
| GET | `/api/vendor/orders` | Vendor |

---

## Delhivery Integration

Shipments are **automatically created** when an order's status is changed to **"Confirmed"** by admin.

What happens:
1. Admin changes order status → `Confirmed`
2. Backend calls `DeliveryService.createShipment()`
3. Delhivery returns AWB (waybill) number
4. AWB & tracking URL saved to order
5. Customer receives shipped email with tracking link when status → `Shipped`

**Sandbox testing:** Set `DELHIVERY_BASE_URL=https://staging-express.delhivery.com` in `.env`

---

## Email Triggers (Resend)

| Event | Recipients |
|-------|-----------|
| Order Placed | Customer + Admin |
| Order Shipped | Customer (with Delhivery tracking link) |
| Order Delivered | Customer |

---

## Razorpay Payment Flow

1. Frontend calls `POST /api/orders/create-razorpay-order` → gets `orderId`
2. Razorpay checkout opens (UPI/Card/NetBanking)
3. On payment success → `POST /api/orders/place` with Razorpay signature
4. Backend verifies HMAC signature → creates order → clears cart → sends emails

---

## Roles & Access

| Role | Panels | Capabilities |
|------|--------|-------------|
| `user` | Website | Browse, cart, checkout, track orders |
| `vendor` | Vendor Panel + Website | All user + manage own products, view own orders/earnings |
| `admin` | Admin Panel | Full access — all users, all orders, all products, status updates |

---

## Production Deployment

### API (NestJS)
```bash
cd apps/api
npm run build
node dist/main.js
```
Use PM2: `pm2 start dist/main.js --name nasreen-api`

### Next.js Apps
```bash
# In root
npm run build
# Then in each app
npm run start
```

**Recommended:** Deploy to Vercel (web/admin/vendor) + Railway/Render (API) + MongoDB Atlas

---

## Key Files

- `apps/api/src/orders/orders.service.ts` — Order placement, Delhivery trigger, email hooks
- `apps/api/src/delivery/delivery.service.ts` — Full Delhivery API integration
- `apps/api/src/email/email.service.ts` — All email templates (Resend)
- `apps/api/src/auth/guards/auth.guard.ts` — JWT, Admin, Vendor guards
- `apps/web/src/app/checkout/page.tsx` — Razorpay checkout flow
- `apps/web/src/store/` — Redux slices (auth, cart, ui)
