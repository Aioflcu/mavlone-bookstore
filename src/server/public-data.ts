import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Publishable-key client for public catalog reads.
 * Rows are protected by narrow `TO anon` SELECT policies.
 */
async function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type BookRow = Database["public"]["Tables"]["books"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];
export type BookWithCategory = BookRow & {
  categories: { name: string; slug: string } | null;
};

export interface BookFilters {
  format?: "ebook" | "paperback" | "audiobook";
  category?: string;
  collection?: string;
  q?: string;
  sort?: "newest" | "rating" | "price_asc" | "price_desc";
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
  limit?: number;
}

export const listBooks = createServerFn({ method: "GET" })
  .inputValidator((input: BookFilters) => input ?? {})
  .handler(async ({ data }): Promise<BookWithCategory[]> => {
    const supabase = await publicClient();
    let query = supabase
      .from("books")
      .select("*, categories(name, slug)")
      .eq("status", "published");

    if (data?.format) query = query.contains("formats", [data.format]);
    if (data?.category) query = query.eq("categories.slug", data.category);
    if (data?.collection) {
      const { data: col } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", data.collection)
        .maybeSingle();
      if (!col) return [];
      query = query.eq("collection_id", col.id);
    }
    if (data?.featured) query = query.eq("featured", true);
    if (data?.bestseller) query = query.eq("bestseller", true);
    if (data?.newRelease) query = query.eq("new_release", true);
    if (data?.q) {
      const clean = data.q.replace(/[,()%]/g, " ").trim();
      if (clean) {
        query = query.or(
          `title.ilike.%${clean}%,author.ilike.%${clean}%,short_description.ilike.%${clean}%`,
        );
      }
    }

    switch (data?.sort) {
      case "rating":
        query = query.order("rating", { ascending: false, nullsFirst: false });
        break;
      case "price_asc":
        query = query.order("price_ebook", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        query = query.order("price_ebook", { ascending: false, nullsFirst: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    query = query.limit(data?.limit ?? 48);
    const { data: books } = await query;
    return (books as BookWithCategory[]) ?? [];
  });

export const getBook = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<{ book: BookWithCategory | null; related: BookWithCategory[] }> => {
    const supabase = await publicClient();
    const { data: book } = await supabase
      .from("books")
      .select("*, categories(name, slug)")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!book) return { book: null, related: [] };

    let relatedQuery = supabase
      .from("books")
      .select("*, categories(name, slug)")
      .eq("status", "published")
      .neq("id", book.id)
      .limit(4);
    if (book.category_id) relatedQuery = relatedQuery.eq("category_id", book.category_id);
    const { data: related } = await relatedQuery.order("rating", { ascending: false });

    return { book: book as BookWithCategory, related: (related as BookWithCategory[]) ?? [] };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data as CategoryRow[]) ?? [];
});

export const listCollections = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as CollectionRow[]) ?? [];
});

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<{ collection: CollectionRow | null; books: BookWithCategory[] }> => {
    const supabase = await publicClient();
    const { data: collection } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!collection) return { collection: null, books: [] };
    const { data: books } = await supabase
      .from("books")
      .select("*, categories(name, slug)")
      .eq("status", "published")
      .eq("collection_id", collection.id)
      .order("rating", { ascending: false });
    return { collection: collection as CollectionRow, books: (books as BookWithCategory[]) ?? [] };
  });

export interface HomeData {
  featured: BookWithCategory[];
  bestsellers: BookWithCategory[];
  newReleases: BookWithCategory[];
  audiobooks: BookWithCategory[];
  categories: CategoryRow[];
  collections: CollectionRow[];
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async (): Promise<HomeData> => {
  const supabase = await publicClient();
  const base = supabase.from("books").select("*, categories(name, slug)").eq("status", "published");
  const [featured, bestsellers, newReleases, audiobooks, categories, collections] = await Promise.all([
    base.clone().eq("featured", true).order("rating", { ascending: false }).limit(5),
    base.clone().eq("bestseller", true).order("ratings_count", { ascending: false }).limit(6),
    base.clone().eq("new_release", true).order("created_at", { ascending: false }).limit(6),
    base.clone().contains("formats", ["audiobook"]).limit(6),
    supabase.from("categories").select("*").order("name"),
    supabase.from("collections").select("*").eq("featured", true).limit(2),
  ]);
  return {
    featured: (featured.data as BookWithCategory[]) ?? [],
    bestsellers: (bestsellers.data as BookWithCategory[]) ?? [],
    newReleases: (newReleases.data as BookWithCategory[]) ?? [],
    audiobooks: (audiobooks.data as BookWithCategory[]) ?? [],
    categories: (categories.data as CategoryRow[]) ?? [],
    collections: (collections.data as CollectionRow[]) ?? [],
  };
});
