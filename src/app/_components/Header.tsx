"use client";

import Link from "next/link";
import { useCart } from "@/context/cart";
import { api } from "@/trpc/react";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const { totalItems, toggleCart } = useCart();
  const { data: session } = api.auth.getSession.useQuery();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <motion.span
            className="text-2xl font-light tracking-[0.15em] text-[var(--color-text)]"
            whileHover={{ scale: 1.02 }}
          >
            PRIMA
            <span className="font-semibold text-[var(--color-brand)]">
              VERA
            </span>
          </motion.span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/menu"
            className="text-sm font-medium tracking-wide text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-brand)]"
          >
            Menu
          </Link>
          {session?.user && (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium tracking-wide text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-brand)]"
              >
                Objednávky
              </Link>
              <Link
                href="/loyalty"
                className="text-sm font-medium tracking-wide text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-brand)]"
              >
                Vernostný klub
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart button */}
          <motion.button
            onClick={toggleCart}
            className="relative flex h-11 items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 font-medium text-white"
            aria-label="Otvoriť košík"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              animate={totalItems > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
              key={totalItems}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </motion.svg>
            <AnimatePresence mode="wait">
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  className="text-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Auth */}
          {session?.user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-warm)] text-sm font-medium text-[var(--color-text)]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </motion.div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="hidden rounded-full border border-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-text)] hover:text-white sm:block"
              >
                Prihlásiť sa
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
