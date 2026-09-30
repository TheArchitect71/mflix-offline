# MFlix — local MongoDB movie application

Backend upgraded to Express 5.2.1 and MongoDB driver 7.7.0 with native ESM, bcryptjs 3.0.3, JWT 9.0.3, and Node 26.10.0. Official npm registry releases were checked. MongoDB remains local at port 27018, database `mflix`; remote URIs are rejected. Existing `.env` is preserved and ignored; startup explicitly reads private `.env.local`.

Use Node 26.10.0 and MongoDB Community 9.0.2. From this repository:

```sh
npm ci
npm run setup:local
npm --prefix frontend ci
npm --prefix frontend run build
mkdir -p .local/mongodb
mongod --dbpath .local/mongodb --bind_ip 127.0.0.1 --port 27018 --replSet offline-rs
```

In a second terminal at this repository run `npm run db:init` and `npm start`; open http://127.0.0.1:8002. Skip launching MongoDB if the matching local replica set already runs. Stop foreground processes with Ctrl+C. Setup generates a private signing secret without overwriting existing `.env.local`. Database initialization adds no movie records. Checks: `npm run check`, `npm test`, and `npm audit`.

Validated pagination, text/genre/cast/country/facet searches, details/configuration, signup/login/preferences, authorized comments, admin reports, logout/deletion, and date migration using temporary Mongo fixtures. Test databases are dropped. No movie dataset was found locally: port 27017 had no MFlix database, and port 27018/mflix contained only a setup marker. No persistent demo seed was added.

The original React frontend was replaced with Angular while preserving its features and original course validator source. The previous compiled build and source recovery are preserved in the private local migration archive; this repository serves the Angular frontend.

Legacy course exercise tests under `test/` are preserved as references; they assume remote sample data and obsolete Jest/driver APIs. New tests under `tests/` validate the local application. Date conversion is explicit via `node --env-file=.env.local src/migrations/movie-last-updated-migration.js`; it skips invalid strings and does not run automatically. Original automatic admin creation endpoint is retained for course compatibility; admin setup is still an explicit action, not seeded data. Online services were not contacted.

## Angular frontend

The production frontend now uses Angular 22.2.0 with TypeScript 6.0.3 (held within Angular's >=6.0 <6.1 range), Jasmine 6.3/types 6 (Zone.js 0.16.3 compatibility), and Node 26.10.0. Install/build the frontend before starting the backend:

```sh
npm --prefix frontend ci
npm --prefix frontend run build
npm start
```

Express serves `frontend/dist/mflix/browser`; development `npm --prefix frontend start` proxies `/api` to port 8002. Stop foreground servers with Ctrl+C. Only the Angular frontend is active after building.

Movies, text/genre/cast/facet search, pagination, countries, details, posters with offline fallback, related-search buttons, original Matrix animation, login/signup, account preferences, comment ownership/edit/delete, admin reports, and course status controls are preserved. The original two-video modal remains optional online; offline it displays an unavailable message. No online video or poster service was contacted during validation. Original `state` local-storage account format is retained and revalidated against the local backend. Logout now revokes the session token; login and preference updates issue/store one current token.

All 16 original course validator functions/assertions were recovered and retained. They run against the actual API; failures do not become fabricated passes. Their expected 23,530-movie sample dataset is not present locally. Passed course checks display and copy the original completion codes. Some validators intentionally create/delete course test records; review their source before running them on valuable data. Isolated validation proved ErrorHandling passes and Connection genuinely fails without that dataset; this does not claim every course ticket passes.

Final checks: clean install/build/types, three Chromium Angular tests, five local Mongo integration tests, and production Playwright desktop/mobile movie/auth/comment/account/admin/course flows pass. Production bundle is about 284 KB; audit reports zero vulnerabilities. Browser fixtures used a disposable database, then were removed. Native online poster/video playback is unverified; catalog and core workflows work offline.
