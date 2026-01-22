"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = api.auth.getSession.useQuery();

  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_ON_DELIVERY" | "CARD_ON_DELIVERY"
  >("CASH_ON_DELIVERY");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Košice");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Guest checkout fields
  const [guestEmail, setGuestEmail] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");

  const isGuest = !session?.user;

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      router.push(`/orders/${order.id}/success`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Košík je prázdny");
      return;
    }

    if (deliveryType === "DELIVERY" && (!address || !city)) {
      setError("Vyplňte adresu doručenia");
      return;
    }

    if (!phone) {
      setError("Vyplňte telefónne číslo");
      return;
    }

    // Validate guest fields
    if (isGuest && (!guestEmail || !guestFirstName)) {
      setError("Vyplňte meno a email");
      return;
    }

    createOrder.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryType,
      paymentMethod,
      deliveryAddress: address,
      deliveryCity: city,
      deliveryPostalCode: postalCode,
      deliveryPhone: phone,
      notes: notes || undefined,
      // Guest fields
      guestEmail: isGuest ? guestEmail : undefined,
      guestFirstName: isGuest ? guestFirstName : undefined,
      guestLastName: isGuest ? guestLastName || undefined : undefined,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg)] px-4 py-12">
        <div className="text-center">
          <div className="mb-6 text-6xl">🛒</div>
          <h1 className="mb-4 text-2xl font-medium text-[var(--color-text)]">
            Košík je prázdny
          </h1>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            Pridajte si niečo z nášho menu.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-8 py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)]"
          >
            Prejsť na menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-light text-[var(--color-text)]">
            Dokončenie{" "}
            <span className="font-serif text-[var(--color-brand)] italic">
              objednávky
            </span>
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[var(--color-brand)]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest info (only for non-logged in users) */}
            {isGuest && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--color-text)]">
                    Kontaktné údaje
                  </label>
                  <Link
                    href="/login"
                    className="text-sm text-[var(--color-brand)] hover:underline"
                  >
                    Máte účet? Prihláste sa
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={guestFirstName}
                      onChange={(e) => setGuestFirstName(e.target.value)}
                      placeholder="Meno *"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      value={guestLastName}
                      onChange={(e) => setGuestLastName(e.target.value)}
                      placeholder="Priezvisko"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Delivery type */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <label className="mb-4 block text-sm font-medium text-[var(--color-text)]">
                Spôsob prevzatia
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                    deliveryType === "DELIVERY"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "DELIVERY"}
                    onChange={() => setDeliveryType("DELIVERY")}
                    className="sr-only"
                  />
                  <span className="text-xl">🚴</span>
                  <span className="font-medium">Doručenie</span>
                </label>
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                    deliveryType === "PICKUP"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === "PICKUP"}
                    onChange={() => setDeliveryType("PICKUP")}
                    className="sr-only"
                  />
                  <span className="text-xl">🏪</span>
                  <span className="font-medium">Osobný odber</span>
                </label>
              </div>
            </div>

            {/* Delivery address (only for delivery) */}
            {deliveryType === "DELIVERY" && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
                <label className="mb-4 block text-sm font-medium text-[var(--color-text)]">
                  Adresa doručenia
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ulica a číslo domu *"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mesto *"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="PSČ (napr. 040 01)"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <label className="mb-4 block text-sm font-medium text-[var(--color-text)]">
                Telefónne číslo *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+421 9XX XXX XXX"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
                required
              />
            </div>

            {/* Payment method */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <label className="mb-4 block text-sm font-medium text-[var(--color-text)]">
                Spôsob platby
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className="sr-only"
                  />
                  <span className="text-xl">💵</span>
                  <span className="font-medium">Hotovosť</span>
                </label>
                <label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all ${
                    paymentMethod === "CARD_ON_DELIVERY"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "CARD_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CARD_ON_DELIVERY")}
                    className="sr-only"
                  />
                  <span className="text-xl">💳</span>
                  <span className="font-medium">Kartou</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
              <label className="mb-4 block text-sm font-medium text-[var(--color-text)]">
                Poznámka k objednávke
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Napr. zvoniť 2x, bez cibule..."
                rows={3}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:outline-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createOrder.isPending ? "Odosielam..." : "Objednať a zaplatiť"}
              {!createOrder.isPending && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-6 text-lg font-medium text-[var(--color-text)]">
              Zhrnutie objednávky
            </h2>

            <ul className="mb-6 space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-[var(--color-text)]">
                      {item.name}
                    </span>
                    <span className="ml-2 text-[var(--color-text-secondary)]">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="font-medium text-[var(--color-text)]">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between text-xl">
                <span className="font-medium text-[var(--color-text)]">
                  Spolu:
                </span>
                <span className="font-semibold text-[var(--color-brand)]">
                  {totalPrice.toFixed(2)} €
                </span>
              </div>
              {!isGuest && (
                <p className="mt-3 flex items-center gap-2 text-sm text-[var(--color-accent)]">
                  <span>⭐</span>+ {Math.floor(totalPrice * 10)} bodov do
                  vernostného programu
                </p>
              )}
              {isGuest && (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  <Link
                    href="/login"
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Prihláste sa
                  </Link>{" "}
                  a získajte body do vernostného programu
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
