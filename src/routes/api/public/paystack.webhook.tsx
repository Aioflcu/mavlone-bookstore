import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Paystack webhook. Verifies the x-paystack-signature HMAC (SHA-512 of the raw
 * body with the secret key) before touching any order.
 */
export const Route = createFileRoute("/api/public/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) return Response.json({ error: "not configured" }, { status: 503 });

        const raw = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(raw).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return Response.json({ error: "invalid signature" }, { status: 401 });
        }

        let event: { event?: string; data?: { status?: string; reference?: string; metadata?: { order_id?: string } } };
        try {
          event = JSON.parse(raw);
        } catch {
          return Response.json({ error: "bad json" }, { status: 400 });
        }

        if (event.event === "charge.success" && event.data?.status === "success") {
          const orderId = event.data.metadata?.order_id;
          const reference = event.data.reference;
          const parsed = z
            .object({ order_id: z.string().uuid(), reference: z.string() })
            .safeParse({ order_id: orderId, reference });
          if (parsed.success) {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("orders")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                payment_ref: parsed.data.reference,
              })
              .eq("id", parsed.data.order_id)
              .eq("status", "pending");
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
