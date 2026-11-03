import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/format";
import { deleteBook, listAdminBooks, upsertBook, type BookInput } from "@/server/admin";
import { supabase } from "@/integrations/supabase/client";
import type { BookWithCategory } from "@/server/public-data";

export const Route = createFileRoute("/_authenticated/admin/books")({
  loader: () => listAdminBooks(),
  component: AdminBooks,
});

const EMPTY: BookInput = {
  slug: "",
  title: "",
  subtitle: null,
  author: "",
  short_description: null,
  description: null,
  cover_url: null,
  category_id: null,
  collection_id: null,
  formats: ["ebook"],
  price_ebook: null,
  price_print: null,
  price_audio: null,
  compare_at_ebook: null,
  pages: null,
  language: "English",
  isbn: null,
  publisher: null,
  status: "published",
  featured: false,
  bestseller: false,
  new_release: true,
  ebook_file_path: null,
  audio_file_path: null,
  stock_print: null,
};

type Draft = BookInput & { id?: string };

function AdminBooks() {
  const { books, categories, collections } = Route.useLoaderData();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = books.filter(
    (b) =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()),
  );

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await upsertBook({ data: draft });
      toast.success(draft.id ? "Book updated" : "Book created");
      setDraft(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
      window.location.reload();
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this book permanently?")) return;
    try {
      await deleteBook({ data: { id } });
      toast.success("Book deleted");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books…"
          className="max-w-xs"
        />
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" /> New book
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Book</th>
              <th className="p-3">Prices</th>
              <th className="p-3">Status</th>
              <th className="p-3">Flags</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((b) => (
              <tr key={b.id}>
                <td className="p-3">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.author}</p>
                </td>
                <td className="p-3 text-xs">
                  {b.price_ebook != null && <div>Ebook ${b.price_ebook}</div>}
                  {b.price_print != null && <div>Print ${b.price_print}</div>}
                  {b.price_audio != null && <div>Audio ${b.price_audio}</div>}
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      b.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3 text-xs">
                  {[b.featured && "Featured", b.bestseller && "Bestseller", b.new_release && "New"].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setDraft(bookToDraft(b))} aria-label="Edit">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(b.id)} aria-label="Delete">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No books match your search.</p>
        )}
      </div>

      {draft && (
        <BookEditor
          draft={draft}
          setDraft={setDraft}
          categories={categories}
          collections={collections}
          saving={saving}
          onSave={save}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}

function bookToDraft(b: BookWithCategory): Draft {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    subtitle: b.subtitle,
    author: b.author,
    short_description: b.short_description,
    description: b.description,
    cover_url: b.cover_url,
    category_id: b.category_id,
    collection_id: b.collection_id,
    formats: b.formats as BookInput["formats"],
    price_ebook: b.price_ebook != null ? Number(b.price_ebook) : null,
    price_print: b.price_print != null ? Number(b.price_print) : null,
    price_audio: b.price_audio != null ? Number(b.price_audio) : null,
    compare_at_ebook: b.compare_at_ebook != null ? Number(b.compare_at_ebook) : null,
    pages: b.pages,
    language: b.language,
    isbn: b.isbn,
    publisher: b.publisher,
    status: b.status as "published" | "draft",
    featured: b.featured,
    bestseller: b.bestseller,
    new_release: b.new_release,
    ebook_file_path: b.ebook_file_path,
    audio_file_path: b.audio_file_path,
    stock_print: b.stock_print,
  };
}

