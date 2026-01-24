import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const despesaRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				value: z.number().min(0.01),
				date: z.date().optional(), // Opcional, se não passar usa now()
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.despesas.create({
				data: {
					userId: ctx.session.user.id,
					name: input.name,
					description: input.description,
					value: input.value,
					date: input.date || new Date(),
				},
			});
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.despesas.delete({ where: { id: input.id } });
		}),
});
