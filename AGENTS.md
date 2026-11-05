<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture rules — Mavlonebook

- Server functions live in `src/lib/*.ts` (public-data, checkout, admin, contact). Never place client-imported function modules under `src/server/` — import-protection blocks `**/server/**` from the client bundle.
- Prices are always recomputed from the `books` table inside `createCheckout`; client-sent prices are ignored. Orders are created `pending` and marked `paid` only by Paystack verification (`confirmOrder`) or the signed webhook `/api/public/paystack/webhook`.
- Ebook/audiobook downloads are served via short-lived signed URLs from `createDownloadUrl` (entitlement + paid-order check). Cover images are streamed from the private `covers` bucket through `/api/media/covers/<path>`; buckets are private because the workspace blocks public buckets.
- Store roles only in `public.user_roles` with `has_role()`; every admin server function re-checks the role server-side.
- Payments run on Paystack (client's keys; `PAYSTACK_SECRET_KEY` env). Without the key, `createCheckout` returns `configured:false` and the UI explains setup is pending — do not substitute a fake payment path.
- Sample catalog rows came from the migration; manage the catalog through the admin dashboard, not page-load seeding.
