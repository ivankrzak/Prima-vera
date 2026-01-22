"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Nová",
    color: "text-[var(--color-gold)]",
    bgColor: "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10",
  },
  CONFIRMED: {
    label: "Potvrdená",
    color: "text-blue-600",
    bgColor: "border-blue-500/30 bg-blue-50",
  },
  PREPARING: {
    label: "Pripravuje sa",
    color: "text-purple-600",
    bgColor: "border-purple-500/30 bg-purple-50",
  },
  READY: {
    label: "Pripravená",
    color: "text-[var(--color-accent)]",
    bgColor: "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10",
  },
  OUT_FOR_DELIVERY: {
    label: "Na ceste",
    color: "text-[var(--color-brand)]",
    bgColor: "border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10",
  },
  DELIVERED: {
    label: "Doručená",
    color: "text-[var(--color-text-secondary)]",
    bgColor: "border-[var(--color-border)] bg-[var(--color-bg-warm)]",
  },
  CANCELLED: {
    label: "Zrušená",
    color: "text-red-600",
    bgColor: "border-red-500/30 bg-red-50",
  },
};

const statusFlow: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);

  const { data: stats } = api.order.stats.useQuery();
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = api.order.listAll.useQuery(
    filterStatus ? { status: filterStatus } : undefined,
  );
  const { data: activeOrders } = api.order.activeOrders.useQuery();

  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const orders = ordersData?.orders ?? [];

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = statusFlow.indexOf(current);
    if (idx >= 0 && idx < statusFlow.length - 1) {
      return statusFlow[idx + 1] ?? null;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-[var(--color-text)]">
              Admin{" "}
              <span className="font-serif text-[var(--color-brand)] italic">
                Panel
              </span>
            </h1>
            <div className="mt-2 h-px w-16 bg-[var(--color-brand)]" />
          </div>
          <button
            onClick={() => void refetch()}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-brand)]"
          >
            ↻ Obnoviť
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Dnes objednávok
              </p>
              <p className="text-4xl font-light text-[var(--color-text)]">
                {stats.todayOrders}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <p className="text-sm text-[var(--color-text-secondary)]">
                _Čakajúce
              </p>
              <p className="text-4xl font-light text-[var(--color-gold)]">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Dnešný obrat
              </p>
              <p className="text-4xl font-light text-[var(--color-brand)]">
                {Number(stats.todayRevenue).toFixed(2)} €
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Celkom objednávok
              </p>
              <p className="text-4xl font-light text-[var(--color-text)]">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        )}

        {/* Active orders for kitchen */}
        {activeOrders && activeOrders.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-6 text-xl font-medium text-[var(--color-text)]">
              🔥 Aktívne objednávky ({activeOrders.length})
            </h2>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {activeOrders.map((order) => {
                const status = statusConfig[order.status];
                const nextStatus = getNextStatus(order.status);

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border-2 border-[var(--color-brand)] bg-[var(--color-bg-card)] p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-[var(--color-text)]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                        >
                          {status?.label}
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {new Date(order.createdAt).toLocaleTimeString("sk-SK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <ul className="mb-4 space-y-1 text-sm">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="font-medium text-[var(--color-text)]"
                        >
                          {item.quantity}× {item.product.name}
                        </li>
                      ))}
                    </ul>

                    {order.notes && (
                      <p className="mb-4 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 p-3 text-sm text-[var(--color-gold)]">
                        📝 {order.notes}
                      </p>
                    )}

                    <div className="mb-4 text-sm text-[var(--color-text-secondary)]">
                      <p>📞 {order.deliveryPhone}</p>
                      {order.deliveryAddress && (
                        <p>
                          📍 {order.deliveryAddress}, {order.deliveryCity}
                        </p>
                      )}
                    </div>

                    {nextStatus && (
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            id: order.id,
                            status: nextStatus,
                          })
                        }
                        disabled={updateStatus.isPending}
                        className="w-full rounded-lg bg-[var(--color-brand)] py-3 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
                      >
                        → {statusConfig[nextStatus]?.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus(null)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              filterStatus === null
                ? "bg-[var(--color-brand)] text-white shadow-lg"
                : "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            }`}
          >
            Všetky
          </button>
          {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                filterStatus === status
                  ? "bg-[var(--color-brand)] text-white shadow-lg"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              }`}
            >
              {statusConfig[status]?.label}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-[var(--color-bg-warm)]"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-16 text-center shadow-sm">
            <p className="text-[var(--color-text-secondary)]">
              _Žiadne objednávky
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
            <table className="w-full">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-warm)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Zákazník
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Položky
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Suma
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Stav
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Čas
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--color-bg-warm)]"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-text)]">
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : `${(order as { guestFirstName?: string }).guestFirstName ?? ""} ${(order as { guestLastName?: string }).guestLastName ?? ""}`}
                          {!order.customer && (
                            <span className="ml-2 rounded bg-[var(--color-bg-warm)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]">
                              Hosť
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {order.customer?.user.email ??
                            (order as { guestEmail?: string }).guestEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                        {order.items
                          .map((i) => `${i.quantity}× ${i.product.name}`)
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--color-brand)]">
                        {Number(order.totalPrice).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                        {new Date(order.createdAt).toLocaleString("sk-SK", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {nextStatus && (
                            <button
                              onClick={() =>
                                updateStatus.mutate({
                                  id: order.id,
                                  status: nextStatus,
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
                            >
                              → {statusConfig[nextStatus]?.label}
                            </button>
                          )}
                          {order.status !== "CANCELLED" &&
                            order.status !== "DELIVERED" && (
                              <button
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: order.id,
                                    status: "CANCELLED",
                                  })
                                }
                                disabled={updateStatus.isPending}
                                className="rounded-lg border border-red-500/30 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                              >
                                Zrušiť
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
