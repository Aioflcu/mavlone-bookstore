import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, updatePassword } from "@/lib/firebase";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — Mavlonebook" },
      { name: "description", content: "Choose a new password for your Mavlonebook account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("This reset link is invalid or expired. Please request a new one.");
      }
      await updatePassword(user, password);
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate({ to: "/", replace: true }), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="rounded-2xl border border-border bg-card p-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Set a new password</h1>
        {done ? (
          <p className="mt-3 text-sm text-muted-foreground">
            All set — your password has been updated. Redirecting you home…
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Update password
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/auth" className="hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
