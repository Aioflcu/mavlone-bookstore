import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { BookMarked, Download, Headphones, Package, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, FORMAT_LABELS } from "@/lib/format";
import { createDownloadUrl, getMyAccount } from "@/lib/checkout";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ tab: z.enum(["library", "orders", "profile"]).optional() });

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: searchSchema,
  loader: () => getMyAccount(),
  head: () => ({
    meta: [
      { title: "My account — Mavlonebook" },
      { name: "description", content: "Your Mavlonebook library, orders and profile." },
      { property: "og:title", content: "My account — Mavlonebook" },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: {
    id: string;
    title: string;
    format: string;
    price: number;
    books: { slug: string; ebook_file_path: string | null; audio_file_path: string | null } | null;
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

function AccountPage() {
  const { tab = "library" } = Route.useSearch();
  const { orders, profile } = Route.useLoaderData();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const libraryItems = paidOrders.flatMap((o) =>
    o.order_items.filter((i) => i.format !== "paperback"),
  );

  async function download(orderItemId: string) {
    try {
      const { url } = await createDownloadUrl({ data: { orderItemId } });
      window.open(url, "_blank", "noopener");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
      if (error) throw error;
      const { error: pErr } = await supabase.from("profiles").update({ display_name: name }).eq("id", (await supabase.auth.getUser()).data.user!.id);
      if (pErr) throw pErr;
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { key: "library", label: "My library", icon: BookMarked },
    { key: "orders", label: "Orders", icon: Package },
    { key: "profile", label: "Profile", icon: UserRound },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">My account</h1>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to="/account"
            search={{ tab: t.key }}
            className={cn(
              "flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground",
              tab === t.key && "border-b-2 border-primary text-primary",
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </Link>
        ))}
      </div>

      {tab === "library" && (
        <div className="mt-8">
          {libraryItems.length === 0 ? (
            <EmptyState text="Your library is waiting for its first ebook. Anything you buy in ebook or audiobook format appears here instantly." />
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {libraryItems.map((item) => {
                const fileAvailable =
                  item.format === "ebook"
                    ? !!item.books?.ebook_file_path
                    : !!item.books?.audio_file_path;
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                    {item.format === "audiobook" ? (
                      <Headphones className="size-5 text-primary" aria-hidden />
                    ) : (
                      <Download className="size-5 text-primary" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{FORMAT_LABELS[item.format]}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={!fileAvailable}
                      onClick={() => download(item.id)}
                      title={fileAvailable ? undefined : "The publisher hasn't uploaded the file yet"}
                    >
                      <Download className="size-4" /> Download
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <EmptyState text="No orders yet. When you buy a book it will show up here with its receipt." />
          ) : (
            orders.map((o: OrderRow) => (
              <div key={o.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Order #{o.id.slice(0, 8).toUpperCase()} · {formatDate(o.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatPrice(o.total)}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      o.status === "paid" && "bg-primary/10 text-primary",
                      o.status === "pending" && "bg-brass/20 text-brass-deep",
                      o.status !== "paid" && o.status !== "pending" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
                  {o.order_items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span className="truncate">
                        {i.title}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({FORMAT_LABELS[i.format]})
                        </span>
                      </span>
                      <span>{formatPrice(i.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-8 max-w-md rounded-xl border border-border bg-card p-5">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            placeholder="Your name"
          />
          <Button className="mt-4" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
