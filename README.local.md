# MFlix migration checkpoint

Backend upgraded to Express 5.2.1 and MongoDB driver 7.7.0 with native ESM, bcryptjs 3.0.3, JWT 9.0.3, and Node 26.10.0. Official npm registry releases were checked. MongoDB remains local at port 27018, database `mflix`; remote URIs are rejected. Existing `.env` is preserved and ignored; startup explicitly reads private `.env.local`.

Start `../.dependency-migration/start-mongodb.sh` in a foreground terminal, then run `./run-local.sh` in another. Stop with Ctrl+C. App port is 8002. Clean install: `npm ci`; source checks: `npm run check`; isolated integration tests: `npm test`; audit: `npm audit`.

Validated pagination, text/genre/cast/country/facet searches, details/configuration, signup/login/preferences, authorized comments, admin reports, logout/deletion, and date migration using temporary Mongo fixtures. Test databases are dropped. No movie dataset was found locally: port 27017 had no MFlix database, and port 27018/mflix contained only a setup marker. No persistent demo seed was added.

Original prebuilt React frontend remains as a historical reference; the active frontend is now Angular. Its original source was recovered from the supplied source map into `.dependency-migration/mflix-frontend-reference` for feature preservation. Movie grid/details/search/facets/countries, authentication/account preferences, comments, admin/user reports, and course-status validators must be ported. The original React build is not used after building the Angular frontend.

Legacy course exercise tests under `test/` are preserved as references; they assume remote sample data and obsolete Jest/driver APIs. New tests under `tests/` validate the local application. Date conversion is explicit via `node --env-file=.env.local src/migrations/movie-last-updated-migration.js`; it skips invalid strings and does not run automatically. Original automatic admin creation endpoint is retained for course compatibility; admin setup is still an explicit action, not seeded data. Online services were not contacted.

## Angular frontend

The production frontend now uses Angular 22.2.0 with TypeScript 6.0.3 (held within Angular's >=6.0 <6.1 range), Jasmine 6.3/types 6 (Zone.js 0.16.3 compatibility), and Node 26.10.0. Install/build the frontend before starting the backend:

```sh
npm --prefix frontend ci
npm --prefix frontend run build
npm start
```

Express serves `frontend/dist/mflix/browser`; development `npm --prefix frontend start` proxies `/api` to port 8002. Stop foreground servers with Ctrl+C. The previous React build remains a source reference, not the active UI after building Angular.

Movies, text/genre/cast/facet search, pagination, countries, details, posters with offline fallback, related-search buttons, original Matrix animation, login/signup, account preferences, comment ownership/edit/delete, admin reports, and course status controls are preserved. The original two-video modal remains optional online; offline it displays an unavailable message. No online video or poster service was contacted during validation. Original `state` local-storage account format is retained and revalidated against the local backend. Logout now revokes the session token; login and preference updates issue/store one current token.

All 16 original course validator functions/assertions were recovered and retained. They run against the actual API; failures do not become fabricated passes. Their expected 23,530-movie sample dataset is not present locally. Passed course checks display and copy the original completion codes. Some validators intentionally create/delete course test records; review their source before running them on valuable data. Isolated validation proved ErrorHandling passes and Connection genuinely fails without that dataset; this does not claim every course ticket passes.

Final checks: clean install/build/types, three Chromium Angular tests, five local Mongo integration tests, and production Playwright desktop/mobile movie/auth/comment/account/admin/course flows pass. Production bundle is about 284 KB; audit reports zero vulnerabilities. Browser fixtures used a disposable database, then were removed. Native online poster/video playback is unverified; catalog and core workflows work offline.
