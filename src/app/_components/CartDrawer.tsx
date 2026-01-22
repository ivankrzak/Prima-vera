"use client";

import { useCart } from "@/context/cart";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-[var(--color-text)]/30 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    Váš košík
                  </h2>
                  <motion.div
                    className="mt-1 h-0.5 bg-[var(--color-brand)]"
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  />
                </div>
                <motion.button
                  onClick={() => setCartOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)]"
                  aria-label="Zavrieť košík"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
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
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-bg-warm)] text-4xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🛒
                    </motion.div>
                    <p className="text-lg font-medium text-[var(--color-text)]">
                      Váš košík je prázdny
                    </p>
                    <p className="mt-2 text-[var(--color-text-secondary)]">
                      Objavte naše lahodné talianske špeciality
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/menu"
                        onClick={() => setCartOpen(false)}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 font-medium text-white transition-all hover:bg-[var(--color-brand-dark)]"
                      >
                        Prezrieť menu
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <ul className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((item, index) => (
                        <motion.li
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: 50, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -50, scale: 0.8 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            layout: {
                              type: "spring",
                              damping: 25,
                              stiffness: 300,
                            },
                          }}
                          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-sm"
                        >
                          {/* Product info */}
                          <div className="flex-1">
                            <h3 className="font-medium text-[var(--color-text)]">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-[var(--color-brand)]">
                              {item.price.toFixed(2)} €
                            </p>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-1">
                            <motion.button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              −
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              className="w-8 text-center font-medium text-[var(--color-text)]"
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              +
                            </motion.button>
                          </div>

                          {/* Remove button */}
                          <motion.button
                            onClick={() => removeItem(item.productId)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label="Odstrániť položku"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </motion.button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Footer */}
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.div
                    className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                      <span>Počet položiek:</span>
                      <motion.span
                        key={items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                        initial={{ scale: 1.3, color: "var(--color-brand)" }}
                        animate={{
                          scale: 1,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {items.reduce((sum, item) => sum + item.quantity, 0)}
                      </motion.span>
                    </div>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-medium text-[var(--color-text)]">
                        Celkom:
                      </span>
                      <motion.span
                        key={totalPrice}
                        className="text-2xl font-semibold text-[var(--color-brand)]"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {totalPrice.toFixed(2)} €
                      </motion.span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/checkout"
                        onClick={() => setCartOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)] hover:shadow-xl"
                      >
                        Pokračovať k objednávke
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
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
