# Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Postgres

You need a Postgres instance reachable at the connection string you put in `DATABASE_URI`. Two options:

### Option A — existing local Postgres (what this project's dev env uses)

If you already have Postgres running locally (e.g. via Homebrew on macOS: `brew services start postgresql@14`), create a role and database:

```bash
createdb -h localhost -p 5432 -U <your-os-username> -O payload ghl_payload_explorer
psql -h localhost -p 5432 -U <your-os-username> -d postgres -c "CREATE ROLE payload WITH LOGIN PASSWORD 'payload';"
```

(If the `payload` role already exists, skip the `CREATE ROLE` step.)

### Option B — Docker

Only use this if nothing else is already listening on port 5432 (check with `lsof -nP -iTCP:5432 -sTCP:LISTEN`). Create a `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: ghl_payload_explorer
    ports:
      - '5432:5432'
    volumes:
      - ghl_payload_explorer_pgdata:/var/lib/postgresql/data
volumes:
  ghl_payload_explorer_pgdata:
```

```bash
docker compose up -d
```

## 3. Environment variables

```bash
cp .env.example .env
```

Generate a `PAYLOAD_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the result into `PAYLOAD_SECRET=` in `.env`. Set `DATABASE_URI` to match whichever Postgres option you used above (the `.env.example` default already matches `payload`/`payload`/`ghl_payload_explorer` on `localhost:5432`).

### Getting GHL_PRIVATE_TOKEN and GHL_LOCATION_ID

Note: GoHighLevel requires a card on file even for its 14-day free trial — there's no truly free tier. If you don't want to add a card yet, you can skip this step; the app runs fine without it (GHL calls fail gracefully — leads get `ghlSyncStatus: "failed"` and `/api/ghl/contacts` returns a 502 with an error message instead of crashing).

Once you have GHL access:

1. Log into GHL and switch to the correct **sub-account** (top-left account switcher) — Location ID is per sub-account.
2. **`GHL_LOCATION_ID`**: Settings → Business Profile (or Company). Also visible in the URL while inside that sub-account: `https://app.gohighlevel.com/v2/location/<LOCATION_ID>/...`
3. **`GHL_PRIVATE_TOKEN`**: Settings → Private Integrations → Create New Integration. Grant Contacts read + write scopes. Copy the token immediately — GHL only shows it once.

## 4. Run

```bash
npm run dev
```

Open `http://localhost:3000/admin`. On first visit, Payload shows a "Create your first user" form instead of a login screen (no users exist yet) — fill in an email and password to create your admin account.

## Manual test checklist

1. Confirm Postgres is reachable: `psql -h localhost -p 5432 -U payload -d ghl_payload_explorer -c '\dt'`
2. `npm run dev`, open `http://localhost:3000/admin` — loads without a 500.
3. Create the first admin user, log in.
4. Confirm **Posts**, **Leads**, **Users** all appear in the sidebar.
5. Open `http://localhost:3000/`, submit the lead form.
6. In `/admin` → Leads, confirm the new row appears. `ghlSyncStatus` is `"failed"` until GHL credentials are set (expected).
7. After adding `GHL_PRIVATE_TOKEN` / `GHL_LOCATION_ID` and restarting `next dev`:
   - Resubmit the form — `ghlSyncStatus` should become `"synced"`.
   - `GET http://localhost:3000/api/ghl/contacts` should return a JSON contact list instead of a 502.
   - Confirm the new contact appears in your GHL sub-account under Contacts.
