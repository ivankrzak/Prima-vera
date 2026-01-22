import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { CartProvider } from "@/context/cart";
import { Header } from "./_components/Header";
import { CartDrawer } from "./_components/CartDrawer";

export const metadata: Metadata = {
  title: "Pizza Vera | Najlepšia pizza v Košiciach",
  description:
    "Objednajte si autentickú taliansku pizzu s doručením až k vám domov. Vernostný program s bodmi za každý nákup.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk" className={`${geist.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)]">
        <TRPCReactProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <CartDrawer />
          </CartProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
