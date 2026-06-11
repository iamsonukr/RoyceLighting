# Royace Lighting Frontend

This is the single Next.js app for the public website, admin panel, and vendor portal.

| URL | Area |
| --- | --- |
| `/` | Public website |
| `/admin` | Admin panel |
| `/vendor` | Vendor portal |

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (admin)/
│   │   ├── (vendor)/
│   │   ├── globals.css
│   │   ├── admin.css
│   │   └── vendor.css
│   ├── components/
│   ├── lib/
│   └── store/
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

There is no nested `apps/web` package anymore. Run all frontend commands from `frontend`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run type-check
```

## Environment

Copy `.env.example` to `.env` and set:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
```

The admin and vendor panels are route groups inside the same app, not separate apps.
