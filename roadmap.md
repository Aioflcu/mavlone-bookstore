# Mavlonebook build roadmap

- [x] Study mayobook.com structure and page list
- [x] Payment eligibility check → Paystack (client's keys) for NG seller
- [x] Enable Lovable Cloud + auth (email/password and Google; Lovable sign-in removed)
- [x] Database: profiles, user_roles, categories, collections, books, orders, order_items, contact_messages + RLS + seed books
- [x] Storage: covers / ebook-files / audio-files buckets (private) + policies + media streaming route
- [x] Design system: paper & ink tokens, Fraunces + Inter
- [x] Public pages: home, store, book detail, collections, audiobooks, topics, articles, about, contact, privacy, refund, terms
- [x] Cart + secure checkout + Paystack server functions + webhook route
- [x] Account: library, orders, profile + entitlement-checked downloads
- [x] Admin dashboard: books CRUD + uploads, orders, topics & collections, admins
- [x] Verified: all pages load clean, signup works, account/checkout/admin gate verified in browser
- [x] Grant kd1dave123@gmail.com admin access; existing Admins panel supports adding more registered emails

## Open items (need the client)
- [ ] Add Paystack keys (`PAYSTACK_SECRET_KEY` + public key) once the client provides them — checkout is fully built and waits on this.
- [ ] Optional: upload real covers / ebook / audio files via the dashboard (sample books ship with designed typographic covers).
