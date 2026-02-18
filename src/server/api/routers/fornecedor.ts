import { createTRPCRouter } from "~/server/api/trpc";
import { protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const fornecedorRouter = createTRPCRouter({
  getEvery: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.fornecedor.findMany({
        where: {userId: ctx.session.user.id}
      });
    }),
  getAll: protectedProcedure
  .input(z.object({ searchTerm: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    return ctx.db.fornecedor.findMany({
      where: {
        userId: ctx.session.user.id,
        ...(input.searchTerm ? {
          OR: [
            { name: { contains: input.searchTerm, mode: "insensitive" } },
            { cnpj: { contains: input.searchTerm } },
            { email: { contains: input.searchTerm, mode: "insensitive" } },
          ]
        } : {})
      },
      include: { _count: { select: { products: true } } }
    });
  }),
    getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.fornecedor.findUnique({
        where: { id: input.id },
        include: {
          products: true, // Traz os produtos vinculados
          _count: { select: { products: true } }
        },
      });
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      cnpj: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.fornecedor.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Rota de Atualização (usada na página de detalhes)
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      cnpj: z.string().optional(),
      description: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.fornecedor.update({
        where: { id },
        data,
      });
    }),

  // Rota de Exclusão
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.fornecedor.delete({
        where: { id: input.id },
      });
    }),
});