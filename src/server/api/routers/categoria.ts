import { createTRPCRouter } from "~/server/api/trpc";
import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const categoriaRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.category.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				_count: {
					select: { products: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}),
	create: protectedProcedure
		.input(z.object({ name: z.string(), color: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.category.create({
				data: {
					name: input.name,
					color: input.color,
					userId: ctx.session.user.id,
				},
			});
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.category.delete({
				where: {
					id: input.id,
				},
			});
		}),
    update: protectedProcedure
        .input(z.object({ id: z.string(), name: z.string(), color: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.category.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    color: input.color,
                },
            });
        }),
});
