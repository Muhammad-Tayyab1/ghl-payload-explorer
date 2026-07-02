# GHL + Payload Explorer — setup plan

- [x] 1. Write package.json, tsconfig.json, next.config.mjs, .gitignore
- [x] 2. Write .env.example and payload.config.ts (Postgres adapter, lexical editor)
- [x] 3. Write src/collections/Posts.ts, Users.ts, and Leads.ts (with GHL afterChange hook)
- [x] 4. Write src/lib/ghl.ts (GHL API v2 client)
- [x] 5. Write Payload Next.js integration routes under src/app/(payload)/
- [x] 6. ~~docker-compose.yml~~ — dropped; using existing local Homebrew Postgres instead (port 5432 was already taken by a native install)
- [x] 7. Install dependencies (next@16.2.10, react@19.2.7, payload@3.85.2 — verified compatible via peerDependencies, no conflicts)
- [x] 8. Create .env from .env.example, generate PAYLOAD_SECRET, document GHL token/location ID steps
- [x] 9. Build src/app/layout.tsx + src/app/page.tsx (lead capture form)
- [x] 10. Build src/app/api/leads/route.ts (Local API create)
- [x] 11. Build src/app/api/ghl/contacts/route.ts (GET listGhlContacts)
- [x] 12. Start Postgres, run next dev, verify /admin loads, create first admin user
- [x] 13. Provide manual test checklist

## Summary

Built ghl-payload-explorer from scratch (no prior scaffold existed on disk) at
~/ghl-payload-explorer: Next.js 16 + Payload 3.85.2 + Postgres, with Posts/Leads/Users
collections, a public lead form, and a GHL v2 API client.

Deviations from the original ask, with reasons:
- Postgres runs via the existing local Homebrew install, not Docker. Docker Compose was
  set up first, but port 5432 was already bound by a native Postgres server, causing the
  app to silently connect to the wrong database (role "payload" does not exist). Removed
  docker-compose.yml after switching.
- Added `src/collections/Users.ts` (auth: true) — not in the original file list, but
  Payload admin requires an auth-enabled collection to create the first admin user
  against; without it /admin loads but "create first user" has nothing to write to.
- Fixed a bug in Leads.ts's afterChange hook: the two `req.payload.update` calls (marking
  ghlSyncStatus synced/failed) were respecting collection access control because a `req`
  was passed without `overrideAccess: true`. Since the Leads collection has no explicit
  `update` access rule, it defaulted to deny for unauthenticated public form submissions,
  the update returned 404, and the whole create got rolled back in the same DB
  transaction. Fixed by passing `overrideAccess: true` alongside `req`.
- GHL credentials (GHL_PRIVATE_TOKEN / GHL_LOCATION_ID) were not obtained — GoHighLevel
  requires a credit card even for its 14-day trial, and the user opted to skip signup for
  now. The app runs correctly without them: /api/ghl/contacts returns 502 with a clear
  error, and lead creation completes with ghlSyncStatus "failed" instead of crashing.

## Manual test checklist

1. `docker`/Postgres: confirm `psql -h localhost -p 5432 -U payload -d ghl_payload_explorer`
   connects (local Homebrew Postgres, not Docker).
2. `npm run dev`, open http://localhost:3000/admin — should load, no 500s.
3. Log in with the admin user you already created.
4. Confirm **Posts**, **Leads**, **Users** all appear in the left sidebar.
5. Open http://localhost:3000/ — submit the form (name/email/phone).
6. Check Payload admin → Leads — new row appears. `ghlSyncStatus` will show **"failed"**
   until GHL credentials are added (expected, not a bug).
7. Once you add `GHL_PRIVATE_TOKEN` / `GHL_LOCATION_ID` to `.env` and restart `next dev`:
   resubmit the form → `ghlSyncStatus` should flip to **"synced"**.
   Hit http://localhost:3000/api/ghl/contacts directly — should return JSON contact list
   instead of a 502.
   Confirm the contact appears in your GHL sub-account under Contacts.
