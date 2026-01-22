"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export default function LoyaltyPage() {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: balance, isLoading: balanceLoading } =
    api.loyalty.getBalance.useQuery(undefined, {
      enabled: !!session?.user,
    });
  const { data: history, isLoading: historyLoading } =
    api.loyalty.history.useQuery(undefined, {
      enabled: !!session?.user,
    });
  const { data: programInfo } = api.loyalty.programInfo.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (!session?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg)] px-4 py-12">
        <div className="text-center">
          <div className="mb-6 text-6xl">⭐</div>
          <h1 className="mb-4 text-2xl font-medium text-[var(--color-text)]">
            Vernostný program
          </h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Prihláste sa a zbierajte body za každú objednávku!
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

  const isLoading = balanceLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="h-48 animate-pulse rounded-2xl bg-[var(--color-bg-warm)]" />
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    Bronze: "from-[#CD7F32] to-[#B87333]",
    Silver: "from-[#C0C0C0] to-[#A8A8A8]",
    Gold: "from-[var(--color-gold)] to-[#B8942A]",
    Platinum: "from-[#E5E4E2] to-[#C9C8C6]",
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-light text-[var(--color-text)]">
            Vernostný{" "}
            <span className="font-serif text-[var(--color-brand)] italic">
              program
            </span>
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[var(--color-brand)]" />
        </div>

        {/* Points balance card */}
        <div
          className={`mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${tierColors[balance?.tier ?? "Bronze"]} p-8 text-white shadow-xl`}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mb-1 text-sm font-medium opacity-80">
                Váš zostatok
              </p>
              <p className="text-6xl font-light">
                {balance?.pointsBalance ?? 0}
              </p>
              <p className="text-lg font-medium">bodov</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-sm font-medium opacity-80">Úroveň</p>
              <p className="text-4xl font-light">{balance?.tier ?? "Bronze"}</p>
              {balance?.pointsToNextTier && (
                <p className="mt-1 text-sm opacity-80">
                  {balance.pointsToNextTier} bodov do ďalšej úrovne
                </p>
              )}
            </div>
          </div>

          {/* Progress bar to next tier */}
          {balance?.pointsToNextTier && (
            <div className="mt-8">
              <div className="h-3 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${Math.min(100, (1 - balance.pointsToNextTier / getNextTierThreshold(balance.tier)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-medium text-[var(--color-text)]">
            Ako to funguje?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-3xl">
                🍕
              </div>
              <h3 className="mb-2 font-medium text-[var(--color-text)]">
                Objednajte
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Za každé 1 € získate{" "}
                <span className="text-[var(--color-brand)]">
                  {programInfo?.pointsPerEur ?? 10} bodov
                </span>
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-3xl">
                ⭐
              </div>
              <h3 className="mb-2 font-medium text-[var(--color-text)]">
                Zbierajte
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Body sa automaticky pripíšu po doručení
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)]/20 text-3xl">
                🎁
              </div>
              <h3 className="mb-2 font-medium text-[var(--color-text)]">
                Uplatňujte
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-brand)]">
                  {programInfo?.pointsPerEurDiscount ?? 100} bodov = 1 €
                </span>{" "}
                zľava
              </p>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-medium text-[var(--color-text)]">
            Úrovne
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {programInfo?.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border-2 p-5 transition-all ${
                  balance?.tier === tier.name
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-[var(--color-text)]">
                    {tier.name}
                  </h3>
                  {balance?.tier === tier.name && (
                    <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-xs font-medium text-white">
                      Aktuálna
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                  od {tier.minPoints} bodov
                </p>
                <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)]">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-medium text-[var(--color-text)]">
            História bodov
          </h2>
          {history?.transactions.length === 0 ? (
            <p className="py-8 text-center text-[var(--color-text-secondary)]">
              Zatiaľ žiadne transakcie
            </p>
          ) : (
            <div className="space-y-4">
              {history?.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      {tx.reason}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {new Date(tx.createdAt).toLocaleDateString("sk-SK", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-lg font-semibold ${
                      tx.amount > 0
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-brand)]"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getNextTierThreshold(currentTier: string): number {
  switch (currentTier) {
    case "Bronze":
      return 500;
    case "Silver":
      return 1000; // 1500 - 500
    case "Gold":
      return 3500; // 5000 - 1500
    default:
      return 1;
  }
}
