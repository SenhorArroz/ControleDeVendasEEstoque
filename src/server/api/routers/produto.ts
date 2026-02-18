import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
	cont: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.product.count();
	}),
	somaLifetimeStock: protectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.db.product.aggregate({
			where: { userId: ctx.session.user.id },
			_sum: { lifetimeStock: true },
		});
		return result._sum.lifetimeStock ?? 0;
	}),

	somaStock: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.product.aggregate({
			where: { userId: ctx.session.user.id },
			select: { stock: { _sum: true } },
		});
	}),
	getAll: protectedProcedure
    .input(
        z.object({
            searchTerm: z.string().optional(),
            categoryId: z.string().optional(),
        }),
    )
    .query(async ({ ctx, input }) => {
        return ctx.db.product.findMany({
            where: {
                userId: ctx.session.user.id,

                ...(input.categoryId ? {
                    categories: { some: { id: input.categoryId } }
                } : {}),

                ...(input.searchTerm ? {
                    OR: [
                        { name: { contains: input.searchTerm, mode: "insensitive" } },
                        { sku: { contains: input.searchTerm, mode: "insensitive" } },
                        {
                            codeBarras: {
                                some: {
                                    code: { contains: input.searchTerm },
                                },
                            },
                        },
                    ],
                } : {})
            },
            include: {
                codeBarras: true,
                categories: true,
            },
            take: 50,
        });
    }),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				sku: z.string().optional(),
				precoVenda: z.number(),
				precoCompra: z.number().optional(),
				stock: z.number(),
				unidadeMedida: z.string().optional(),
				peso: z.number().optional(),
				imageUrl: z.string().optional(),

				fornecedorId: z.string().min(1, "Selecione um fornecedor"),

				barcodes: z.array(z.string()),
				categoryIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.product.create({
				data: {
					userId: ctx.session.user.id,
					name: input.name,
					description: input.description,
					sku: input.sku,
					precoVenda: input.precoVenda,
					precoCompra: input.precoCompra,
					stock: input.stock,
					lifetimeStock: input.stock,
					unidadeMedida: input.unidadeMedida,
					peso: input.peso,
					imageUrl: input.imageUrl,
					fornecedorId: input.fornecedorId,

					codeBarras: {
						create: input.barcodes
							.filter((c) => c.trim() !== "")
							.map((code) => ({ code })),
					},

					categories: {
						connect: input.categoryIds.map((id) => ({ id })),
					},
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1),
				sku: z.string().optional(),
				precoVenda: z.number(),
				precoCompra: z.number(),
				stock: z.number(),
				unidadeMedida: z.string().optional(),
				peso: z.number().optional(),
				imageUrl: z.string().optional(),
				fornecedorId: z.string(),
				barcodes: z.array(z.string()),
				categoryIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.$transaction(async (tx) => {
				await tx.codigoDeBarras.deleteMany({ where: { productId: input.id } });

				return tx.product.update({
					where: { id: input.id },
					data: {
						name: input.name,
						sku: input.sku,
						precoVenda: input.precoVenda,
						precoCompra: input.precoCompra,
						stock: input.stock,
						unidadeMedida: input.unidadeMedida,
						peso: input.peso,
						imageUrl: input.imageUrl,
						fornecedorId: input.fornecedorId,

						codeBarras: {
							create: input.barcodes
								.filter((c) => c.trim() !== "")
								.map((code) => ({ code })),
						},

						categories: {
							set: input.categoryIds.map((id) => ({ id })),
						},
					},
				});
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.product.delete({ where: { id: input.id } });
		}),
});
