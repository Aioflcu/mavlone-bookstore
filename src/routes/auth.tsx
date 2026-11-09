import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, CircleCheck, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

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

function safeNext(next?: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
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
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Supabase's auth listener updates this persisted session after sign-in/sign-up.
  useEffect(() => {
    if (!session) return;
    void navigate({ to: safeNext(next), replace: true });
  }, [session, next, navigate]);

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

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim() || undefined } },
        });
        if (error) throw error;

        // Normally signUp returns a session when email confirmation is disabled.
        // If this address already exists, Supabase may return no session; try
        // authenticating with the submitted credentials rather than pretending the
        // browser is signed in or storing credentials in localStorage.
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            if (signInError.message.toLowerCase().includes("email not confirmed")) {
              throw new Error("Supabase is still requiring email confirmation. Check that Confirm email is disabled on the Supabase project configured for this deployed site.");
            }
            throw signInError;
          }
        }

        toast.success("Account created");
        void navigate({ to: safeNext(next), replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetEmailSent(true);
        toast.success("Reset link sent — check your inbox");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (resetEmailSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <MailCheck className="mx-auto size-12 text-primary" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A password reset link was sent to <strong>{email}</strong>. Use the link to reset your password.
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
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">Your shelf, in your pocket.</h1>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><CircleCheck className="size-4 text-primary" /> Every purchase kept in your library</li>
          <li className="flex items-center gap-2"><CircleCheck className="size-4 text-primary" /> Re-download ebooks anytime, any device</li>
          <li className="flex items-center gap-2"><CircleCheck className="size-4 text-primary" /> First access to new releases</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold">
          {mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? "Free to join — pay only for the books you love." : mode === "reset" ? "We'll email you a secure reset link." : "Sign in to your Mavlonebook account."}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
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
                  <button type="button" className="text-xs text-primary hover:underline" onClick={() => navigate({ to: "/auth", search: { mode: "reset" } })}>
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
                I agree to the <Link to="/terms-conditions" className="text-primary hover:underline" target="_blank">Terms</Link> and <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>.
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
            <>Already have an account? <button className="font-semibold text-primary hover:underline" onClick={() => navigate({ to: "/auth", search: next ? { next } : {} })}>Sign in</button></>
          ) : (
            <>New to Mavlonebook? <button className="font-semibold text-primary hover:underline" onClick={() => navigate({ to: "/auth", search: { mode: "signup", ...(next ? { next } : {}) } })}>Create an account</button></>
          )}
        </p>
      </div>
    </div>
  );
}
