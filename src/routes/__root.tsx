import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";

/**
 * Pathless auth layout: every child route is signed-in only.
 * `ssr: false` because the session is stored in Firebase Auth.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!auth.currentUser) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
