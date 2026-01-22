import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-accent)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-12 w-12 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-light text-[var(--color-text)]">
          Objednávka{" "}
          <span className="font-serif text-[var(--color-brand)] italic">
            prijatá!
          </span>{" "}
          🎉
        </h1>

        <p className="mb-8 text-lg text-[var(--color-text-secondary)]">
          Ďakujeme za vašu objednávku. Čoskoro vás budeme kontaktovať.
        </p>

        <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-sm">
          <h2 className="mb-4 font-medium text-[var(--color-text)]">
            Čo bude nasledovať?
          </h2>
          <ol className="space-y-3 text-left text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs text-white">
                1
              </span>
              <span>Potvrdíme vašu objednávku telefonicky</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs text-white">
                2
              </span>
              <span>Pripravíme vašu pizzu s láskou</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs text-white">
                3
              </span>
              <span>Doručíme ju horúcu až k vám</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/menu"
            className="rounded-full bg-[var(--color-brand)] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[var(--color-brand-dark)]"
          >
            Objednať ďalšiu pizzu
          </Link>
        </div>
      </div>
    </div>
  );
}
