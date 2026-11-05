import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, FORMAT_LABELS } from "@/lib/format";
import { listAdminOrders, updateOrderStatus } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  loader: () => listAdminOrders(),
  component: AdminOrders,
});

type AdminOrder = {
  id: string;
  email: string;
  status: string;
  total: number;
  created_at: string;
  payment_ref: string | null;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  order_items: { id: string; title: string; format: string; price: number; quantity: number }[];
};

const STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;

function AdminOrders() {
  const { orders } = Route.useLoaderData();

  async function setStatus(id: string, status: (typeof STATUSES)[number]) {
    try {
      await updateOrderStatus({ data: { id, status } });
      toast.success(`Order marked ${status}`);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {(orders as AdminOrder[]).map((o) => (
        <div key={o.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                #{o.id.slice(0, 8).toUpperCase()} · {o.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(o.created_at)} · {formatPrice(o.total)} · ref {o.payment_ref ?? "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={o.status === s ? "default" : "outline"}
                  disabled={o.status === s}
                  onClick={() => setStatus(o.id, s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            {o.order_items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>
                  {i.title} <span className="text-xs text-muted-foreground">({FORMAT_LABELS[i.format]}{i.quantity > 1 ? ` ×${i.quantity}` : ""})</span>
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          {o.shipping_name && (
            <p className="mt-2 text-xs text-muted-foreground">
              Ship to: {o.shipping_name}, {o.shipping_address}, {o.shipping_city}, {o.shipping_country}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
