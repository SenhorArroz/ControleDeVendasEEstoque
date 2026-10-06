import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const purchaseStatusSchema = z.enum(["PENDING", "COMPLETED", "CANCELED"]);

async function getOwnerId(ctx: { db: PrismaClient; session: { user: { id: string; role?: string | null } } }) {
	if (ctx.session.user.role !== "FUNCIONARIO") return ctx.session.user.id;

	const funcionario = await ctx.db.funcionario.findFirst({
		where: { userId: ctx.session.user.id },
		select: { creatorId: true },
	});

	return funcionario?.creatorId ?? ctx.session.user.id;
}

function revalidateSalesViews() {
	for (const path of ["/dashboard", "/financeiro", "/configuracoes", "/historico", "/produtos", "/clientes"]) {
		revalidatePath(path);
	}
}

export const salesRouter = createTRPCRouter({
	// --- 1. BUSCAR CLIENTES (Para o Dropdown) ---
	getClients: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.client.findMany({
			where: { userId: ctx.session.user.id, status: "ATIVO" },
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		});
	}),

	// --- 2. BUSCAR PRODUTOS (Para o Catálogo) ---
	getProducts: protectedProcedure
		.input(
			z.object({
				searchTerm: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.product.findMany({
				where: {
					userId: ctx.session.user.id,
					// Filtra por nome se houver termo de busca
					name: input.searchTerm
						? { contains: input.searchTerm, mode: "insensitive" }
						: undefined,
					// Opcional: Se quiser esconder produtos sem estoque, descomente abaixo:
					// stock: { gt: 0 }
				},
				orderBy: { name: "asc" },
			});
		}),
	// --- 2.1. CONTAR ITENS VENDIDOS (Para o Dashboard) ---
	itensVendidosCont: protectedProcedure.query(async ({ ctx }) => {
		const ownerId = await getOwnerId(ctx);
		// Soma itens de vendas que ainda impactam estoque (pendentes ou concluídas).
		const result = await ctx.db.purchaseItem.aggregate({
			where: {
				purchase: {
					userId: ownerId,
					status: { in: ["PENDING", "COMPLETED"] },
				},
			},
			_sum: {
				quantity: true,
			},
		});
		return result._sum.quantity || 0;
	}),

	// --- 3. CRIAR A VENDA (A Mágica acontece aqui) ---
	create: protectedProcedure
		.input(
			z.object({
				clientId: z.string(),
				status: z.enum(["PENDING", "COMPLETED"]),
				total: z.number(),
				paymentMethod: z.string(),
				desconto: z.number().optional(),
				items: z.array(
					z.object({
						productId: z.string(),
						quantity: z.number(),
						unitPrice: z.number(),
						barcodeId: z.string().optional(), // ID do código na tabela codigoDeBarras
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getOwnerId(ctx);

			const purchase = await ctx.db.$transaction(async (tx) => {
				const client = await tx.client.findFirst({
					where: { id: input.clientId, userId: ownerId },
					select: { id: true },
				});
				if (!client) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado." });
				}

				// 1. Criar a Compra (Cabeçalho)
				const purchase = await tx.purchase.create({
					data: {
						userId: ownerId,
						clientId: input.clientId,
						status: input.status,
						total: input.total,
						date: new Date(),
						metodoPagamento: input.paymentMethod,
						desconto: input.desconto ?? 0,
					},
				});

				// 2. Processar cada item da compra
				for (const item of input.items) {
					const product = await tx.product.findFirst({
						where: { id: item.productId, userId: ownerId },
						select: { id: true, stock: true },
					});
					if (!product) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });
					}
					if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
						throw new TRPCError({ code: "BAD_REQUEST", message: "A quantidade deve ser um inteiro positivo." });
					}

					let barcodeString = null;
					let productNameSnapshot = "";

					// SE TIVER CÓDIGO DE BARRAS: Precisamos buscar os dados antes de deletar/processar
					if (item.barcodeId) {
						const barcodeData = await tx.codigoDeBarras.findUnique({
							where: { id: item.barcodeId },
							include: { product: true }, // Traz o produto para pegar o nome atual
						});

						if (!barcodeData || barcodeData.productId !== item.productId || barcodeData.product.userId !== ownerId) {
							throw new TRPCError({ code: "BAD_REQUEST", message: "Código de barras inválido para este produto." });
						}

						barcodeString = barcodeData.code;
						productNameSnapshot = barcodeData.product.name;
					}

					// A. Registrar o Item na Venda
					await tx.purchaseItem.create({
						data: {
							purchaseId: purchase.id,
							productId: item.productId,
							quantity: item.quantity,
							unitPrice: item.unitPrice,
							// Salva o código visualmente neste item para conferência rápida
							recordedBarcode: barcodeString,
						},
					});

					// B. Baixar o Estoque Geral do Produto (Estoque Atual)
					// NOTA: Não mexemos no `lifetimeStock` aqui, pois ele é histórico de entradas.
					const stockUpdate = await tx.product.updateMany({
						where: { id: item.productId, userId: ownerId, stock: { gte: item.quantity } },
						data: { stock: { decrement: item.quantity } },
					});
					if (stockUpdate.count !== 1) {
						throw new TRPCError({ code: "BAD_REQUEST", message: "Estoque insuficiente para concluir a venda." });
					}

					// C. Lógica do Código de Barras (Apenas Histórico — sem exclusão)
					if (item.barcodeId && barcodeString) {
						// CRIAR LOG PERMANENTE para rastreio de vendas
						await tx.soldBarcodeLog.create({
							data: {
								barcode: barcodeString,
								productName: productNameSnapshot,
								purchaseId: purchase.id,
								soldAt: new Date(),
							},
						});

						// O código de barras NÃO é mais deletado da tabela codigoDeBarras.
						// Ele permanece no estoque ativo para reutilização futura.
					}
				}

				return purchase;
			});

			revalidateSalesViews();
			return purchase;
		}),
	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: purchaseStatusSchema,
				metodoPagamento: z.string().optional(), // <-- 1. ADICIONE ESTA LINHA
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getOwnerId(ctx);
			const purchase = await ctx.db.purchase.findFirst({
				where: { id: input.id, userId: ownerId },
				include: { items: true },
			});
			if (!purchase) throw new TRPCError({ code: "NOT_FOUND", message: "Venda não encontrada." });

			const result = await ctx.db.$transaction(async (tx) => {
				if (purchase.status !== "CANCELED" && input.status === "CANCELED") {
					for (const item of purchase.items) {
						await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
					}
				} else if (purchase.status === "CANCELED" && input.status !== "CANCELED") {
					for (const item of purchase.items) {
						const stockUpdate = await tx.product.updateMany({
							where: { id: item.productId, userId: ownerId, stock: { gte: item.quantity } },
							data: { stock: { decrement: item.quantity } },
						});
						if (stockUpdate.count !== 1) throw new TRPCError({ code: "BAD_REQUEST", message: "Estoque insuficiente para reativar a venda." });
					}
				}

				return tx.purchase.update({
					where: { id: purchase.id },
					data: { status: input.status, ...(input.metodoPagamento && { metodoPagamento: input.metodoPagamento }) },
				});
			});
			revalidateSalesViews();
			return result;
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getOwnerId(ctx);
			const result = await ctx.db.$transaction(async (tx) => {
				// 1. Busca a compra e os itens atrelados a ela
				const purchase = await tx.purchase.findFirst({
					where: { id: input.id, userId: ownerId },
					include: { items: true },
				});

				if (!purchase) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Compra não encontrada.",
					});
				}

				// 2. Devolve os itens para o estoque do produto
				if (purchase.status !== "CANCELED") {
					for (const item of purchase.items) {
						await tx.product.update({
							where: { id: item.productId },
							data: { stock: { increment: item.quantity } },
						});
					}
				}

				// 3. Deleta a compra (O 'onDelete: Cascade' no banco cuidará de apagar os purchaseItems atrelados)
				const result = await tx.purchase.delete({
					where: { id: input.id },
				});
				return result;
			});
			revalidateSalesViews();
			return result;
		}),

});
