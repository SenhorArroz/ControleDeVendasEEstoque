import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { clienteRouter } from "./routers/cliente";
import { salesRouter } from "./routers/compra";
import { productRouter } from "./routers/produto";
import { categoriaRouter } from "./routers/categoria";
import { fornecedorRouter } from "./routers/fornecedor";
import { despesaRouter } from "./routers/despesa";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	cliente: clienteRouter,
	categoria: categoriaRouter,
	fornecedor: fornecedorRouter,
	compra: salesRouter,
	produto: productRouter,
	despesa: despesaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
