import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CircleCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmOrder, createDownloadUrl } from "@/server/checkout";

export const Route = createFileRoute("/checkout-confirm")({
  ssr: false,
  validateSearch: zodSearch(),
  head: () => ({
    meta: [
      { title: "Payment confirmed — Mavlonebook" },
      { name: "description", content: "Your Mavlonebook order confirmation." },
      { property: "og:title", content: "Payment confirmed — Mavlonebook" },
    ],
  }),
  component: CheckoutConfirm,
});

function zodSearch() {
  return (search: Record<string, unknown>) => ({
    reference:
      typeof search["reference"] === "string"
        ? search["reference"]
        : typeof search["trxref"] === "string"
          ? search["trxref"]
          : undefined,
  });
}

function CheckoutConfirm() {
  const { reference } = Route.useSearch();
  const [state, setState] = useState<"checking" | "paid" | "failed">("checking");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!reference) {
      setState("failed");
      return;
    }
    confirmOrder({ data: { reference } })
      .then((r) => {
        if (r.paid) setState("paid");
        else setState("failed");
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Verification failed");
        setState("failed");
      });
  }, [reference]);

  async function download(orderItemId: string) {
    try {
      const { url } = await createDownloadUrl({ data: { orderItemId } });
      window.open(url, "_blank", "noopener");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      {state === "checking" && (
        <>
          <div className="mx-auto size-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <h1 className="mt-6 font-display text-2xl font-bold">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">This only takes a moment.</p>
        </>
      )}

      {state === "paid" && (
        <>
          <CircleCheck className="mx-auto size-14 text-primary" aria-hidden />
          <h1 className="mt-4 font-display text-3xl font-bold">Thank you — payment confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your ebooks and audiobooks are in your library right now, ready to download. Print books
            will be shipped by our partner press.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/account">
                <Download className="size-4" /> Go to my library
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/store">Keep browsing</Link>
            </Button>
          </div>
        </>
      )}

      {state === "failed" && (
        <>
          <h1 className="font-display text-3xl font-bold">Payment not completed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If you were charged but see this message, contact us with your payment reference and
            we'll sort it out.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/cart">Back to cart</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact support</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
