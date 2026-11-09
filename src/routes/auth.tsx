import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, CircleCheck, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { auth, getRedirectResult, googleProvider, signInWithRedirect } from "@/lib/firebase";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "reset"]).optional(),
  next: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Mavlonebook" },
      { name: "description", content: "Sign in or create your free Mavlonebook account." },
      { property: "og:title", content: "Sign in — Mavlonebook" },
    ],
  }),
  component: AuthPage,
});

const NEXT_KEY = "mavlonebook.next";

function safeNext(next?: string): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function AuthPage() {
  const { mode = "signin", next } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  // After a Supabase sign-in, honor the stored destination.
  useEffect(() => {
    if (!session) return;
    const stored = window.sessionStorage.getItem(NEXT_KEY);
    window.sessionStorage.removeItem(NEXT_KEY);
    navigate({ to: safeNext(next ?? stored ?? "/"), replace: true });
  }, [session, next, navigate]);

  // Complete Firebase's redirect flow after returning from Google. The auth-state
  // listener below handles navigation once Firebase has restored the user.
  useEffect(() => {
    let active = true;
    getRedirectResult(auth).catch((err) => {
      if (!active) return;
      window.sessionStorage.removeItem(NEXT_KEY);
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    });
    return () => {
      active = false;
    };
  }, []);

  // Also route users who already have a Firebase session away from the login page.
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const stored = window.sessionStorage.getItem(NEXT_KEY);
      window.sessionStorage.removeItem(NEXT_KEY);
      void navigate({ to: safeNext(next ?? stored ?? "/"), replace: true });
    });
  }, [navigate, next]);

  async function oauth() {
    window.sessionStorage.setItem(NEXT_KEY, safeNext(next));
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      window.sessionStorage.removeItem(NEXT_KEY);
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else if (mode === "signup") {
        if (!agree) {
          toast.error("Please agree to the terms to continue");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSignedUp(true);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent — check your inbox");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (signedUp) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <MailCheck className="mx-auto size-12 text-primary" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account
          and start building your library.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/store">Keep browsing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
          Your shelf, in your pocket.
        </h1>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CircleCheck className="size-4 text-primary" /> Every purchase kept in your library
          </li>
          <li className="flex items-center gap-2">
            <CircleCheck className="size-4 text-primary" /> Re-download ebooks anytime, any device
          </li>
          <li className="flex items-center gap-2">
            <CircleCheck className="size-4 text-primary" /> First access to new releases
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold">
          {mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Free to join — pay only for the books you love."
            : mode === "reset"
              ? "We'll email you a secure reset link."
              : "Sign in to your Mavlonebook account."}
        </p>

        {mode !== "reset" && (
          <div className="mt-5 grid gap-2">
            <Button variant="outline" onClick={() => void oauth()}>
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 0 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
              Continue with Google
            </Button>
          </div>
        )}

        {mode !== "reset" && (
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi" className="mt-1" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
          </div>
          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => navigate({ to: "/auth", search: { mode: "reset" } })}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
            </div>
          )}
          {mode === "signup" && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link to="/terms-conditions" className="text-primary hover:underline" target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-primary hover:underline" onClick={() => navigate({ to: "/auth", search: next ? { next } : {} })}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New to Mavlonebook?{" "}
              <button className="font-semibold text-primary hover:underline" onClick={() => navigate({ to: "/auth", search: { mode: "signup", ...(next ? { next } : {}) } })}>
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
