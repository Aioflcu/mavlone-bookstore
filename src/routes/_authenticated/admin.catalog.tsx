import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/format";
import {
  assignAdminRole,
  deleteCategoryOrCollection,
  listAdminBooks,
  upsertCategory,
  upsertCollection,
} from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  loader: () => listAdminBooks(),
  component: AdminCatalog,
});

type Category = { id: string; name: string; slug: string };
type Collection = { id: string; title: string; slug: string; description: string | null };

function AdminCatalog() {
  const { categories, collections } = Route.useLoaderData();
  const [catName, setCatName] = useState("");
  const [colTitle, setColTitle] = useState("");
  const [colDesc, setColDesc] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Topics</h2>
        <div className="mt-3 flex gap-2">
          <Input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="New topic name"
          />
          <Button
            disabled={busy || !catName.trim()}
            onClick={() =>
              run(
                () =>
                  upsertCategory({
                    data: { name: catName.trim(), slug: slugify(catName) },
                  }),
                "Topic created",
              )
            }
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {categories.map((c: Category) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{c.name}</span>
              <button
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${c.name}`}
                onClick={() =>
                  window.confirm(`Delete topic "${c.name}"?`) &&
                  run(() => deleteCategoryOrCollection({ data: { kind: "categories", id: c.id } }), "Topic deleted")
                }
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Collections</h2>
        <div className="mt-3 space-y-2">
          <Input
            value={colTitle}
            onChange={(e) => setColTitle(e.target.value)}
            placeholder="New collection title"
          />
          <Input
            value={colDesc}
            onChange={(e) => setColDesc(e.target.value)}
            placeholder="Short description (optional)"
          />
          <Button
            disabled={busy || !colTitle.trim()}
            className="w-full"
            onClick={() =>
              run(
                () =>
                  upsertCollection({
                    data: { title: colTitle.trim(), slug: slugify(colTitle), description: colDesc.trim() || null, featured: true },
                  }),
                "Collection created",
              )
            }
          >
            <Plus className="size-4" /> Create collection
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {collections.map((c: Collection) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="truncate">{c.title}</span>
              <button
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${c.title}`}
                onClick={() =>
                  window.confirm(`Delete collection "${c.title}"?`) &&
                  run(() => deleteCategoryOrCollection({ data: { kind: "collections", id: c.id } }), "Collection deleted")
                }
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="h-fit rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Admins</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Grant dashboard access by email. The person must have created an account on the site first.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="owner@example.com"
          />
          <Button
            disabled={busy || !adminEmail.trim()}
            onClick={() => run(() => assignAdminRole({ data: { email: adminEmail.trim() } }), "Admin added")}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        </div>
      </section>
    </div>
  );
}
