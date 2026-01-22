import { z } from "zod";
import { createTRPCRouter, customerProcedure } from "@/server/api/trpc";

export const loyaltyRouter = createTRPCRouter({
  /**
   * Get current points balance and loyalty status
   */
  getBalance: customerProcedure.query(async ({ ctx }) => {
    const { customer } = ctx;

    // Calculate loyalty tier based on points
    const tier = calculateTier(customer.pointsBalance);

    return {
      pointsBalance: customer.pointsBalance,
      tier,
      pointsToNextTier: getPointsToNextTier(customer.pointsBalance),
    };
  }),

  /**
   * Get points transaction history
   */
  history: customerProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().default(20),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const transactions = await ctx.db.pointsTransaction.findMany({
        where: { customerId: ctx.customer.id },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined;
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),

  /**
   * Get loyalty program info (tiers, rewards, etc.)
   */
  programInfo: customerProcedure.query(() => {
    return {
      pointsPerEur: 10,
      pointsPerEurDiscount: 100, // 100 points = 1 EUR discount
      tiers: [
        {
          name: "Bronze",
          minPoints: 0,
          benefits: ["Earn 10 points per €1 spent"],
        },
        {
          name: "Silver",
          minPoints: 500,
          benefits: [
            "Earn 10 points per €1 spent",
            "Free delivery on orders over €15",
          ],
        },
        {
          name: "Gold",
          minPoints: 1500,
          benefits: [
            "Earn 10 points per €1 spent",
            "Free delivery on all orders",
            "Priority order preparation",
          ],
        },
        {
          name: "Platinum",
          minPoints: 5000,
          benefits: [
            "Earn 15 points per €1 spent",
            "Free delivery on all orders",
            "Priority order preparation",
            "Exclusive menu items",
          ],
        },
      ],
    };
  }),
});

// Helper functions
function calculateTier(points: number): string {
  if (points >= 5000) return "Platinum";
  if (points >= 1500) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function getPointsToNextTier(points: number): number | null {
  if (points >= 5000) return null; // Already at max tier
  if (points >= 1500) return 5000 - points;
  if (points >= 500) return 1500 - points;
  return 500 - points;
}
