# GHL + Payload Explorer

A test project exploring [Payload CMS](https://payloadcms.com) + [GoHighLevel](https://www.gohighlevel.com) (GHL) integration on [Next.js](https://nextjs.org).

Submitting the public lead form creates a `Leads` document via Payload's Local API, which triggers an `afterChange` hook that pushes the contact into a GHL sub-account via the GHL API v2.

## Stack

- Next.js 16.2.10 (App Router)
- Payload 3.85.2, Postgres adapter, Lexical rich text editor
- React 19.2.7

## Collections

- **Users** — auth-enabled, used to log into `/admin`
- **Posts** — basic CMS content
- **Leads** — `name`, `email`, `phone`, `ghlSyncStatus` (`pending` / `synced` / `failed`). An `afterChange` hook upserts the lead into GHL as a contact on create.

## Routes

- `/` — public lead capture form
- `/admin` — Payload admin panel
- `POST /api/leads` — creates a Leads document via the Payload Local API
- `GET /api/ghl/contacts` — calls `listGhlContacts()` directly, useful for confirming the GHL connection independent of the form

## Quick start

See [SETUP.md](./SETUP.md) for the full walkthrough (Postgres, `.env`, GHL credentials).

```bash
npm install
cp .env.example .env   # then fill in PAYLOAD_SECRET, DATABASE_URI, GHL_PRIVATE_TOKEN, GHL_LOCATION_ID
npm run dev
```

Then open `http://localhost:3000` for the public form and `http://localhost:3000/admin` for the admin panel.

## Environment variables

| Variable | Description |
|---|---|
| `PAYLOAD_SECRET` | Random secret used by Payload for encryption/signing |
| `DATABASE_URI` | Postgres connection string |
| `GHL_PRIVATE_TOKEN` | GHL Private Integration Token (Settings → Private Integrations in your sub-account) |
| `GHL_LOCATION_ID` | GHL sub-account Location ID (Settings → Business Profile, or in the sub-account URL) |
| `GHL_CLIENT_ID` / `GHL_CLIENT_SECRET` / `GHL_REDIRECT_URI` | Only needed if moving from the Private Integration Token to a full OAuth app |

`src/lib/ghl.ts` uses the Private Integration Token (Bearer auth) against GHL API v2 (`https://services.leadconnectorhq.com`).
