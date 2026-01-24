"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/trpc/react";
import { Button, Dialog } from "@/components/ui";

interface MediaFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  url: string;
}

interface MediaExplorerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  initialSelection?: string[];
  storagePath?: string; // e.g., "/prima-vera-storage"
}

export function MediaExplorerDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
  initialSelection = [],
  storagePath = "/prima-vera-storage",
}: MediaExplorerDialogProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [path, setPath] = useState(storagePath);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const {
    data: items,
    isLoading,
    error,
  } = api.media.list.useQuery({ path }, { enabled: open });

  const uploadMutation = api.media.upload.useMutation({
    onSuccess: () => {
      void utils.media.list.invalidate({ path });
    },
  });

  const deleteMutation = api.media.delete.useMutation({
    onSuccess: () => {
      void utils.media.list.invalidate({ path });
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedUrls(initialSelection);
      setPath(storagePath);
    }
  }, [open, initialSelection, storagePath]);

  const uploadFile = useCallback(
    async (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          if (base64) {
            try {
              await uploadMutation.mutateAsync({
                path: path.endsWith("/") ? path : `${path}/`,
                fileName: file.name,
                fileContent: base64,
              });
              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () =>
          reject(new Error(reader.error?.message ?? "Failed to read file"));
      });
    },
    [path, uploadMutation],
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file);
      }
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    if (confirm(`Naozaj chcete vymazať "${fileName}"?`)) {
      deleteMutation.mutate({
        path: path.endsWith("/") ? path : `${path}/`,
        fileName,
      });
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        return;
      }

      setIsUploading(true);
      try {
        for (const file of imageFiles) {
          await uploadFile(file);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile],
  );

  const handleDirectoryClick = (
    directoryPath: string,
    directoryName: string,
  ) => {
    setPath(`${directoryPath}${directoryName}`);
  };

  const goToParentDirectory = () => {
    if (path === storagePath) return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    setPath("/" + parts.join("/"));
  };

  const handleImageClick = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
      );
    } else {
      onSelect([url]);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedUrls);
    onClose();
  };

  const directories = (items?.filter((item: MediaFile) => item.IsDirectory) ??
    []) as MediaFile[];
  const files = (items?.filter((item: MediaFile) => !item.IsDirectory) ??
    []) as MediaFile[];
  const breadcrumbs = path.replace(storagePath, "").split("/").filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} title="Vybrať obrázok" size="xl">
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={goToParentDirectory}
            disabled={path === storagePath}
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
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </Button>
          <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-warm)] px-3 py-1.5 text-sm text-[var(--color-text-muted)]">
            <span
              className="cursor-pointer hover:text-[var(--color-brand)] hover:underline"
              onClick={() => setPath(storagePath)}
            >
              Root
            </span>
            {breadcrumbs.map((crumb, index) => {
              const crumbPath = `${storagePath}/${breadcrumbs.slice(0, index + 1).join("/")}`;
              return (
                <span key={index} className="flex items-center gap-1">
                  <span>/</span>
                  <span
                    className="cursor-pointer hover:text-[var(--color-brand)] hover:underline"
                    onClick={() => setPath(crumbPath)}
                  >
                    {crumb}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* File grid */}
        <div className="max-h-[400px] min-h-[200px] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
          {isLoading && (
            <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 md:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-[var(--color-bg-warm)]"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-red-600">Chyba pri načítaní médií</p>
            </div>
          )}

          {items && (
            <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 md:grid-cols-6">
              {/* Directories */}
              {directories.map((dir) => (
                <div
                  key={dir.Guid}
                  className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-warm)]"
                  onClick={() => handleDirectoryClick(dir.Path, dir.ObjectName)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="h-10 w-10 text-[var(--color-text-muted)]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                  <span className="w-full truncate text-center text-xs text-[var(--color-text-muted)]">
                    {dir.ObjectName}
                  </span>
                </div>
              ))}

              {/* Files */}
              {files.map((file) => {
                const isSelected = selectedUrls.includes(file.url);
                return (
                  <div
                    key={file.Guid}
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/30"
                        : "border-[var(--color-border)] hover:border-[var(--color-brand)]"
                    }`}
                    onClick={() => handleImageClick(file.url)}
                  >
                    {/* Selection indicator */}
                    {multiple && isSelected && (
                      <div className="absolute top-1 right-1 z-10 rounded-full bg-[var(--color-brand)] p-0.5 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, file.ObjectName)}
                      className="absolute top-1 left-1 z-10 rounded-lg bg-white/90 p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
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
                    </button>

                    <div className="aspect-square">
                      <Image
                        src={file.url}
                        alt={file.ObjectName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 16vw"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {directories.length === 0 && files.length === 0 && (
                <div className="col-span-full flex h-[150px] items-center justify-center">
                  <p className="text-[var(--color-text-muted)]">
                    Žiadne súbory
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drop zone / Upload */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
              : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`mb-2 h-8 w-8 ${isDragging ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
          <p className="mb-1 text-sm font-medium text-[var(--color-text)]">
            {isDragging ? "Pustite súbory sem" : "Pretiahnite súbory sem"}
          </p>
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">alebo</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            isLoading={isUploading}
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            Vybrať súbory
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />
        </div>

        {/* Footer for multiple selection */}
        {multiple && (
          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
            <Button variant="secondary" onClick={onClose}>
              Zrušiť
            </Button>
            <Button onClick={handleConfirmSelection}>
              Potvrdiť ({selectedUrls.length})
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
