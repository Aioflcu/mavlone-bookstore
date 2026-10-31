import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const cartItemSchema = z.object({
  bookId: z.string().uuid(),
  format: z.enum(["ebook", "paperback", "audiobook"]),
  qty: z.number().int().min(1).max(10),
});

const shippingSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(120),
    country: z.string().trim().min(1).max(80),
  })
  .optional();

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(20),
  shipping: shippingSchema,
});

type PaystackInit = {
  status: boolean;
  message?: string;
  data?: { authorization_url: string; reference: string };
};

/** Paystack charges in minor units. */
function toMinor(amount: number) {
  return Math.round(amount * 100);
}

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const secret = process.env["PAYSTACK_SECRET_KEY"];

    // Prices are always recomputed from the database — never trusted from the client.
    const ids = [...new Set(data.items.map((i) => i.bookId))];
    const { data: books, error } = await supabase
      .from("books")
      .select("id, title, cover_url, price_ebook, price_print, price_audio, formats")
      .in("id", ids)
      .eq("status", "published");
    if (error || !books) throw new Error("Could not load books");

    const lines = data.items.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) throw new Error("A book in your cart is no longer available");
      if (!book.formats.includes(item.format)) throw new Error("Format no longer available");
      const price =
        item.format === "ebook"
          ? book.price_ebook
          : item.format === "audiobook"
            ? book.price_audio
            : book.price_print;
      if (price == null) throw new Error("Missing price");
      return { book, format: item.format, price, qty: item.qty };
    });

    const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);

    if (!secret) {
      return { configured: false as const, authorizationUrl: null, orderId: null };
    }

    // Insert order + items (pending), then initialize the Paystack transaction.
    const user = (await supabase.auth.getUser()).data.user;
    const email = user?.email ?? "";
    if (!email) throw new Error("Signed-in email required");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        email,
        status: "pending",
        currency: "USD",
        subtotal,
        total: subtotal,
        payment_provider: "paystack",
        ...(data.shipping ?? {}),
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error("Could not create order");

    await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        book_id: l.book.id,
        title: l.book.title,
        format: l.format,
        price: l.price,
        quantity: l.qty,
        cover_url: l.book.cover_url,
      })),
    );

    const req = getRequest();
    const origin = new URL(req.url).origin;
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: toMinor(subtotal),
        currency: "USD",
        callback_url: `${origin}/checkout-confirm`,
        metadata: { order_id: order.id },
      }),
    });
    const payload = (await res.json()) as PaystackInit;
    if (!payload.status || !payload.data) {
      throw new Error(payload.message || "Payment could not be initialized");
    }

    // Record the reference with service role (users cannot update their own orders).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({ payment_ref: payload.data.reference })
      .eq("id", order.id);

    return {
      configured: true as const,
      authorizationUrl: payload.data.authorization_url,
      orderId: order.id,
    };
  });

async function markOrderPaid(orderId: string, ref: string, admin: {
  from: (t: string) => any;
}) {
  await admin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_ref: ref })
    .eq("id", orderId);
}

export const confirmOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reference: string }) =>
    z.object({ reference: z.string().trim().min(4).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) throw new Error("Payments are not configured yet");
    const { supabase, userId } = context;

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const payload = (await res.json()) as {
      status: boolean;
      data?: { status: string; amount: number; metadata?: { order_id?: string } };
    };
    if (!payload.status || !payload.data) throw new Error("Could not verify payment");
    if (payload.data.status !== "success") {
      return { paid: false as const, orderId: null, message: "Payment was not completed" };
    }

    const orderId = payload.data.metadata?.order_id;
    if (!orderId) throw new Error("Missing order reference");

    // Verify the order belongs to this caller before granting anything.
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, total, status")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.user_id !== userId) throw new Error("Order not found");
    if (order.status !== "paid" && payload.data.amount !== toMinor(order.total)) {
      throw new Error("Payment amount mismatch");
    }

    if (order.status !== "paid") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await markOrderPaid(orderId, data.reference, supabaseAdmin);
    }

    return { paid: true as const, orderId, message: null };
  });

/** Signed, time-limited download links for paid ebook/audiobook items. */
export const createDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderItemId: string }) =>
    z.object({ orderItemId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("order_items")
      .select("id, order_id, orders!inner(id, user_id, status), books(ebook_file_path, audio_file_path)")
      .eq("id", data.orderItemId)
      .maybeSingle();
    if (error || !item) throw new Error("Download not found");
    const order = (item as { orders?: { user_id: string; status: string } }).orders;
    if (!order || order.user_id !== userId || order.status !== "paid") {
      throw new Error("This download is not available — the order may not be completed yet");
    }
    const book = item.books as { ebook_file_path: string | null; audio_file_path: string | null } | null;
    const bucket =
      item.format === "audiobook" ? "audio-files" : item.format === "ebook" ? "ebook-files" : null;
    const path =
      item.format === "audiobook" ? book?.audio_file_path : item.format === "ebook" ? book?.ebook_file_path : null;
    if (!bucket || !path) throw new Error("No file has been uploaded for this format yet");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 300);
    if (signError || !signed) throw new Error("Could not prepare your download");
    return { url: signed.signedUrl };
  });

/** Everything the account page needs: orders with items and file availability. */
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: orders }, { data: profile }] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "*, order_items(*, books(slug, ebook_file_path, audio_file_path, cover_url))",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("display_name, avatar_url").maybeSingle(),
    ]);
    return { orders: orders ?? [], profile: profile ?? null };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return data === true;
  });
