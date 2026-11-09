import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

const searchSchema = z.object({ next: z.string().optional() });

/** Legacy callback path now returns visitors to the email/password sign-in page. */
export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  ssr: false,
  component: LegacyAuthCallback,
});

function LegacyAuthCallback() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  useEffect(() => {
    void navigate({ to: "/auth", search: next ? { next } : {}, replace: true });
  }, [navigate, next]);

  return null;
}
