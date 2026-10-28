# Mavlonebook build roadmap

- [x] Study mayobook.com structure and page list
- [x] Payment eligibility check → Paystack (client's keys) for NG seller
- [x] Enable Lovable Cloud
- [ ] Database migration: profiles, user_roles, categories, collections, books, orders, order_items + RLS + grants + seed books
- [ ] Storage buckets: covers (public), ebook files (private), audio files (private)
- [ ] Design system (styles.css): warm paper & ink tokens, Fraunces + Inter fonts
- [ ] Auth: enable email auth, configure Google + Lovable sign-in, auth pages, reset password
- [ ] Public pages: home, store, book detail, collections, audiobooks, topics, articles, about, contact, policies
- [ ] Cart + secure checkout + Paystack server functions + webhook route
- [ ] Account: orders + downloads (signed, entitlement-checked)
- [ ] Admin dashboard: books CRUD + uploads, categories, collections, orders
- [ ] Verify end-to-end (auth, purchase flow, admin) + build logs
