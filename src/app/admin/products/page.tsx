"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Dialog,
  ConfirmDialog,
  DataTable,
  type Column,
} from "@/components/ui";
import { MediaExplorerDialog } from "@/components/admin/MediaExplorerDialog";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  price: number | { toNumber: () => number };
  imageUrl: string | null;
  category: string;
  available: boolean;
  sortOrder: number;
}

const categoryOptions = [
  { value: "pizza", label: "Pizza" },
  { value: "drink", label: "Nápoje" },
  { value: "side", label: "Prílohy" },
  { value: "dessert", label: "Dezerty" },
];

interface ProductFormData {
  name: string;
  description: string;
  ingredients: string;
  price: string;
  imageUrl: string;
  category: string;
  available: boolean;
  sortOrder: string;
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  ingredients: "",
  price: "",
  imageUrl: "",
  category: "pizza",
  available: true,
  sortOrder: "0",
};

export default function AdminProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const utils = api.useUtils();

  const { data: products, isLoading } = api.menu.list.useQuery({
    includeUnavailable: true,
  });

  const createMutation = api.menu.create.useMutation({
    onSuccess: () => {
      void utils.menu.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.menu.update.useMutation({
    onSuccess: () => {
      void utils.menu.list.invalidate();
      setEditingProduct(null);
      resetForm();
    },
  });

  const deleteMutation = api.menu.delete.useMutation({
    onSuccess: () => {
      void utils.menu.list.invalidate();
      setDeleteProduct(null);
    },
  });

  const toggleMutation = api.menu.toggleAvailability.useMutation({
    onSuccess: () => {
      void utils.menu.list.invalidate();
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
  };

  const openEditDialog = (product: Product) => {
    const price =
      typeof product.price === "number"
        ? product.price
        : product.price.toNumber();

    setFormData({
      name: product.name,
      description: product.description ?? "",
      ingredients: product.ingredients.join(", "),
      price: price.toString(),
      imageUrl: product.imageUrl ?? "",
      category: product.category,
      available: product.available,
      sortOrder: product.sortOrder.toString(),
    });
    setEditingProduct(product);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Názov je povinný";
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = "Cena musí byť kladné číslo";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "Neplatná URL adresa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      ingredients: formData.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl.trim() || undefined,
      category: formData.category,
      available: formData.available,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getPrice = (product: Product): number => {
    return typeof product.price === "number"
      ? product.price
      : product.price.toNumber();
  };

  const columns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      className: "w-16",
      render: (product) => (
        <div className="h-12 w-12 overflow-hidden rounded-lg bg-[var(--color-bg-warm)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🍕
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Názov",
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{product.name}</p>
          {product.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-muted)]">
              {product.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategória",
      sortable: true,
      render: (product) => (
        <span className="rounded-full bg-[var(--color-bg-warm)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {categoryOptions.find((c) => c.value === product.category)?.label ??
            product.category}
        </span>
      ),
    },
    {
      key: "price",
      header: "Cena",
      sortable: true,
      render: (product) => (
        <span className="font-medium text-[var(--color-brand)]">
          €{getPrice(product).toFixed(2)}
        </span>
      ),
    },
    {
      key: "available",
      header: "Stav",
      render: (product) => (
        <button
          onClick={() => toggleMutation.mutate({ id: product.id })}
          disabled={toggleMutation.isPending}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            product.available
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {product.available ? "Dostupný" : "Nedostupný"}
        </button>
      ),
    },
    {
      key: "sortOrder",
      header: "Poradie",
      sortable: true,
      className: "w-20 text-center",
      render: (product) => (
        <span className="text-[var(--color-text-muted)]">
          {product.sortOrder}
        </span>
      ),
    },
  ];

  const productData: Product[] = (products ?? []).map((p) => ({
    ...p,
    price:
      typeof p.price === "object" && "toNumber" in p.price
        ? (p.price as { toNumber: () => number }).toNumber()
        : Number(p.price),
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Produkty
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Spravujte svoje produkty a menu
          </p>
        </div>
      </div>

      {/* Products table */}
      <DataTable
        data={productData as (Product & Record<string, unknown>)[]}
        columns={columns as Column<Product & Record<string, unknown>>[]}
        keyExtractor={(product) => (product as Product).id}
        searchable
        searchPlaceholder="Hľadať produkty..."
        searchKeys={["name", "description", "category"] as (keyof Product)[]}
        emptyMessage="Žiadne produkty"
        isLoading={isLoading}
        headerActions={
          <Button onClick={() => setIsCreateOpen(true)}>
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Pridať produkt
          </Button>
        }
        actions={(product) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(product as Product)}
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
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteProduct(product as Product)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </Button>
          </>
        )}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingProduct}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProduct(null);
          resetForm();
        }}
        title={editingProduct ? "Upraviť produkt" : "Nový produkt"}
        description={
          editingProduct
            ? "Upravte detaily produktu"
            : "Vyplňte údaje pre nový produkt"
        }
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              Zrušiť
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? "Uložiť zmeny" : "Vytvoriť"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Názov produktu"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
              placeholder="Margherita"
            />
            <Select
              label="Kategória"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={categoryOptions}
            />
          </div>

          <Textarea
            label="Popis"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Klasická pizza s paradajkovým základom..."
            rows={3}
          />

          <Input
            label="Ingrediencie"
            value={formData.ingredients}
            onChange={(e) =>
              setFormData({ ...formData, ingredients: e.target.value })
            }
            placeholder="paradajky, mozzarella, bazalka"
            hint="Oddeľte čiarkou"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Cena (€)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              error={errors.price}
              placeholder="9.90"
            />
            <Input
              label="Poradie zoradenia"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: e.target.value })
              }
              placeholder="0"
            />
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border)] px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                />
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Dostupný
                </span>
              </label>
            </div>
          </div>

          {/* Image picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Obrázok produktu
            </label>
            {formData.imageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)]">
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="h-40 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMediaOpen(true)}
                  >
                    Zmeniť
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    Odstrániť
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMediaOpen(true)}
                className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-warm)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mb-2 h-8 w-8 text-[var(--color-text-muted)]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  Vybrať obrázok
                </span>
              </button>
            )}
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
            )}
          </div>

          {/* Media Explorer Dialog */}
          <MediaExplorerDialog
            open={isMediaOpen}
            onClose={() => setIsMediaOpen(false)}
            onSelect={(urls) => {
              if (urls[0]) {
                setFormData({ ...formData, imageUrl: urls[0] });
              }
            }}
            initialSelection={formData.imageUrl ? [formData.imageUrl] : []}
            storagePath="/prima-vera-storage"
          />
        </div>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={() =>
          deleteProduct && deleteMutation.mutate({ id: deleteProduct.id })
        }
        title="Vymazať produkt?"
        description={`Naozaj chcete vymazať "${deleteProduct?.name}"? Táto akcia sa nedá vrátiť späť.`}
        confirmText="Vymazať"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
