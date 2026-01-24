import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";

export const customerRouter = createTRPCRouter({
  /**
   * List all customers (admin only)
   */
  list: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          limit: z.number().min(1).max(100).optional().default(50),
          offset: z.number().min(0).optional().default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where = input?.search
        ? {
            OR: [
              {
                firstName: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                lastName: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                user: {
                  email: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {};

      const [customers, total] = await Promise.all([
        ctx.db.customer.findMany({
          where,
          include: {
            user: {
              select: {
                email: true,
                createdAt: true,
              },
            },
            orders: {
              select: {
                id: true,
                totalPrice: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.db.customer.count({ where }),
      ]);

      // Calculate stats for each customer
      const customersWithStats = customers.map((customer) => {
        const totalSpent = customer.orders.reduce(
          (sum, order) => sum + Number(order.totalPrice),
          0,
        );
        const orderCount = customer.orders.length;

        return {
          ...customer,
          totalSpent,
          orderCount,
        };
      });

      return {
        customers: customersWithStats,
        total,
      };
    }),

  /**
   * Get a single customer by ID (admin only)
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!customer) {
        return null;
      }

      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.totalPrice),
        0,
      );

      return {
        ...customer,
        totalSpent,
        orderCount: customer.orders.length,
      };
    }),

  /**
   * Get customer stats summary (admin only)
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalCustomers, customersThisMonth, topSpenders] = await Promise.all(
      [
        ctx.db.customer.count(),
        ctx.db.customer.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        ctx.db.customer.findMany({
          include: {
            orders: {
              select: { totalPrice: true },
            },
          },
          take: 5,
        }),
      ],
    );

    // Sort top spenders by total spent
    const topSpendersSorted = topSpenders
      .map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalCustomers,
      customersThisMonth,
      topSpenders: topSpendersSorted,
    };
  }),

  /**
   * Update customer points (admin only)
   */
  updatePoints: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        amount: z.number(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Update customer points balance
        const customer = await tx.customer.update({
          where: { id: input.customerId },
          data: {
            pointsBalance: { increment: input.amount },
          },
        });

        // Log the transaction
        await tx.pointsTransaction.create({
          data: {
            customerId: input.customerId,
            amount: input.amount,
            reason: input.reason,
          },
        });

        return customer;
      });
    }),
});
