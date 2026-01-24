"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Input } from "./Input";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  isLoading?: boolean;
  actions?: (item: T) => ReactNode;
  headerActions?: ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  searchable = false,
  searchPlaceholder = "Hľadať...",
  searchKeys = [],
  emptyMessage = "Žiadne dáta",
  isLoading = false,
  actions,
  headerActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery || searchKeys.length === 0) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === "string") {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === "number") {
          return value.toString().includes(query);
        }
        return false;
      }),
    );
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-[var(--color-bg-warm)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      {(searchable || headerActions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        {sortedData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[var(--color-text-muted)]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-warm)]">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)] ${
                        column.sortable
                          ? "cursor-pointer select-none hover:text-[var(--color-text)]"
                          : ""
                      } ${column.className ?? ""}`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {column.header}
                        {column.sortable && sortKey === column.key && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`h-3.5 w-3.5 transition-transform ${
                              sortOrder === "desc" ? "rotate-180" : ""
                            }`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text-secondary)]">
                      Akcie
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sortedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="transition-colors hover:bg-[var(--color-bg-warm)]"
                  >
                    {columns.map((column) => {
                      const value = item[column.key];
                      const displayValue =
                        value === null || value === undefined
                          ? ""
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value);
                      return (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-sm text-[var(--color-text)] ${column.className ?? ""}`}
                        >
                          {column.render ? column.render(item) : displayValue}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-muted)]">
        Zobrazených {sortedData.length} z {data.length} záznamov
      </p>
    </div>
  );
}
