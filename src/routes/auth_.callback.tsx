import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const callbackSearchSchema = z.object({ next: z.string().optional() });
const NEXT_KEY = "mavlonebook.next";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  ssr: false,
  head: () => ({ meta: [{ title: "Completing sign in — Mavlonebook" }] }),
  component: AuthCallback,
});

function safeNext(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function AuthCallback() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  useEffect(() => {
    let active = true;
    let completed = false;

    const finish = (destination?: string) => {
      if (!active || completed) return;
      completed = true;
      const stored = window.sessionStorage.getItem(NEXT_KEY);
      window.sessionStorage.removeItem(NEXT_KEY);
      void navigate({
        to: safeNext(destination ?? next ?? stored ?? "/account"),
        replace: true,
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish();
    });

    async function completeOAuth() {
      try {
        // With detectSessionInUrl enabled, Supabase normally exchanges the PKCE
        // code during initialization. Check for that session first.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          finish();
          return;
        }

        // Fallback for environments where the callback code was not auto-exchanged.
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (exchanged.session) {
            finish();
            return;
          }
        }

        throw new Error("Sign-in could not be completed. Please try again.");
      } catch (error) {
        if (!active || completed) return;
        window.sessionStorage.removeItem(NEXT_KEY);
        toast.error(error instanceof Error ? error.message : "Google sign-in failed");
        void navigate({ to: "/auth", replace: true });
      }
    }

    void completeOAuth();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate, next]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <h1 className="mt-4 font-display text-xl font-semibold">Completing sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please wait while we finish authenticating your account.</p>
    </div>
  );
}
