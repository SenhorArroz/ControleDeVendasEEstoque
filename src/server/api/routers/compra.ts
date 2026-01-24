import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
				take: 20, // Limita a 20 para não pesar a tela
			});
		}),
	// --- 2.1. CONTAR ITENS VENDIDOS (Para o Dashboard) ---
	itensVendidosCont: protectedProcedure.query(async ({ ctx }) => {
		// Soma a quantidade de todos os itens registrados em compras concluídas
		const result = await ctx.db.purchaseItem.aggregate({
			where: {
				purchase: {
					userId: ctx.session.user.id,
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
				status: z.string(), // "PENDING" | "COMPLETED"
				total: z.number(),
				paymentMethod: z.string(),
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
			const userId = ctx.session.user.id;

			return ctx.db.$transaction(async (tx) => {
				// 1. Criar a Compra (Cabeçalho)
				const purchase = await tx.purchase.create({
					data: {
						userId: userId,
						clientId: input.clientId,
						status: input.status,
						total: input.total,
						date: new Date(),
						metodoPagamento: input.paymentMethod,
					},
				});

				// 2. Processar cada item da compra
				for (const item of input.items) {
					let barcodeString = null;
					let productNameSnapshot = "";

					// SE TIVER CÓDIGO DE BARRAS: Precisamos buscar os dados antes de deletar/processar
					if (item.barcodeId) {
						const barcodeData = await tx.codigoDeBarras.findUnique({
							where: { id: item.barcodeId },
							include: { product: true }, // Traz o produto para pegar o nome atual
						});

						if (barcodeData) {
							barcodeString = barcodeData.code;
							productNameSnapshot = barcodeData.product.name;
						}
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
					await tx.product.update({
						where: { id: item.productId },
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
					});

					// C. Lógica do Código de Barras (Histórico + Exclusão)
					if (item.barcodeId && barcodeString) {
						// 1. CRIAR LOG PERMANENTE (O que você pediu: armazenar os vendidos)
						await tx.soldBarcodeLog.create({
							data: {
								barcode: barcodeString,
								productName: productNameSnapshot, // Salva o nome caso o produto seja apagado depois
								purchaseId: purchase.id,
								soldAt: new Date(),
							},
						});

						// 2. APAGAR DO ESTOQUE ATIVO (Sua lógica original)
						// Isso remove da tabela de códigos disponíveis para venda, mas o log acima mantém o histórico.
						await tx.codigoDeBarras.delete({
							where: {
								id: item.barcodeId,
							},
						});
					}
				}

				return purchase;
			});
		}),
	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.string(), // "PENDING" | "COMPLETED" | "CANCELED"
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.purchase.update({
				where: { id: input.id },
				data: { status: input.status },
			});
		}),
});
