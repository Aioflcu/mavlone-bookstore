import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & conditions — Mavlonebook" },
      { name: "description", content: "The terms that govern your use of Mavlonebook and your purchases." },
      { property: "og:title", content: "Terms & conditions — Mavlonebook" },
    ],
  }),
  component: TermsConditions,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Your account",
    body: [
      "You must provide accurate information when creating an account and keep your password confidential. You are responsible for activity under your account. You may close your account at any time by contacting us.",
    ],
  },
  {
    title: "2. Purchases & delivery",
    body: [
      "Ebooks and audiobooks are delivered digitally to your account library immediately after payment is confirmed. They are licensed to you, the buyer, for personal use — you may download them onto your own devices but may not resell, redistribute or publicly share the files.",
      "Print books are produced and shipped by our partner press. Delivery estimates are provided in good faith; delays in production or international post are not grounds for cancellation after production has started, except where the law requires.",
    ],
  },
  {
    title: "3. Pricing & payment",
    body: [
      "All prices are shown and charged in US dollars. Payments are processed by our payment provider; we never store your card details. We may change prices at any time, but the price shown at checkout is the price you pay for that order.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "Do not attempt to access another reader's account or downloads, scrape the catalog at scale, resell access to your account, or use the store for any unlawful purpose. We may suspend accounts that do.",
    ],
  },
  {
    title: "5. Intellectual property",
    body: [
      "The books sold on Mavlonebook remain the property of their authors, publishers and rights holders. Site design, text and branding belong to Mavlonebook and may not be copied without permission.",
    ],
  },
  {
    title: "6. Liability",
    body: [
      "We work hard to keep files correct and the store available, but the service is provided 'as is'. To the extent permitted by law, Mavlonebook is not liable for indirect or consequential losses. Nothing in these terms limits your statutory consumer rights.",
    ],
  },
  {
    title: "7. Governing terms",
    body: [
      "These terms apply together with our Privacy Policy and Refund Policy. If any clause is found unenforceable, the rest still applies. Questions about these terms go through the contact page.",
    ],
  },
];

function TermsConditions() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Terms & conditions</h1>
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
