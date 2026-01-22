"use client";

import { api } from "@/trpc/react";
import { useCart } from "@/context/cart";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function MenuPage() {
  const { data: products, isLoading } = api.menu.list.useQuery();
  const { data: categories } = api.menu.categories.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category === selectedCategory)
    : products;

  const categoryLabels: Record<string, string> = {
    pizza: "🍕 Pizza",
    drink: "🥤 Nápoje",
    side: "🍟 Prílohy",
    dessert: "🍰 Dezerty",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl bg-[var(--color-bg-warm)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            Naše{" "}
            <span className="font-serif text-[var(--color-brand)] italic">
              Menu
            </span>
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[var(--color-brand)]" />
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            Čerstvá pizza pripravená s láskou • 100% kvalitné ingrediencie
          </p>
        </div>

        {/* Category filter */}
        {categories && categories.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-[var(--color-brand)] text-white shadow-lg"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              }`}
            >
              Všetko
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[var(--color-brand)] text-white shadow-lg"
                    : "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                }`}
              >
                {categoryLabels[category] ?? category}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="py-16 text-center text-[var(--color-text-secondary)]">
            Žiadne produkty v tejto kategórii
          </div>
        )}
      </div>
    </div>
  );
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  price: number | { toNumber: () => number } | unknown;
  imageUrl: string | null;
  category: string;
  available: boolean;
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, setCartOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle Prisma Decimal type
  const price =
    typeof product.price === "number"
      ? product.price
      : typeof product.price === "object" &&
          product.price !== null &&
          "toNumber" in product.price
        ? (product.price as { toNumber: () => number }).toNumber()
        : Number(product.price);

  const handleAddToCart = () => {
    setIsAdding(true);
    setShowSuccess(true);

    addItem({
      productId: product.id,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
    });

    // Brief visual feedback
    setTimeout(() => {
      setIsAdding(false);
      setCartOpen(true);
    }, 600);

    setTimeout(() => {
      setShowSuccess(false);
    }, 1000);
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-accent)]/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="flex flex-col items-center text-white"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </motion.div>
              <motion.p
                className="mt-2 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Pridané do košíka!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-warm)]">
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.div
            className="flex h-full items-center justify-center text-7xl opacity-80"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {product.category === "pizza" && "🍕"}
            {product.category === "drink" && "🥤"}
            {product.category === "side" && "🍟"}
            {product.category === "dessert" && "🍰"}
          </motion.div>
        )}

        {/* Price badge */}
        <motion.div
          className="absolute top-4 left-4 rounded-full bg-[var(--color-brand)] px-4 py-1.5 text-sm font-bold text-white shadow-lg"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {price.toFixed(2)} €
        </motion.div>

        {/* Add to cart overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[var(--color-text)]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`mb-6 flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white ${
              isAdding ? "bg-[var(--color-accent)]" : "bg-[var(--color-brand)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAdding ? (
              <>
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </motion.svg>
                Pridané!
              </>
            ) : (
              <>
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Do košíka
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-medium text-[var(--color-text)]">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
            {product.description}
          </p>
        )}

        {product.ingredients.length > 0 && (
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]/70">
            {product.ingredients.join(" • ")}
          </p>
        )}
      </div>

      {/* Quick add button (mobile) */}
      <motion.button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg sm:hidden ${
          isAdding ? "bg-[var(--color-accent)]" : "bg-[var(--color-brand)]"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.svg
              key="check"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="plus"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
