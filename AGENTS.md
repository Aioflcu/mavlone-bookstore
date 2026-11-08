# Architecture rules — Mavlonebook

- Server functions live in `src/lib/*.ts` (public-data, checkout, admin, contact). Never place client-imported function modules under `src/server/` — import-protection blocks `**/server/**` from shipping to the browser.
- Prices are always recomputed from the `books` table inside `createCheckout`; client-sent prices are ignored. Orders are created `pending` and marked `paid` only by Paystack verification.
- Ebook/audiobook downloads are served via short-lived signed URLs from `createDownloadUrl` (entitlement + paid-order check). Cover images are streamed from the private `covers` bucket through `/api/media`.
- Store roles only in `public.user_roles` with `has_role()`; every admin server function re-checks the role server-side.
- Payments run on Paystack (`PAYSTACK_SECRET_KEY` env). Without the key, `createCheckout` returns `configured:false` and the UI explains setup is pending — do not substitute a fake payment success.
- Sample catalog rows came from the migration; manage the catalog through the admin dashboard, not page-load seeding.
