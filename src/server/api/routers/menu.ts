import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

export const menuRouter = createTRPCRouter({
  /**
   * Get all available products (public)
   */
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          includeUnavailable: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: {
        category?: string;
        available?: boolean;
      } = {};

      if (input?.category) {
        where.category = input.category;
      }

      if (!input?.includeUnavailable) {
        where.available = true;
      }

      return ctx.db.product.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    }),

  /**
   * Get single product by ID (public)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findUnique({
        where: { id: input.id },
      });
    }),

  /**
   * Get all categories (public)
   */
  categories: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: { available: true },
      select: { category: true },
      distinct: ["category"],
    });
    return products.map((p) => p.category);
  }),

  // ============================================
  // ADMIN PROCEDURES
  // ============================================

  /**
   * Create a new product (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        ingredients: z.array(z.string()).optional().default([]),
        price: z.number().positive(),
        imageUrl: z.string().url().optional(),
        category: z.string().default("pizza"),
        available: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.create({
        data: {
          ...input,
          price: input.price,
        },
      });
    }),

  /**
   * Update a product (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        ingredients: z.array(z.string()).optional(),
        price: z.number().positive().optional(),
        imageUrl: z.string().url().optional().nullable(),
        category: z.string().optional(),
        available: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.product.update({
        where: { id },
        data,
      });
    }),

  /**
   * Toggle product availability (admin only)
   */
  toggleAvailability: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return ctx.db.product.update({
        where: { id: input.id },
        data: { available: !product.available },
      });
    }),

  /**
   * Delete a product (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.delete({
        where: { id: input.id },
      });
    }),
});
