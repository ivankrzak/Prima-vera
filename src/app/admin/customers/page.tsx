"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button, Input, DataTable, Dialog, type Column } from "@/components/ui";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  pointsBalance: number;
  createdAt: Date;
  user: {
    email: string | null;
    createdAt: Date;
  };
  orders: {
    id: string;
    totalPrice: unknown;
    status: string;
    createdAt: Date;
  }[];
  totalSpent: number;
  orderCount: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Nová",
    color: "text-[var(--color-gold)]",
    bgColor: "bg-[var(--color-gold)]/10",
  },
  CONFIRMED: {
    label: "Potvrdená",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  PREPARING: {
    label: "Pripravuje sa",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  READY: {
    label: "Pripravená",
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent)]/10",
  },
  OUT_FOR_DELIVERY: {
    label: "Na ceste",
    color: "text-[var(--color-brand)]",
    bgColor: "bg-[var(--color-brand)]/10",
  },
  DELIVERED: {
    label: "Doručená",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  CANCELLED: { label: "Zrušená", color: "text-red-600", bgColor: "bg-red-50" },
};

export default function AdminCustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");

  const utils = api.useUtils();

  const { data: customersData, isLoading } = api.customer.list.useQuery();
  const { data: stats } = api.customer.stats.useQuery();

  const updatePointsMutation = api.customer.updatePoints.useMutation({
    onSuccess: () => {
      void utils.customer.list.invalidate();
      void utils.customer.getById.invalidate();
      setPointsDialogOpen(false);
      setPointsAmount("");
      setPointsReason("");
    },
  });

  const customers = customersData?.customers ?? [];

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Zákazník",
      sortable: true,
      render: (customer) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {customer.user.email}
          </p>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "Telefón",
      render: (customer) => (
        <span className="text-[var(--color-text-secondary)]">
          {customer.phoneNumber || "—"}
        </span>
      ),
    },
    {
      key: "orderCount",
      header: "Objednávky",
      sortable: true,
      className: "text-center",
      render: (customer) => (
        <span className="font-medium text-[var(--color-text)]">
          {customer.orderCount}
        </span>
      ),
    },
    {
      key: "totalSpent",
      header: "Celková útrata",
      sortable: true,
      render: (customer) => (
        <span className="font-medium text-[var(--color-brand)]">
          €{customer.totalSpent.toFixed(2)}
        </span>
      ),
    },
    {
      key: "pointsBalance",
      header: "Body",
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-accent)]">
            {customer.pointsBalance}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(customer);
              setPointsDialogOpen(true);
            }}
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)]"
            title="Upraviť body"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </button>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Registrácia",
      sortable: true,
      render: (customer) => (
        <span className="text-sm text-[var(--color-text-muted)]">
          {new Date(customer.createdAt).toLocaleDateString("sk-SK")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Zákazníci
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Spravujte zákazníkov a ich vernostné body
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Celkom zákazníkov
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
              {stats.totalCustomers}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Tento mesiac
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-accent)]">
              +{stats.customersThisMonth}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Top zákazník
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-brand)]">
              {stats.topSpenders[0]
                ? `${stats.topSpenders[0].firstName} ${stats.topSpenders[0].lastName}`
                : "—"}
            </p>
            {stats.topSpenders[0] && (
              <p className="text-sm text-[var(--color-text-muted)]">
                €{stats.topSpenders[0].totalSpent.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customers table */}
      <DataTable
        data={customers}
        columns={columns}
        keyExtractor={(customer) => customer.id}
        searchable
        searchPlaceholder="Hľadať zákazníkov..."
        searchKeys={["firstName", "lastName"] as (keyof Customer)[]}
        emptyMessage="Žiadni zákazníci"
        isLoading={isLoading}
        actions={(customer) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCustomer(customer)}
          >
            Detail
          </Button>
        )}
      />

      {/* Customer Detail Dialog */}
      <Dialog
        open={!!selectedCustomer && !pointsDialogOpen}
        onClose={() => setSelectedCustomer(null)}
        title={
          selectedCustomer
            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
            : ""
        }
        description={selectedCustomer?.user.email ?? ""}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer info */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--color-bg-warm)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Telefón
                </p>
                <p className="mt-1 font-medium text-[var(--color-text)]">
                  {selectedCustomer.phoneNumber || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-warm)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Celková útrata
                </p>
                <p className="mt-1 font-medium text-[var(--color-brand)]">
                  €{selectedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-warm)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Vernostné body
                </p>
                <p className="mt-1 font-medium text-[var(--color-accent)]">
                  {selectedCustomer.pointsBalance} bodov
                </p>
              </div>
            </div>

            {/* Recent orders */}
            <div>
              <h3 className="mb-3 font-medium text-[var(--color-text)]">
                Posledné objednávky ({selectedCustomer.orderCount})
              </h3>
              {selectedCustomer.orders.length === 0 ? (
                <p className="text-[var(--color-text-muted)]">
                  Žiadne objednávky
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.orders.slice(0, 5).map((order) => {
                    const status = statusConfig[order.status];
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                      >
                        <div>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${status?.bgColor} ${status?.color}`}
                          >
                            {status?.label}
                          </span>
                          <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                            {new Date(order.createdAt).toLocaleDateString(
                              "sk-SK",
                            )}
                          </span>
                        </div>
                        <span className="font-medium text-[var(--color-text)]">
                          €{Number(order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Points Dialog */}
      <Dialog
        open={pointsDialogOpen}
        onClose={() => {
          setPointsDialogOpen(false);
          setPointsAmount("");
          setPointsReason("");
        }}
        title="Upraviť body"
        description={
          selectedCustomer
            ? `Aktuálny zostatok: ${selectedCustomer.pointsBalance} bodov`
            : ""
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setPointsDialogOpen(false);
                setPointsAmount("");
                setPointsReason("");
              }}
            >
              Zrušiť
            </Button>
            <Button
              onClick={() => {
                if (selectedCustomer && pointsAmount && pointsReason) {
                  updatePointsMutation.mutate({
                    customerId: selectedCustomer.id,
                    amount: parseInt(pointsAmount),
                    reason: pointsReason,
                  });
                }
              }}
              isLoading={updatePointsMutation.isPending}
              disabled={!pointsAmount || !pointsReason}
            >
              Uložiť
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Počet bodov"
            type="number"
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            placeholder="100 alebo -50"
            hint="Použite záporné číslo pre odpočet"
          />
          <Input
            label="Dôvod"
            value={pointsReason}
            onChange={(e) => setPointsReason(e.target.value)}
            placeholder="Bonus za registráciu"
          />
        </div>
      </Dialog>
    </div>
  );
}
