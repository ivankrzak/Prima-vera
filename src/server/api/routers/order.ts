import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  customerProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { OrderStatus, PaymentMethod, DeliveryType } from "@prisma/client";

// Points earned per EUR spent (configurable)
const POINTS_PER_EUR = 10;

export const orderRouter = createTRPCRouter({
  /**
   * Create a new order (supports both logged-in customers and guests)
   */
  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
          }),
        ),
        deliveryType: z.nativeEnum(DeliveryType),
        paymentMethod: z.nativeEnum(PaymentMethod),
        deliveryAddress: z.string().optional(),
        deliveryCity: z.string().optional(),
        deliveryPostalCode: z.string().optional(),
        deliveryPhone: z.string(),
        notes: z.string().optional(),
        usePoints: z.number().int().min(0).optional().default(0),
        // Guest checkout fields
        guestEmail: z.string().email().optional(),
        guestFirstName: z.string().optional(),
        guestLastName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is logged in and get customer if exists
      let customer = null;
      if (ctx.session?.user) {
        customer = await ctx.db.customer.findUnique({
          where: { userId: ctx.session.user.id },
        });

        // Auto-create customer profile if doesn't exist
        if (!customer) {
          customer = await ctx.db.customer.create({
            data: {
              userId: ctx.session.user.id,
              firstName: ctx.session.user.name?.split(" ")[0] ?? "",
              lastName:
                ctx.session.user.name?.split(" ").slice(1).join(" ") ?? "",
              phoneNumber: input.deliveryPhone,
            },
          });
        }
      }

      // For guest checkout, require guest info
      if (!customer && (!input.guestEmail || !input.guestFirstName)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Guest checkout requires email and first name",
        });
      }

      // Validate delivery address for delivery orders
      if (input.deliveryType === DeliveryType.DELIVERY) {
        if (!input.deliveryAddress || !input.deliveryCity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Delivery address is required for delivery orders",
          });
        }
      }

      // Fetch all products for the order
      const productIds = input.items.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: {
          id: { in: productIds },
          available: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some products are not available",
        });
      }

      // Calculate total price
      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalPrice = 0;

      const orderItems = input.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const itemTotal = Number(product.price) * item.quantity;
        totalPrice += itemTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: product.price,
        };
      });

      // Validate points usage (only for logged-in customers)
      const pointsToUse = customer
        ? Math.min(input.usePoints, customer.pointsBalance)
        : 0;
      const pointsDiscount = pointsToUse / 100; // 100 points = 1 EUR discount
      const finalPrice = Math.max(0, totalPrice - pointsDiscount);

      // Calculate points earned (only for logged-in customers)
      const pointsEarned = customer
        ? Math.floor(finalPrice * POINTS_PER_EUR)
        : 0;

      // Create order with items in a transaction
      const order = await ctx.db.$transaction(async (tx) => {
        // Create the order using Prisma.OrderUncheckedCreateInput for direct customerId usage
        const newOrder = await tx.order.create({
          data: {
            // Use customerId directly (undefined for guest orders)
            customerId: customer?.id,
            status: OrderStatus.PENDING,
            totalPrice: finalPrice,
            pointsEarned,
            pointsUsed: pointsToUse,
            deliveryType: input.deliveryType,
            paymentMethod: input.paymentMethod,
            // Guest info (only for guest checkout)
            guestEmail: customer ? null : input.guestEmail,
            guestFirstName: customer ? null : input.guestFirstName,
            guestLastName: customer ? null : input.guestLastName,
            // Delivery details
            deliveryAddress:
              input.deliveryAddress ?? customer?.deliveryAddress ?? "",
            deliveryCity: input.deliveryCity ?? customer?.city ?? "",
            deliveryPostalCode:
              input.deliveryPostalCode ?? customer?.postalCode ?? "",
            deliveryPhone: input.deliveryPhone ?? customer?.phoneNumber ?? "",
            notes: input.notes,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Update customer points (deduct used, add earned after delivery) - only for logged-in customers
        if (customer && pointsToUse > 0) {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              pointsBalance: { decrement: pointsToUse },
            },
          });

          // Log points transaction
          await tx.pointsTransaction.create({
            data: {
              customerId: customer.id,
              amount: -pointsToUse,
              reason: `Redeemed for Order #${newOrder.orderNumber}`,
              orderId: newOrder.id,
            },
          });
        }

        return newOrder;
      });

      return order;
    }),

  /**
   * Get customer's order history
   */
  myOrders: customerProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().default(10),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;

      const orders = await ctx.db.order.findMany({
        where: { customerId: ctx.customer.id },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),

  /**
   * Get a specific order by ID (customer only sees their own)
   */
  getById: customerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: {
          id: input.id,
          customerId: ctx.customer.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // ============================================
  // ADMIN PROCEDURES
  // ============================================

  /**
   * List all orders (admin only)
   */
  listAll: adminProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(OrderStatus).optional(),
          limit: z.number().int().positive().default(50),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;

      const orders = await ctx.db.order.findMany({
        where: input?.status ? { status: input.status } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),

  /**
   * Get active orders for kitchen display (admin only)
   */
  activeOrders: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.OUT_FOR_DELIVERY,
          ],
        },
      },
      orderBy: { createdAt: "asc" },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }),

  /**
   * Update order status (admin only)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
        include: { customer: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Award points when order is delivered
      if (
        input.status === OrderStatus.DELIVERED &&
        order.status !== OrderStatus.DELIVERED
      ) {
        await ctx.db.$transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id: input.id },
            data: { status: input.status },
          });

          // Award points to customer
          if (order.pointsEarned > 0) {
            await tx.customer.update({
              where: { id: order.customerId },
              data: {
                pointsBalance: { increment: order.pointsEarned },
              },
            });

            // Log points transaction
            await tx.pointsTransaction.create({
              data: {
                customerId: order.customerId,
                amount: order.pointsEarned,
                reason: `Earned from Order #${order.orderNumber}`,
                orderId: order.id,
              },
            });
          }
        });

        return ctx.db.order.findUnique({
          where: { id: input.id },
          include: {
            items: { include: { product: true } },
          },
        });
      }

      return ctx.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          items: { include: { product: true } },
        },
      });
    }),

  /**
   * Get order statistics (admin only)
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pendingOrders, todayRevenue] =
      await Promise.all([
        ctx.db.order.count(),
        ctx.db.order.count({
          where: { createdAt: { gte: today } },
        }),
        ctx.db.order.count({
          where: {
            status: {
              in: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
            },
          },
        }),
        ctx.db.order.aggregate({
          where: {
            createdAt: { gte: today },
            status: { not: OrderStatus.CANCELLED },
          },
          _sum: { totalPrice: true },
        }),
      ]);

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      todayRevenue: todayRevenue._sum.totalPrice ?? 0,
    };
  }),
});
