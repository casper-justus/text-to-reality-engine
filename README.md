# Text to Reality Engine — EduMarket (Fullstack)

A static front-end (Stitch-exported screens + a designed login page) backed by
Cloudflare Pages Functions and a D1 SQLite database.

## Structure
```
public/            Static site (HTML screens + login.html), served at the site root
  index.html       Home
  browse.html      Teacher Directory
  pricing.html     Pricing
  for-schools.html For Schools
  teacher-dashboard.html / messages.html / compare.html / post-hiring-request.html
  admin-review.html / admin-review-kenya.html
  role-selection.html
  login.html       Designed login + register (talks to /api/auth/*)
functions/api/     Pages Functions (the backend)
  _db.js           Shared DB (D1 w/ in-memory fallback) + auth/JWT helpers
  auth/login.js  register.js  me.js  logout.js
  teachers.js  hiring-requests.js
migrations/schema.sql   D1 schema
wrangler.toml          Pages + D1 binding config
scripts/setup.js       One-shot: create D1, migrate, deploy
screens/               Original Stitch exports (reference / assets)
```

## API
- `POST /api/auth/register`  `{name,email,password,role}` → sets session cookie
- `POST /api/auth/login`     `{email,password}` → sets session cookie
- `GET|POST /api/auth/me`    → current user (reads cookie)
- `GET|POST /api/auth/logout`→ clears cookie
- `GET  /api/teachers`       → list of teachers (seeded)
- `POST /api/hiring-requests`→ create a hiring request

Auth uses PBKDF2-hashed passwords and an HMAC-SHA256 signed session cookie
(`em_session`). Without a D1 binding the API falls back to in-memory storage
(useful for local testing).

## Deploy to Cloudflare Pages (one go)
```bash
npm install
npm run setup          # creates D1 db, writes id into wrangler.toml, migrates, deploys
```
`scripts/setup.js` runs `wrangler d1 create`, applies `migrations/schema.sql`
(local + remote), then `wrangler pages deploy public`.

Manual equivalent:
```bash
npx wrangler d1 create edumarket
# put the returned database_id into wrangler.toml
npx wrangler d1 execute edumarket --remote --file=./migrations/schema.sql
npx wrangler pages deploy public --project-name=edumarket
```

Requires a Cloudflare account and `CLOUDFLARE_API_TOKEN` (or `wrangler login`).
