# Balanjo

Campus community site with three features: **Forum**, **Blog**, and **E-Commerce** for student businesses, plus an **admin panel**.

- **Frontend:** React 19 + Vite + Tailwind CSS 4, React Router, TanStack Query (repo root)
- **Backend:** Node.js + Express 5 + Prisma + PostgreSQL on [Neon](https://neon.tech) (`server/`)
- **Hosting:** [Vercel](https://vercel.com) (website + API as serverless functions), images in Vercel Blob

## Requirements

- Node.js **22.9 or newer** (`node --version`)

## First-time setup

You don't need to install a database. Development uses your own copy ("branch") of the Neon database.

1. **Neon:** sign in at [console.neon.tech](https://console.neon.tech) and open the Balanjo project (or create one; pick the **AWS Singapore** region).
   - Go to **Branches → New branch**, name it after yourself (e.g. `dev-budi`), and create it from `main`. Each developer gets their own branch, so nobody overwrites anyone else's data. Never develop on `main`: that's the live site's data.
   - Click **Connect**, choose your branch, and copy two connection strings: the **pooled** one (its host contains `-pooler`) and the **direct** one (turn "Connection pooling" off).
2. From the repo root, run:
   ```bash
   npm run setup
   ```
   The first time, this installs the dependencies, creates `server/.env`, and stops to ask for the database addresses.
3. In `server/.env`, set:
   ```
   DATABASE_URL="<pooled string>&pgbouncer=true&connect_timeout=15"
   DIRECT_URL="<direct string>&connect_timeout=15"
   ```
4. Run `npm run setup` again. It creates the tables and fills your branch with sample data.

Running `npm run setup` again later is safe: it only applies new migrations and never deletes data.

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

> **After pulling new changes**, run `npm run setup` again (or `npm run db:migrate` in `server/`) to apply new migrations. It keeps your existing data.

| Command (run in `server/`) | What it does |
|---|---|
| `npm run db:migrate` | Applies new migrations (safe, keeps data) |
| `npm run db:reset` | **Deletes all data** on the branch in `server/.env`, recreates the tables, and reloads the sample data. Only use it on your own dev branch |
| `npm run db:studio` | Opens Prisma Studio, a browser UI for viewing and editing the data |
| `npm run create-admin -- --email <email> --name "<name>"` | Creates an admin account (or turns an existing account into one), asking for the password in the terminal |

- The schema is in `server/prisma/schema.prisma`. After changing it, run `npx prisma migrate dev --name <change>` to create a migration and commit the new folder in `server/prisma/migrations/`.
- Locally, uploaded images go to `server/uploads/`. On Vercel they go to Vercel Blob. Uploads, local data and `.env` are not committed to Git.
- Neon's free plan pauses the database after a few minutes without traffic, so the first request after a pause takes a moment longer.

## Forgot password

No email service is connected yet. When someone requests a reset, the API prints the reset link in the **API terminal**:

```
[reset password] budi@gmail.com: http://localhost:5173/reset-password?token=...
```

Open that link to set a new password. Each link works once and expires after one hour.

On Vercel, the same line appears in the project's **Logs** tab. Connecting an email service is still on the to-do list.

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
  src/utils/    validation, uploads (Blob or local folder), HTML sanitizing, response shapes
  scripts/      setup, create-admin
api/index.js    Vercel function entry: runs the same Express app for /api/*
vercel.json     Vercel build settings and routing
```

## Security notes

- Passwords are hashed with bcrypt. Logins use an httpOnly, SameSite=Lax cookie, which page scripts cannot read and which is not sent on cross-site form posts.
- Article HTML is sanitized on the server when saved and again with DOMPurify when shown.
- Uploads accept JPG, PNG, WEBP and GIF up to 4 MB (Vercel's request limit is about 4.5 MB). SVG is rejected because it can contain scripts.
- The sample-data seed refuses to run in production, because its accounts have publicly known passwords.
- Login, register and password-reset requests are rate-limited per IP address.
- Order prices are always recalculated on the server from the database.

## Deploying to Vercel

The website and the API deploy together as one Vercel project, on one address, so the login cookie works without extra setup. `vercel.json` already contains the build settings. Every deploy installs both packages, applies new database migrations, and builds the website.

**One-time setup:**

1. **Production database:** in Neon, the `main` branch is production. Copy its pooled and direct connection strings, as in First-time setup.
2. **Create the project:** in Vercel, **Add New → Project** and import `HaleefRayyan/Balanjo` from GitHub. Leave the build settings as detected.
3. **Production branch:** under **Settings → Git**, set the **production branch** to the branch to publish (normally `main`, once the work is merged).
4. **Image storage:** under **Storage → Create → Blob**, connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
5. **Environment variables:** under **Settings → Environment Variables**, add these for **Production**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon `main` pooled string + `&pgbouncer=true&connect_timeout=15` |
   | `DIRECT_URL` | Neon `main` direct string + `&connect_timeout=15` |
   | `JWT_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLIENT_URL` | The site address, e.g. `https://balanjo.vercel.app` (used in password-reset links) |

   For **Preview** deployments (other branches and pull requests), use a separate Neon branch such as `preview`. Preview builds run migrations, so they must never point at `main`.
6. **Deploy** (Deployments → Redeploy, or push to the production branch).
7. **Create the first admin.** The production database starts empty, with no sample data. In PowerShell, from the repo root:
   ```powershell
   $env:DATABASE_URL="<main pooled string>"; $env:DIRECT_URL="<main direct string>"
   npm --prefix server run create-admin -- --email admin@yourdomain.com --name "Admin Balanjo"
   ```
   Then close that terminal, so the production addresses don't stay set.

**Images uploaded before Blob was connected** (for example sample data seeded locally) still point at `server/uploads` on your computer and won't load on Vercel. Copy the Blob store's `BLOB_READ_WRITE_TOKEN` into `server/.env`, then move them:
```bash
npm --prefix server run move-uploads-to-blob -- --dry-run   # preview, changes nothing
npm --prefix server run move-uploads-to-blob                # upload to Blob and update the database
```

After that, every push to the production branch redeploys automatically.

## Other scripts

| Command | What it does |
|---|---|
| `npm run lint` | ESLint for the frontend and backend |
| `npm run build` | Production build of the website |
| `npm run dev:all` | Website + API together for local development |
