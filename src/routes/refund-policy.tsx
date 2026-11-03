import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund policy — Mavlonebook" },
      { name: "description", content: "Mavlonebook's refund and return policy for ebooks, audiobooks and print books." },
      { property: "og:title", content: "Refund policy — Mavlonebook" },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Refund policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Ebooks & audiobooks</h2>
          <p className="mt-2">
            Because digital files are delivered instantly and cannot be "returned", we judge refund
            requests fairly and individually. We will refund an ebook or audiobook purchase in full
            if:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>you accidentally bought the same title twice;</li>
            <li>the file is faulty, incomplete or will not open on your device;</li>
            <li>the book was materially misdescribed on its store page; or</li>
            <li>you bought the wrong edition and tell us within 48 hours without having downloaded it more than 10%.</li>
          </ul>
          <p className="mt-2">
            Requests outside these cases are still considered — write to us through the contact page
            with your order number and we will do our best.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Print books</h2>
          <p className="mt-2">
            Print books are produced and shipped by our partner press. You may cancel a print order
            for a full refund any time before it enters production (usually within 24 hours of
            ordering). After dispatch:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Books that arrive damaged, defective or incorrect are replaced or refunded in full — no return shipping required; send us a photo.</li>
            <li>Undamaged print books can be returned within 14 days of delivery for a refund of the item price; return shipping is paid by the buyer unless the item was faulty.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">How refunds are paid</h2>
          <p className="mt-2">
            Approved refunds go back to the original payment method within 5–10 business days,
            depending on your bank. We never refund to a different account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">How to request one</h2>
          <p className="mt-2">
            Use the contact page and include your order number (or payment reference) and a short
            description of the issue. We reply within one business day.
          </p>
        </section>
      </div>
    </div>
  );
}
