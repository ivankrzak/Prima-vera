"use client";

import Link from "next/link";
import * as motion from "motion/react-client";
import { api } from "@/trpc/react";
import { useCart } from "@/context/cart";
import Image from "next/image";
import { useState } from "react";

function PizzaPreview() {
  const { data: products, isLoading } = api.menu.list.useQuery();
  const { addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Get top 8 pizzas
  const pizzas =
    products?.filter((p) => p.category === "pizza").slice(0, 8) ?? [];

  const handleAddToCart = (product: (typeof pizzas)[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  if (isLoading) {
    return (
      <section className="bg-[var(--color-bg-alt)] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-terracotta)] border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-bg-alt)] py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block text-4xl">🍕</span>
          <h2 className="font-heading text-3xl font-bold text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Naše obľúbené pizze
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
            Ochutnajte naše najobľúbenejšie pizze pripravené z čerstvých
            talianskych surovín
          </p>
        </motion.div>

        {/* Pizza Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pizzas.map((pizza, index) => (
            <motion.div
              key={pizza.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-[var(--color-bg)]">
                {pizza.imageUrl ? (
                  <Image
                    src={pizza.imageUrl}
                    alt={pizza.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl">
                    🍕
                  </div>
                )}

                {/* Quick Add Button Overlay */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(pizza)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-[var(--color-terracotta)] px-6 py-3 font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
                >
                  {addedItems.has(pizza.id) ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Pridané
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Do košíka
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-[var(--color-text)]">
                  {pizza.name}
                </h3>
                {pizza.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                    {pizza.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-[var(--color-terracotta)]">
                    €{Number(pizza.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/menu"
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-olive)] px-8 py-4 font-semibold text-white transition-all hover:bg-[var(--color-olive-dark)] hover:shadow-lg"
          >
            <span>Zobraziť celé menu</span>
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden bg-[var(--color-bg)]">
        {/* Subtle Italian pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c45c3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Decorative olive branch */}
          <motion.div
            className="mb-6 text-5xl"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            🌿
          </motion.div>

          {/* Badge */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-5 py-2 text-sm font-medium text-[var(--color-accent)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-[var(--color-accent)]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            OTVORENÉ DO 22:00
          </motion.div>

          <motion.h1
            className="text-5xl leading-tight font-light tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span className="block">Autentická talianska</span>
            <motion.span
              className="mt-2 block font-serif text-[var(--color-brand)] italic"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              pizza
            </motion.span>
            <motion.span
              className="mt-4 block text-xl font-normal tracking-wide text-[var(--color-text-secondary)] sm:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              s láskou pripravená v Košiciach
            </motion.span>
          </motion.h1>

          <motion.div
            className="mx-auto mt-6 h-px w-24 bg-[var(--color-brand)]"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          <motion.p
            className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Čerstvé ingrediencie · Tradičné recepty · Rýchle doručenie
            <br />
            <span className="font-medium text-[var(--color-gold)]">
              10 bodov za každé €1
            </span>{" "}
            – zbierajte a šetrite!
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/menu"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-[var(--color-brand)] px-10 text-lg font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)] hover:shadow-xl"
              >
                Objednať teraz
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/menu"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-[var(--color-text)] px-10 text-lg font-medium text-[var(--color-text)] transition-all hover:bg-[var(--color-text)] hover:text-white"
              >
                Prezrieť menu
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-24 grid grid-cols-3 gap-8 border-t border-[var(--color-border)] pt-12 text-center sm:gap-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.3 }}
            >
              <div className="text-3xl font-light text-[var(--color-text)] sm:text-4xl">
                15+
              </div>
              <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                druhov pizze
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
            >
              <div className="text-3xl font-light text-[var(--color-brand)] sm:text-4xl">
                45
              </div>
              <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                minút doručenie
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.5 }}
            >
              <div className="text-3xl font-light text-[var(--color-text)] sm:text-4xl">
                4.9★
              </div>
              <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                hodnotenie
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pizza Preview Section */}
      <PizzaPreview />

      {/* Features Section */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-warm)] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-light text-[var(--color-text)] sm:text-4xl">
              Prečo{" "}
              <span className="font-serif text-[var(--color-brand)] italic">
                PrimaVera
              </span>
              ?
            </h2>
            <motion.div
              className="mx-auto mt-4 h-px bg-[var(--color-brand)]"
              initial={{ width: 0 }}
              whileInView={{ width: 64 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                emoji: "🍅",
                title: "Čerstvé suroviny",
                desc: "Každý deň čerstvé paradajky San Marzano, pravá mozzarella di bufala a voňavé bylinky.",
                bgColor: "bg-[var(--color-brand)]/10",
              },
              {
                emoji: "👨‍🍳",
                title: "Tradičné recepty",
                desc: "Autentické talianske recepty, pečené v peci na drevo podľa neapolskej tradície.",
                bgColor: "bg-[var(--color-accent)]/10",
              },
              {
                emoji: "🚀",
                title: "Rýchle doručenie",
                desc: "Horúca pizza u vás do 45 minút. Sledujte stav objednávky v reálnom čase.",
                bgColor: "bg-[var(--color-gold)]/20",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-sm transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${feature.bgColor} text-3xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.emoji}
                </motion.div>
                <h3 className="text-xl font-medium text-[var(--color-text)]">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--color-brand)] py-20">
        <motion.div
          className="mx-auto max-w-4xl px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-6 text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🍕
          </motion.div>
          <h2 className="text-3xl font-light text-white sm:text-4xl">
            Pripravení na autentický
            <br />
            taliansky zážitok?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Zaregistrujte sa a získajte{" "}
            <span className="font-semibold text-white">100 bodov zadarmo</span>{" "}
            na prvú objednávku!
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-white px-10 text-lg font-medium text-[var(--color-brand)] shadow-lg transition-all hover:shadow-xl"
            >
              Začať zbierať body
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
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Map Section */}
      <section className="bg-[var(--color-bg)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="mb-4 inline-block text-4xl">📍</span>
              <h2 className="font-heading text-3xl font-bold text-[var(--color-text)] md:text-4xl">
                Navštívte nás v Košiciach-Barca
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
                Príďte ochutnať pravú taliansku pizzu priamo z našej pece.
                Nájdete nás na Hlavnej ulici, kde vás privítame s úsmevom a
                vôňou čerstvo upečenej pizze.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    🏠
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      Svätého Ladislava 2, 040 14 Košice
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Pekáreň Barca
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    🕐
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      Po-Ne: 10:00 - 22:00
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Otvorené každý deň
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    📞
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      +421 900 123 456
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Rezervácie a objednávky
                    </p>
                  </div>
                </div>
              </div>

              <motion.a
                href="https://maps.google.com/?q=Pekáreň+Barca+Svätého+Ladislava+2+Košice"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 font-medium text-white transition-all hover:bg-[var(--color-brand-dark)] hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Otvoriť v Google Maps
              </motion.a>
            </motion.div>

            {/* Map Embed */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2633.5!2d21.2789!3d48.6892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ee1a3b5b5b5b5%3A0x400f7d1c6978bd0!2sSv%C3%A4t%C3%A9ho%20Ladislava%202%2C%20040%2014%20Ko%C5%A1ice-Barca!5e0!3m2!1ssk!2ssk!4v1705936000000!5m2!1ssk!2ssk"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title="PrimaVera lokácia"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-2xl bg-[var(--color-brand)]/10" />
              <div className="absolute -top-2 -right-2 text-4xl">🍕</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-warm)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-xl font-light tracking-wider text-[var(--color-text)]">
                PRIMA
                <span className="font-medium text-[var(--color-brand)]">
                  VERA
                </span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Pravá talianska pizza v Košiciach od roku 2024.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--color-text)]">Menu</h4>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
                <li>
                  <Link
                    href="/menu"
                    className="transition-colors hover:text-[var(--color-brand)]"
                  >
                    Pizza
                  </Link>
                </li>
                <li>
                  <Link
                    href="/menu"
                    className="transition-colors hover:text-[var(--color-brand)]"
                  >
                    Nápoje
                  </Link>
                </li>
                <li>
                  <Link
                    href="/menu"
                    className="transition-colors hover:text-[var(--color-brand)]"
                  >
                    Prílohy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--color-text)]">Účet</h4>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
                <li>
                  <Link
                    href="/orders"
                    className="transition-colors hover:text-[var(--color-brand)]"
                  >
                    Moje objednávky
                  </Link>
                </li>
                <li>
                  <Link
                    href="/loyalty"
                    className="transition-colors hover:text-[var(--color-brand)]"
                  >
                    Vernostný program
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--color-text)]">Kontakt</h4>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-brand)]">📍</span> Svätého
                  Ladislava 2, Košice-Barca
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-brand)]">📞</span> +421 900
                  123 456
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-brand)]">✉️</span>{" "}
                  info@primavera.sk
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} PrimaVera. Všetky práva vyhradené.
          </div>
        </div>
      </footer>
    </>
  );
}
