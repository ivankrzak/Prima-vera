"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/server/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message ?? "Prihlásenie zlyhalo");
          setIsLoading(false);
          return;
        }

        router.push("/menu");
        router.refresh();
      } else {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          setError(result.error.message ?? "Registrácia zlyhala");
          setIsLoading(false);
          return;
        }

        // Auto sign-in after successful registration
        const signInResult = await authClient.signIn.email({
          email,
          password,
        });

        if (signInResult.error) {
          setError(
            "Registrácia úspešná, ale prihlásenie zlyhalo. Prihláste sa manuálne.",
          );
          setIsLoading(false);
          return;
        }

        // Redirect to loyalty program after sign-up
        router.push("/loyalty");
        router.refresh();
      }
    } catch {
      setError("Niečo sa pokazilo. Skúste to znova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      {/* Subtle pattern background */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c45c3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-light tracking-wider text-[var(--color-text)]">
            PRIMA
            <span className="font-semibold text-[var(--color-brand)]">
              VERA
            </span>
          </h1>
          <div className="mx-auto mt-3 h-px w-12 bg-[var(--color-brand)]" />
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            {isLogin ? "Vitajte späť!" : "Vytvorte si účet a zbierajte body"}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-sm">
          {/* Toggle */}
          <div className="mb-8 flex rounded-xl bg-[var(--color-bg-warm)] p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                isLogin
                  ? "bg-[var(--color-brand)] text-white shadow-lg"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Prihlásenie
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-[var(--color-brand)] text-white shadow-lg"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Registrácia
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Meno
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše meno"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] focus:outline-none"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.sk"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] focus:outline-none"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[var(--color-brand)] py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-brand-dark)] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Načítavam..."
                : isLogin
                  ? "Prihlásiť sa"
                  : "Vytvoriť účet"}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--color-bg-card)] px-4 text-[var(--color-text-secondary)]">
                  alebo
                </span>
              </div>
            </div>

            <button
              onClick={() => authClient.signIn.social({ provider: "google" })}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] py-4 font-medium text-[var(--color-text)] transition-all hover:border-[var(--color-text)] hover:bg-[var(--color-bg-warm)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Pokračovať cez Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Pokračovaním súhlasíte s našimi{" "}
          <Link
            href="/terms"
            className="text-[var(--color-brand)] transition-colors hover:text-white"
          >
            podmienkami používania
          </Link>
        </p>
      </div>
    </div>
  );
}
