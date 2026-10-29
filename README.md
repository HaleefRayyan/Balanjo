# Balanjo

Campus community site with three features: **Forum**, **Blog**, and **E-Commerce** for student businesses, plus an **admin panel**.

- **Frontend:** React 19 + Vite + Tailwind CSS 4, React Router, TanStack Query (repo root)
- **Backend:** Node.js + Express 5 + Prisma + SQLite (`server/`)

## Requirements

- Node.js **22.9 or newer** (`node --version`)

## First-time setup

From the repo root:

```bash
npm run setup
```

This installs the frontend and backend dependencies, creates `server/.env` with a random `JWT_SECRET`, creates the SQLite database (`server/prisma/dev.db`), and fills it with sample data.

## Running the app

```bash
npm run dev:all
```

This starts both servers:

| | URL |
|---|---|
| Website (Vite) | http://localhost:5173 |
| API (Express) | http://localhost:3000 |

Open **http://localhost:5173**. Vite forwards `/api` and `/uploads` to the API, so you only ever use port 5173.

You can also run them separately with `npm run dev` (website) and `npm run dev:server` (API).

### Sample accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@balanjo.com` | `admin12345` |
| User | `budi@gmail.com` | `password123` |

Every seeded user has the password `password123` (wawan@, maemunah@, munaroh@, anto@, mrc1na@, elizabeth@ `gmail.com`). Logging in as an admin opens the admin panel at `/admin`.

## Your account

- **Profil Saya** (`/profile`, in the user menu): change your name, email and profile photo, change your password, and see **Artikel Saya** and **Diskusi Saya**, where you can edit or delete what you posted.
- Authors (and admins) see **Edit** and **Hapus** on their own articles and discussions. Editing an article keeps its URL (slug).
- Reply authors can delete their own replies, and admins can delete any reply.

## Selling and orders

- Any logged-in user can sell. Open **Toko Saya** (`/seller`) from the user menu to add products, handle incoming orders (status: Menunggu konfirmasi → Diproses → Dikirim → Selesai, or Dibatalkan), and request promo banners. Banners approved by an admin appear in the Get Started slider.
- **Pesanan Saya** (`/orders`) lists your orders. You can cancel an order until a seller starts processing it.
- Each order item has its own status, because one order can contain products from several sellers.
- Products have a **stock** count set by the seller. Ordering reduces it (an order is refused if stock runs out), and cancelling an order puts the stock back. Sold-out products show "Stok habis".

## Database

> **After pulling new changes**, run `npm run setup` again (or `npx prisma migrate deploy` in `server/`) to apply new migrations. It keeps your existing data.

| Command (run in `server/`) | What it does |
|---|---|
| `npm run db:reset` | **Deletes all data**, recreates the tables, and reloads the sample data |
| `npm run db:studio` | Opens Prisma Studio, a browser UI for viewing and editing the data |

- The schema is in `server/prisma/schema.prisma`. After changing it, run `npx prisma migrate dev --name <change>` to create a migration.
- Uploaded images are saved to `server/uploads/`. Uploads, the database and `.env` are not committed to Git.
- To use PostgreSQL or MySQL instead of SQLite, change `provider` in the schema and `DATABASE_URL` in `server/.env`, then create the migrations again.

## Forgot password

No email service is connected yet. When someone requests a reset, the API prints the reset link in the **API terminal**:

```
[reset password] budi@gmail.com: http://localhost:5173/reset-password?token=...
```

Open that link to set a new password. Each link works once and expires after one hour.

## Project structure

```
src/
  api/          React Query hooks for each API resource (products, blogs, forum, banners, admin, auth)
  components/   layout/ (Navbar, Footer, PageBanner), sections/, ui/, admin/
  constants/    category lists (must match server/src/constants.js)
  context/      AuthProvider (login state from /api/auth/me), CartProvider (cart stored in the browser)
  layouts/      MainLayout, AuthLayout, AdminLayout
  pages/        one folder per page; pages/admin/* for the admin panel
  routes/       route table + ProtectedRoute
server/
  prisma/       schema, migrations, seed script
  src/routes/   auth, blogs, forum, products, orders, banners, admin
  src/utils/    validation, uploads, HTML sanitizing, response shapes
```

## Security notes

- Passwords are hashed with bcrypt. Logins use an httpOnly, SameSite=Lax cookie, which page scripts cannot read and which is not sent on cross-site form posts.
- Article HTML is sanitized on the server when saved and again with DOMPurify when shown.
- Uploads accept JPG, PNG, WEBP and GIF up to 5 MB. SVG is rejected because it can contain scripts.
- Login, register and password-reset requests are rate-limited per IP address.
- Order prices are always recalculated on the server from the database.

## Production build

```bash
npm run build                # builds the website into dist/
npm --prefix server start    # the API also serves dist/ when it exists
```

Set `NODE_ENV=production` (this enables secure cookies, which need HTTPS), a strong `JWT_SECRET`, and `CLIENT_URL` (used in reset links) in `server/.env`.

## Other scripts

| Command | What it does |
|---|---|
| `npm run lint` | ESLint for the frontend and backend |
| `npm run build` | Production build of the website |
