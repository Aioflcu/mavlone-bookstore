import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronDown, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "./cart";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/store", label: "Store" },
  { to: "/audiobooks", label: "Audiobooks" },
  { to: "/collections", label: "Collections" },
  { to: "/topics", label: "Topics" },
  { to: "/articles", label: "Articles" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="ink-panel px-4 py-1.5 text-center text-xs font-medium tracking-wide">Instant ebook delivery worldwide · Print books shipped by our partner press</div>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <button className="rounded-md p-2 hover:bg-secondary md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Open menu"><Menu className="size-5" /></button>
          <Link to="/" className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><BookOpen className="size-5" aria-hidden /></span><span className="font-display text-lg font-bold tracking-tight">Mavlone<span className="text-primary">book</span></span></Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "bg-secondary text-primary font-semibold" }}>{n.label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <Link to="/store" className="rounded-md p-2 text-foreground/80 hover:bg-secondary" aria-label="Search books"><Search className="size-5" /></Link>
            <Link to="/cart" className="relative rounded-md p-2 text-foreground/80 hover:bg-secondary" aria-label={`Cart, ${count} items`}><ShoppingCart className="size-5" />{count > 0 && <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-accent-foreground">{count > 9 ? "9+" : count}</span>}</Link>
            {loading ? <div className="mx-1.5 h-8 w-8 animate-pulse rounded-full bg-muted" /> : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="gap-1.5"><UserRound className="size-4" /><ChevronDown className="size-3.5 opacity-60" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">{user.email ?? "Account"}</DropdownMenuLabel><DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>My library & orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/account", search: { tab: "orders" } })}>Order history</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>Admin dashboard</DropdownMenuItem>
                  <DropdownMenuSeparator /><DropdownMenuItem onClick={() => void handleSignOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <div className="flex items-center gap-1.5"><Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth" })}>Sign in</Button><Button size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}>Sign up</Button></div>}
          </div>
        </div>
        <nav className={cn("border-t border-border px-4 py-2 md:hidden", mobileOpen ? "block" : "hidden")} aria-label="Mobile"><div className="flex flex-col">{NAV.map((n) => <Link key={n.to} to={n.to} className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>{n.label}</Link>)}</div></nav>
      </div>
    </header>
  );
}
