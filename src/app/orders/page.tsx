"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Čaká na potvrdenie",
    color:
      "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
  CONFIRMED: {
    label: "Potvrdená",
    color: "border-blue-500/30 bg-blue-50 text-blue-600",
  },
  PREPARING: {
    label: "Pripravuje sa",
    color: "border-purple-500/30 bg-purple-50 text-purple-600",
  },
  READY: {
    label: "Pripravená",
    color:
      "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  },
  OUT_FOR_DELIVERY: {
    label: "Na ceste",
    color:
      "border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
  },
  DELIVERED: {
    label: "Doručená",
    color:
      "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  },
  CANCELLED: {
    label: "Zrušená",
    color: "border-red-500/30 bg-red-50 text-red-600",
  },
};

export default function OrdersPage() {
  const { data: session } = api.auth.getSession.useQuery();
  const { data, isLoading } = api.order.myOrders.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (!session?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg)] px-4 py-12">
        <div className="text-center">
          <div className="mb-6 text-6xl">🔐</div>
          <h1 className="mb-4 text-2xl font-medium text-[var(--color-text)]">
            Prihlásenie vyžadované
          </h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Pre zobrazenie objednávok sa musíte prihlásiť.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-8 py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)]"
          >
            Prihlásiť sa
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h1 className="mb-8 text-3xl font-light text-[var(--color-text)]">
            Moje objednávky
          </h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-[var(--color-bg-warm)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-light text-[var(--color-text)]">
            Moje{" "}
            <span className="font-serif text-[var(--color-brand)] italic">
              objednávky
            </span>
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[var(--color-brand)]" />
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-16 text-center shadow-sm">
            <div className="mx-auto mb-6 text-6xl">📦</div>
            <h2 className="mb-3 text-xl font-medium text-[var(--color-text)]">
              Zatiaľ žiadne objednávky
            </h2>
            <p className="mb-8 text-[var(--color-text-secondary)]">
              Objednajte si svoju prvú pizzu!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-8 py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)]"
            >
              Prejsť na menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusLabels[order.status] ?? {
                label: order.status,
                color: "border-gray-500/30 bg-gray-500/10 text-gray-400",
              };

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <h2 className="text-lg font-medium text-[var(--color-text)]">
                          Objednávka #{order.orderNumber}
                        </h2>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {new Date(order.createdAt).toLocaleDateString("sk-SK", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[var(--color-brand)]">
                        {Number(order.totalPrice).toFixed(2)} €
                      </p>
                      {order.pointsEarned > 0 && (
                        <p className="text-sm text-[var(--color-accent)]">
                          +{order.pointsEarned} bodov
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4">
                    <ul className="space-y-2 text-sm">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between text-[var(--color-text-secondary)]"
                        >
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="text-[var(--color-text)]">
                            {(Number(item.priceAtTime) * item.quantity).toFixed(
                              2,
                            )}{" "}
                            €
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.deliveryAddress && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-brand)]">📍</span>
                      {order.deliveryAddress}, {order.deliveryCity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
