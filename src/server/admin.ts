import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { BookWithCategory } from "./public-data";

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

async function requireAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Admin access required");
  return context;
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabase } = context;
    const [books, orders, paid] = await Promise.all([
      supabase.from("books").select("count"),
      supabase.from("orders").select("count"),
      supabase.from("orders").select("total").eq("status", "paid"),
    ]);
    const revenue = (paid.data ?? []).reduce((n: number, o: { total: number | null }) => n + Number(o.total ?? 0), 0);
    const pending = await supabase.from("orders").select("count").eq("status", "pending");
    return {
      bookCount: books.data?.[0]?.count ?? 0,
      orderCount: orders.data?.[0]?.count ?? 0,
      pendingCount: pending.data?.[0]?.count ?? 0,
      revenue,
    };
  });

export const listAdminBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabase } = context;
    const [{ data: books }, { data: categories }, { data: collections }] = await Promise.all([
      supabase.from("books").select("*, categories(name, slug)").order("created_at", { ascending: false }).limit(500),
      supabase.from("categories").select("*").order("name"),
      supabase.from("collections").select("*").order("title"),
    ]);
    return { books: (books as BookWithCategory[]) ?? [], categories: categories ?? [], collections: collections ?? [] };
  });

const bookSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).optional().nullable(),
  author: z.string().trim().min(1).max(160),
  short_description: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(6000).optional().nullable(),
  cover_url: z.string().trim().max(400).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  collection_id: z.string().uuid().optional().nullable(),
  formats: z.array(z.enum(["ebook", "paperback", "audiobook"])).min(1),
  price_ebook: z.number().min(0).max(10000).optional().nullable(),
  price_print: z.number().min(0).max(10000).optional().nullable(),
  price_audio: z.number().min(0).max(10000).optional().nullable(),
  compare_at_ebook: z.number().min(0).max(10000).optional().nullable(),
  pages: z.number().int().min(0).max(5000).optional().nullable(),
  language: z.string().trim().max(60).optional().nullable(),
  isbn: z.string().trim().max(40).optional().nullable(),
  publisher: z.string().trim().max(160).optional().nullable(),
  status: z.enum(["published", "draft"]),
  featured: z.boolean(),
  bestseller: z.boolean(),
  new_release: z.boolean(),
  ebook_file_path: z.string().trim().max(400).optional().nullable(),
  audio_file_path: z.string().trim().max(400).optional().nullable(),
  stock_print: z.number().int().min(0).max(100000).optional().nullable(),
});

export type BookInput = z.infer<typeof bookSchema>;

export const upsertBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabase } = context;
    const { id, ...input } = data;
    if (id) {
      const values = stripUndefined(input);
      const { error } = await supabase
        .from("books")
        .update(values as Database["public"]["Tables"]["books"]["Update"])
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const values = stripUndefined(input);
    const { data: created, error } = await supabase
      .from("books")
      .insert(values as Database["public"]["Tables"]["books"]["Insert"])
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Could not create book");
    return { id: created.id };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("books").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    return { orders: data ?? [] };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: z.infer<typeof orderStatusSchema> }) =>
    z.object({ id: z.string().uuid(), status: orderStatusSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const orderStatusSchema = z.enum(["pending", "paid", "fulfilled", "cancelled"]);

const catalogSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(2).max(90),
  description: z.string().trim().max(500).optional().nullable(),
  title: z.string().trim().max(120).optional(),
  cover_url: z.string().trim().max(400).optional().nullable(),
  featured: z.boolean().optional(),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => catalogSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { id, ...input } = data;
    const values = stripUndefined(input) as Database["public"]["Tables"]["categories"]["Insert"];
    if (id) {
      const { error } = await context.supabase
        .from("categories")
        .update(values as Database["public"]["Tables"]["categories"]["Update"])
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("categories")
      .insert(values)
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Could not create");
    return { id: created.id };
  });

export const upsertCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => catalogSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { id, ...input } = data;
    const values = stripUndefined(input) as Database["public"]["Tables"]["collections"]["Insert"];
    if (id) {
      const { error } = await context.supabase
        .from("collections")
        .update(values as Database["public"]["Tables"]["collections"]["Update"])
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("collections")
      .insert(values)
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Could not create");
    return { id: created.id };
  });

export const deleteCategoryOrCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { kind: "categories" | "collections"; id: string }) =>
    z.object({ kind: z.enum(["categories", "collections"]), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from(data.kind).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const assignAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) =>
    z.object({ email: z.string().trim().email() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: user } = await supabaseAdmin.auth.admin.listUsers();
    const target = user.users.find((u) => u.email === data.email);
    if (!target) throw new Error("No account found with that email — ask them to sign up first");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