function BookEditor({
  draft,
  setDraft,
  categories,
  collections,
  saving,
  onSave,
  onClose,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  categories: { id: string; name: string }[];
  collections: { id: string; title: string }[];
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);

  async function uploadFile(
    kind: "cover" | "ebook" | "audio",
    file: File,
  ) {
    const ext = file.name.split(".").pop() ?? "bin";
    const bucket = kind === "cover" ? "covers" : kind === "ebook" ? "ebook-files" : "audio-files";
    const path =
      kind === "cover"
        ? `covers/${draft.slug || "book"}-${Date.now()}.${ext}`
        : `${draft.slug || "book"}/${kind}-${Date.now()}.${ext}`;
    setUploading(kind);
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      if (kind === "cover") {
        setDraft({ ...draft, cover_url: `/api/media/covers/${path.replace(/^covers\//, "")}` });
        toast.success("Cover uploaded");
      } else if (kind === "ebook") {
        setDraft({ ...draft, ebook_file_path: path });
        toast.success("Ebook file attached");
      } else {
        setDraft({ ...draft, audio_file_path: path });
        toast.success("Audio file attached");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  const field = (
    key: keyof Draft,
    label: string,
    opts?: { type?: string; span?: boolean; placeholder?: string },
  ) => (
    <div className={opts?.span ? "sm:col-span-2" : ""}>
      <Label>{label}</Label>
      <Input
        type={opts?.type ?? "text"}
        value={(draft[key] as string | number | null) ?? ""}
        onChange={(e) =>
          setDraft({
            ...draft,
            [key]:
              opts?.type === "number"
                ? e.target.value === ""
                  ? null
                  : Number(e.target.value)
                : e.target.value === ""
                  ? null
                  : e.target.value,
          })
        }
        placeholder={opts?.placeholder}
        className="mt-1"
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit book" : "New book"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })}
              className="mt-1"
            />
          </div>
          {field("slug", "URL slug", { placeholder: "auto-generated-from-title" })}
          {field("author", "Author")}
          {field("subtitle", "Subtitle")}
          <div>
            <Label>Topic</Label>
            <select
              value={draft.category_id ?? ""}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Collection</Label>
            <select
              value={draft.collection_id ?? ""}
              onChange={(e) => setDraft({ ...draft, collection_id: e.target.value || null })}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="">— none —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>Formats sold</Label>
            <div className="mt-1 flex flex-wrap gap-4">
              {(["ebook", "paperback", "audiobook"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.formats.includes(f)}
                    onCheckedChange={(v) =>
                      setDraft({
                        ...draft,
                        formats: v
                          ? [...draft.formats, f]
                          : draft.formats.filter((x) => x !== f),
                      })
                    }
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {field("price_ebook", "Ebook price ($)", { type: "number" })}
          {field("compare_at_ebook", "Ebook compare-at price ($)", { type: "number" })}
          {field("price_print", "Print price ($)", { type: "number" })}
          {field("stock_print", "Print stock", { type: "number" })}
          {field("price_audio", "Audiobook price ($)", { type: "number" })}
          {field("pages", "Pages", { type: "number" })}

          <div className="sm:col-span-2">
            <Label>Short description (card text)</Label>
            <Textarea
              value={draft.short_description ?? ""}
              onChange={(e) => setDraft({ ...draft, short_description: e.target.value || null })}
              className="mt-1"
              rows={2}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Full description</Label>
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Files */}
          <div className="sm:col-span-2 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Files & images</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["cover", "Cover image", draft.cover_url],
                  ["ebook", "Ebook file (PDF/EPUB)", draft.ebook_file_path],
                  ["audio", "Audiobook file (MP3)", draft.audio_file_path],
                ] as const
              ).map(([kind, label, current]) => (
                <div key={kind} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium">{label}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {current ? current.split("/").pop() : "Not uploaded"}
                  </p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
                    {uploading === kind ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept={kind === "cover" ? "image/*" : undefined}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(kind, f);
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as "published" | "draft" })}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="published">Published</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
          <div className="flex items-end gap-4">
            {(
              [
                ["featured", "Featured"],
                ["bestseller", "Bestseller"],
                ["new_release", "New release"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={draft[key]}
                  onCheckedChange={(v) => setDraft({ ...draft, [key]: v === true })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="size-4" /> Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save book
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
