import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { api } from "~/trpc/server";

export const clienteRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		let ownerId = userId;

		if (userRole === "FUNCIONARIO") {
			const funcionario = await ctx.db.funcionario.findFirst({
				where: { userId: userId },
				select: { creatorId: true },
			});

			if (funcionario?.creatorId) {
				ownerId = funcionario.creatorId;
			}
			if (!funcionario?.creatorId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Vínculo de funcionário não encontrado.",
				});
			}
		}

		return ctx.db.client.findMany({
			where: {
				userId: ownerId,
			},
			orderBy: { createdAt: "desc" },
		});
	}),
	lastPurchase: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const compra = await ctx.db.purchase.findFirst({
				where: {
					clientId: input.id,
				},
				include: {
					client: true,
				},
			});
			return compra?.createdAt ?? null;
		}),
	gastosTotais: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const compra = await ctx.db.purchase.findMany({
				where: {
					clientId: input.id,
				},
				include: {
					client: true,
				},
			});
			return (
				compra
					.reduce((total, compra) => total + Number(compra.total), 0)
					.toString() ?? "0"
			);
		}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "O nome é obrigatório"),
				phone: z.string().optional(),
				address: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.client.create({
				data: {
					name: input.name,
					phone: input.phone,
					address: input.address,
					status: "ATIVO",
					user: { connect: { id: ctx.session.user.id } },
				},
			});
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				phone: z.string().optional(),
				address: z.string().optional(),
				status: z.string().optional(), // "ATIVO" | "INATIVO"
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.client.update({
				where: { id: input.id },
				data: {
					name: input.name,
					phone: input.phone,
					address: input.address,
					status: input.status,
				},
			});
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.client.delete({
				where: { id: input.id },
			});
		}),
});
