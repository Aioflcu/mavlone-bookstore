import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Mavlonebook" },
      { name: "description", content: "How Mavlonebook collects, uses and protects your data." },
      { property: "og:title", content: "Privacy policy — Mavlonebook" },
    ],
  }),
  component: PrivacyPolicy,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. What we collect",
    body: [
      "Account details: your email address, a display name if you choose one, and your password (stored only as an encrypted hash — we can never read it).",
      "Order details: what you bought, when, payment references, and the delivery address you give us for print books.",
      "Usage data: basic technical data such as browser type and pages visited, used to keep the store running and improve it.",
    ],
  },
  {
    title: "2. What we do with it",
    body: [
      "Deliver your purchases: ebooks and audiobooks are tied to your account so you can download them anytime.",
      "Process payments through our payment provider. We never see or store your full card details.",
      "Send service emails (order confirmations, download availability) and, if you opt in, our newsletter. You can unsubscribe at any time.",
    ],
  },
  {
    title: "3. What we never do",
    body: [
      "We do not sell, rent or trade your personal information to anyone.",
      "We do not use your reading data to build advertising profiles.",
    ],
  },
  {
    title: "4. Data retention & your rights",
    body: [
      "You can request a copy of your data, correct it, or delete your account at any time by writing to us through the contact page. Deleting your account removes your profile and order history; completed downloads you have already saved remain yours.",
      "We keep order records for accounting and dispute purposes as required by law.",
    ],
  },
  {
    title: "5. Cookies",
    body: [
      "We use a small number of essential cookies and browser storage to keep you signed in and remember your cart. No third-party advertising cookies are used.",
    ],
  },
  {
    title: "6. Changes",
    body: [
      "If this policy changes materially, we will notify account holders by email before the change takes effect.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl font-semibold">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
