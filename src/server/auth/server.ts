import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oAuthProxy, username } from "better-auth/plugins";
import { db } from "../db";
import { env } from "process";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
}) {
  const config = {
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      username(),
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
    ],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId:
          "158852852369-se5g2eo0gbbs95e01m4bl0qm9619fec9.apps.googleusercontent.com",
        clientSecret: "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",
      },
    },
    trustedOrigins: [
      "expo://",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];

const baseUrl =
  env.VERCEL_ENV === "production"
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "turbo.t3.gg"}`,
  secret: env.AUTH_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
