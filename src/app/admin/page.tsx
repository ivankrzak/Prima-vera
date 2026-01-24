"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import { Button, buttonVariants } from "@/components/ui";

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
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  href?: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const content = (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
          <p
            className="mt-2 text-3xl font-semibold"
            style={{ color: color ?? "var(--color-text)" }}
          >
            {value}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: `${color ?? "var(--color-brand)"}20` }}
        >
          <div style={{ color: color ?? "var(--color-brand)" }}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function AdminDashboardPage() {
  const { data: orderStats } = api.order.stats.useQuery();
  const { data: customerStats } = api.customer.stats.useQuery();
  const { data: activeOrders } = api.order.activeOrders.useQuery();
  const { data: products } = api.menu.list.useQuery({
    includeUnavailable: true,
  });

  const todayRevenue = orderStats?.todayRevenue ?? 0;
  const todayOrders = orderStats?.todayOrders ?? 0;
  const pendingOrders = orderStats?.pendingOrders ?? 0;
  const totalProducts = products?.length ?? 0;
  const totalCustomers = customerStats?.totalCustomers ?? 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Prehľad vášho podnikania
          </p>
        </div>
        <Link
          href="/admin/products"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-1 h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Pridať produkt
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Dnešné tržby"
          value={`€${Number(todayRevenue).toFixed(2)}`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
              />
            </svg>
          }
          color="var(--color-accent)"
        />
        <StatCard
          title="Dnešné objednávky"
          value={todayOrders}
          href="/admin/orders"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          }
          color="var(--color-brand)"
        />
        <StatCard
          title="Čakajúce"
          value={pendingOrders}
          href="/admin/orders?status=PENDING"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
          color="var(--color-gold)"
        />
        <StatCard
          title="Produkty"
          value={totalProducts}
          href="/admin/products"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          }
          color="#8b5cf6"
        />
      </div>

      {/* Active orders */}
      {activeOrders && activeOrders.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              🔥 Aktívne objednávky ({activeOrders.length})
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-[var(--color-brand)] hover:underline"
            >
              Zobraziť všetky →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeOrders.slice(0, 6).map((order) => {
              const status = statusConfig[order.status];
              const customerName = order.customer
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : "Hosť";

              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text)]">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                    >
                      {status?.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {customerName}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-secondary)]">
                    {order.items
                      .map((i) => `${i.quantity}× ${i.product.name}`)
                      .join(", ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-medium text-[var(--color-brand)]">
                      €{Number(order.totalPrice).toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleTimeString("sk-SK", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-md"
        >
          <div className="rounded-lg bg-[var(--color-brand)]/10 p-3 text-[var(--color-brand)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">Objednávky</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Spravovať objednávky
            </p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-md"
        >
          <div className="rounded-lg bg-purple-500/10 p-3 text-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">Produkty</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Spravovať menu
            </p>
          </div>
        </Link>

        <Link
          href="/admin/customers"
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-md"
        >
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">Zákazníci</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {totalCustomers} registrovaných
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-md"
        >
          <div className="rounded-lg bg-[var(--color-accent)]/10 p-3 text-[var(--color-accent)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">
              Zobraziť obchod
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Otvoriť v novom okne
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
