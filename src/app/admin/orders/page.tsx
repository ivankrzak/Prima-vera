"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Button, Dialog } from "@/components/ui";

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

interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  totalPrice: unknown;
  deliveryType: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryPhone: string | null;
  notes: string | null;
  createdAt: Date;
  customer: {
    firstName: string;
    lastName: string;
    user: { email: string | null };
  } | null;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  items: {
    id: string;
    quantity: number;
    priceAtTime: unknown;
    product: { name: string };
  }[];
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as OrderStatus | null;

  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(
    initialStatus,
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const orders = (ordersData?.orders ?? []) as Order[];

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = statusFlow.indexOf(current);
    if (idx >= 0 && idx < statusFlow.length - 1) {
      return statusFlow[idx + 1] ?? null;
    }
    return null;
  };

  const getCustomerName = (order: Order): string => {
    if (order.customer) {
      return `${order.customer.firstName} ${order.customer.lastName}`;
    }
    return (
      `${order.guestFirstName ?? ""} ${order.guestLastName ?? ""}`.trim() ||
      "Hosť"
    );
  };

  const getCustomerEmail = (order: Order): string => {
    return order.customer?.user.email ?? order.guestEmail ?? "";
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Objednávky
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Spravujte objednávky a sledujte ich stav
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-2 h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Obnoviť
        </Button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Dnešné objednávky
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
              {stats.todayOrders}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Dnešné tržby
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-accent)]">
              €{stats.todayRevenue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">Čakajúce</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-gold)]">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Celkom objednávok
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-brand)]">
              {stats.totalOrders}
            </p>
          </div>
        </div>
      )}

      {/* Active orders kanban */}
      {activeOrders && activeOrders.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <h2 className="mb-4 font-semibold text-[var(--color-text)]">
            🔥 Aktívne objednávky ({activeOrders.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeOrders.map((order) => {
              const status = statusConfig[order.status];
              const nextStatus = getNextStatus(order.status);
              const typedOrder = order as unknown as Order;

              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <span className="text-lg font-semibold text-[var(--color-text)]">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                      >
                        {status?.label}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleTimeString("sk-SK", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {getCustomerName(typedOrder)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {order.items
                      .map((i) => `${i.quantity}× ${i.product.name}`)
                      .join(", ")}
                  </p>
                  <p className="mt-2 font-medium text-[var(--color-brand)]">
                    €{Number(order.totalPrice).toFixed(2)}
                  </p>

                  {order.notes && (
                    <p className="mt-2 rounded-lg bg-[var(--color-gold)]/10 p-2 text-xs text-[var(--color-gold)]">
                      📝 {order.notes}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedOrder(typedOrder)}
                    >
                      Detail
                    </Button>
                    {nextStatus && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateStatus.mutate({
                            id: order.id,
                            status: nextStatus,
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        → {statusConfig[nextStatus]?.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-[var(--color-bg-warm)]"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">Žiadne objednávky</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div className="overflow-x-auto">
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
                    Typ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Stav
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">
                    Čas
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text-secondary)]">
                    Akcie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const nextStatus = getNextStatus(order.status);
                  const typedOrder = order as unknown as Order;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-[var(--color-bg-warm)]"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--color-text)]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-text)]">
                          {getCustomerName(typedOrder)}
                          {!order.customer && (
                            <span className="ml-2 rounded bg-[var(--color-bg-warm)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                              Hosť
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {getCustomerEmail(typedOrder)}
                        </p>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate text-sm text-[var(--color-text-secondary)]">
                          {order.items
                            .map((i) => `${i.quantity}× ${i.product.name}`)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--color-brand)]">
                          €{Number(order.totalPrice).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {order.deliveryType === "PICKUP"
                            ? "🏪 Výdaj"
                            : "🚗 Doručenie"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                        {new Date(order.createdAt).toLocaleString("sk-SK", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(typedOrder)}
                          >
                            Detail
                          </Button>
                          {nextStatus && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: order.id,
                                  status: nextStatus,
                                })
                              }
                              disabled={updateStatus.isPending}
                            >
                              → {statusConfig[nextStatus]?.label}
                            </Button>
                          )}
                          {order.status !== "CANCELLED" &&
                            order.status !== "DELIVERED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: order.id,
                                    status: "CANCELLED",
                                  })
                                }
                                disabled={updateStatus.isPending}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Zrušiť
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Objednávka #${selectedOrder.orderNumber}` : ""}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${statusConfig[selectedOrder.status]?.bgColor} ${statusConfig[selectedOrder.status]?.color}`}
              >
                {statusConfig[selectedOrder.status]?.label}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">
                {new Date(selectedOrder.createdAt).toLocaleString("sk-SK")}
              </span>
            </div>

            {/* Customer info */}
            <div className="rounded-lg bg-[var(--color-bg-warm)] p-4">
              <h3 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
                Zákazník
              </h3>
              <p className="font-medium text-[var(--color-text)]">
                {getCustomerName(selectedOrder)}
                {!selectedOrder.customer && (
                  <span className="ml-2 rounded bg-[var(--color-bg-card)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                    Hosť
                  </span>
                )}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {getCustomerEmail(selectedOrder)}
              </p>
              {selectedOrder.deliveryPhone && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  📞 {selectedOrder.deliveryPhone}
                </p>
              )}
            </div>

            {/* Delivery info */}
            <div className="rounded-lg bg-[var(--color-bg-warm)] p-4">
              <h3 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
                Doručenie
              </h3>
              <p className="font-medium text-[var(--color-text)]">
                {selectedOrder.deliveryType === "PICKUP"
                  ? "🏪 Osobný odber"
                  : "🚗 Doručenie na adresu"}
              </p>
              {selectedOrder.deliveryType === "DELIVERY" &&
                selectedOrder.deliveryAddress && (
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {selectedOrder.deliveryAddress},{" "}
                    {selectedOrder.deliveryCity}
                  </p>
                )}
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Platba:{" "}
                {selectedOrder.paymentMethod === "CASH_ON_DELIVERY"
                  ? "💵 Hotovosť"
                  : "💳 Kartou"}
              </p>
            </div>

            {/* Items */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                Položky
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div>
                      <span className="font-medium text-[var(--color-text)]">
                        {item.quantity}× {item.product.name}
                      </span>
                    </div>
                    <span className="text-[var(--color-text-secondary)]">
                      €{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-[var(--color-border)] pt-4">
                <span className="font-medium text-[var(--color-text)]">
                  Celkom
                </span>
                <span className="text-xl font-semibold text-[var(--color-brand)]">
                  €{Number(selectedOrder.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="rounded-lg bg-[var(--color-gold)]/10 p-4">
                <h3 className="mb-1 text-sm font-medium text-[var(--color-gold)]">
                  Poznámka
                </h3>
                <p className="text-sm text-[var(--color-text)]">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            {selectedOrder.status !== "DELIVERED" &&
              selectedOrder.status !== "CANCELLED" && (
                <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        const next = getNextStatus(selectedOrder.status);
                        if (next) {
                          updateStatus.mutate({
                            id: selectedOrder.id,
                            status: next,
                          });
                          setSelectedOrder(null);
                        }
                      }}
                      disabled={updateStatus.isPending}
                    >
                      Posunúť na:{" "}
                      {
                        statusConfig[getNextStatus(selectedOrder.status)!]
                          ?.label
                      }
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => {
                      updateStatus.mutate({
                        id: selectedOrder.id,
                        status: "CANCELLED",
                      });
                      setSelectedOrder(null);
                    }}
                    disabled={updateStatus.isPending}
                  >
                    Zrušiť objednávku
                  </Button>
                </div>
              )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
