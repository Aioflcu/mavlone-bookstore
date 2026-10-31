import { createFileRoute } from "@tanstack/react-router";

/**
 * Streams cover images from the (private) storage bucket so readers see them
 * without exposing bucket URLs. Format: /api/media/covers/<object-path>
 */
export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params._splat ?? "";
        const [bucket, ...rest] = raw.split("/");
        if (bucket !== "covers" || rest.length === 0) {
          return Response.json({ error: "not found" }, { status: 404 });
        }
        const path = rest.join("/");
        if (!/^[a-zA-Z0-9/_\-.]+$/.test(path)) {
          return Response.json({ error: "bad path" }, { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("covers").download(path);
        if (error || !data) {
          return Response.json({ error: "not found" }, { status: 404 });
        }
        const type = data.type || "application/octet-stream";
        return new Response(data, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});
